var Streamer = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.data = null;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        startFrom: null,
        startSlideSleep: 1000,
        source: null,
        data: null,
        eventClick: "select",
        onStreamClick: Metro.noop,
        onStreamSelect: Metro.noop,
        onEventClick: Metro.noop,
        onEventSelect: Metro.noop,
        onCreate: Metro.noop
    },

    _setOptionsFromDOM: function(){
        var that = this, element = this.element, o = this.options;

        $.each(element.data(), function(key, value){
            if (key in o) {
                try {
                    o[key] = $.parseJSON(value);
                } catch (e) {
                    o[key] = value;
                }
            }
        });
    },

    _create: function(){
        var that = this, element = this.element, o = this.options;

        element.addClass("streamer");

        if (o.source === null && o.data === null) {
            return false;
        }

        if (o.source !== null) {
            $.get(o.source, function(data){
                that.data = data;
                that.build();
            });
        } else {
            this.data = o.data;
            this.build();
        }

        if (Utils.detectChrome() === true && Utils.isTouchDevice() === false) {
            $("<p>").addClass("text-small text-muted").html("*) In Chrome browser please press and hold Shift and turn the mouse wheel.").insertAfter(element);
        }

        $(element).on('mousewheel DOMMouseScroll', ".events-area", function(event){
            var delta = Math.max(-1, Math.min(1, (event.originalEvent.wheelDelta || -event.originalEvent.detail)));
            var scroll = $(this).scrollLeft() - ( delta * 40 );
            $(this).scrollLeft( scroll );
            event.preventDefault();
        });
    },

    build: function(){
        var that = this, element = this.element, o = this.options, data = this.data;
        var streams = $("<div>").addClass("streams").appendTo(element);
        var events_area = $("<div>").addClass("events-area").appendTo(element);
        var timeline = $("<ul>").addClass("streamer-timeline").appendTo(events_area);
        var streamer_events = $("<div>").addClass("streamer-events").appendTo(events_area);
        var event_group_main = $("<div>").addClass("event-group").appendTo(streamer_events);
        var StreamerIDS = Utils.getURIParameter(null, "StreamerIDS");
        var StreamerIDS_a = StreamerIDS ? StreamerIDS.split(",") : [];

        if (data.actions !== undefined) {
            var actions = $("<div>").addClass("streamer-actions").appendTo(streams);
            $.each(data.actions, function(){
                var item = this;
                var button = $("<button>").addClass("streamer-action").addClass(item.cls).html(item.html);
                if (item.onclick !== undefined) button.on("click", function(){
                    Utils.exec(item.onclick, [element]);
                });
                button.appendTo(actions);
            });
        }

        // Create timeline

        if (data.timeline === undefined) {
            data.timeline = {
                start: "09:00",
                stop: "18:00",
                step: 20
            }
        }

        var start = new Date(), stop = new Date();
        var start_time_array = data.timeline.start ? data.timeline.start.split(":") : [9,0];
        var stop_time_array = data.timeline.stop ? data.timeline.stop.split(":") : [18,0];
        var step = data.timeline.step ? parseInt(data.timeline.step) * 60 : 1200;

        start.setHours(start_time_array[0]);
        start.setMinutes(start_time_array[1]);
        start.setSeconds(0);

        stop.setHours(stop_time_array[0]);
        stop.setMinutes(stop_time_array[1]);
        stop.setSeconds(0);

        for (var i = start.getTime()/1000; i <= stop.getTime()/1000; i += step) {
            var t = new Date(i * 1000);
            var h = t.getHours(), m = t.getMinutes();
            var v = (h < 10 ? "0"+h : h) + ":" + (m < 10 ? "0"+m : m);

            $("<li>").data("time", v).addClass("js-time-point-" + v.replace(":", "-")).html("<em>"+v+"</em>").appendTo(timeline);
        }

        // -- End timeline creator

        if (data.streams !== undefined) {
            $.each(data.streams, function(stream_index){
                var item = this;
                var stream = $("<div>").addClass("stream").addClass(this.cls).appendTo(streams);
                stream.data("one", false);

                $("<div>").addClass("stream-title").html(this.title).appendTo(stream);
                $("<div>").addClass("stream-secondary").html(this.secondary).appendTo(stream);
                $(this.icon).addClass("stream-icon").appendTo(stream);

                var bg = Utils.computedRgbToHex(Utils.getStyleOne(stream, "background-color"));
                var fg = Utils.computedRgbToHex(Utils.getStyleOne(stream, "color"));

                var stream_events = $("<div>").addClass("stream-events")
                    .data("background-color", bg)
                    .data("text-color", fg)
                    .appendTo(event_group_main);

                if (this.events !== undefined) {
                    $.each(this.events, function(event_index){
                        var sid = stream_index+":"+event_index;
                        var event = $("<div>")
                            .data("id", sid)
                            .addClass("stream-event")
                            .addClass("size-"+this.size+"x")
                            .addClass("shift-"+this.shift+"x")
                            .appendTo(stream_events);
                        var slide = $("<div>").addClass("stream-event-slide").appendTo(event);
                        var slide_logo = $("<div>").addClass("slide-logo").appendTo(slide);
                        var slide_data = $("<div>").addClass("slide-data").appendTo(slide);

                        $("<img>").addClass("icon").attr("src", this.icon).appendTo(slide_logo);
                        $("<span>").addClass("time").css({
                            backgroundColor: bg,
                            color: fg
                        }).html(this.time).appendTo(slide_logo);

                        $("<div>").addClass("title").html(this.title).appendTo(slide_data);
                        $("<div>").addClass("subtitle").html(this.subtitle).appendTo(slide_data);
                        $("<div>").addClass("desc").html(this.desc).appendTo(slide_data);

                        if (StreamerIDS_a.indexOf(sid) !== -1) {
                            event.addClass("selected");
                        }
                    });
                }
            });
        }

        if (data.global !== undefined) {
            if (data.global.before !== undefined) {
                $.each(data.global.before, function(){
                    var group = $("<div>").addClass("event-group").addClass("size-"+this.size+"x").insertBefore(event_group_main);
                    var events = $("<div>").addClass("stream-events global-stream").appendTo(group);
                    var event = $("<div>").addClass("stream-event").html(this.html).appendTo(events);
                });
            }
        }

        element.on("click", ".stream-event", function(e){
            var event = $(this);
            if (o.eventClick === 'select') {
                event.toggleClass("selected");
                Utils.exec(o.onEventSelect, [event, event.hasClass("selected")]);
            } else {
                Utils.exec(o.onEventClick, [event]);
            }
        });

        element.on("click", ".stream", function(e){
            var stream = $(this);
            var index = stream.index();

            if (element.data("stream") === index) {
                element.find(".stream-event").removeClass("disabled");
                element.data("stream", -1);
            } else {
                element.data("stream", index);
                element.find(".stream-event").addClass("disabled");
                that.enableStream(stream);
                Utils.exec(o.onStreamSelect, [stream]);
            }

            Utils.exec(o.onStreamClick, [stream]);
        });

        element.data("stream", -1);

        if (o.startFrom !== null) {
            setTimeout(function(){
                that.slideTo(o.startFrom);
            }, o.startSlideSleep);
        }

        Utils.exec(o.onCreate, [element]);
    },

    slideTo: function(time){
        var that = this, element = this.element, o = this.options, data = this.data;
        var target;
        if (time === undefined) {
            target = $(element.find(".streamer-timeline li")[0]);
        } else {
            target = $(element.find(".streamer-timeline .js-time-point-" + time.replace(":", "-"))[0]);
        }

        element.find(".events-area").animate({
            scrollLeft: target[0].offsetLeft - element.find(".streams").width()
        }, METRO_ANIMATION_DURATION);
    },

    enableStream: function(stream){
        var that = this, element = this.element, o = this.options, data = this.data;
        var index = stream.index();
        stream.removeClass("disabled").data("streamDisabled", false);
        element.find(".stream-events").eq(index).find(".stream-event").removeClass("disabled");
    },

    disableStream: function(stream){
        var that = this, element = this.element, o = this.options, data = this.data;
        var index = stream.index();
        stream.addClass("disabled").data("streamDisabled", true);
        element.find(".stream-events").eq(index).find(".stream-event").addClass("disabled");
    },

    toggleStream: function(stream){
        if (stream.data("streamDisabled") === true) {
            this.enableStream(stream);
        } else {
            this.disableStream(stream);
        }
    },

    getLink: function(){
        var that = this, element = this.element, o = this.options, data = this.data;
        var events = element.find(".stream-event");
        var a = [];
        var link;
        var origin = window.location.href;

        $.each(events, function(){
            var event = $(this);
            if (event.data("id") === undefined || !event.hasClass("selected")) {
                return;
            }

            a.push(event.data("id"));
        });

        link = a.join(",");

        return Utils.updateURIParameter(origin, "StreamerIDS", link);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('streamer', Streamer);