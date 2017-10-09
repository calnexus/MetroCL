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
        source: null,
        data: null,
        onCreate: function(){}
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
    },

    build: function(){
        var that = this, element = this.element, o = this.options, data = this.data;
        var streams = $("<div>").addClass("streams").appendTo(element);
        var events_area = $("<div>").addClass("events-area").appendTo(element);
        var timeline = $("<ul>").addClass("streamer-timeline").appendTo(events_area);
        var streamer_events = $("<div>").addClass("streamer-events").appendTo(events_area);
        var event_group_main = $("<div>").addClass("event-group").appendTo(streamer_events);

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

            $("<li>").html("<em>"+v+"</em>").appendTo(timeline);
        }

        // -- End timeline creator

        if (data.streams !== undefined) {
            $.each(data.streams, function(){
                var item = this;
                var stream = $("<div>").addClass("stream").addClass(this.cls).appendTo(streams);

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
                    $.each(this.events, function(){
                        var event = $("<div>")
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
                    });
                }
            });
        }

        if (data.global !== undefined) {
            console.log(data.global);
            if (data.global.before !== undefined) {
                console.log("before");
                $.each(data.global.before, function(){
                    console.log("ku");
                    var group = $("<div>").addClass("event-group").addClass("size-"+this.size+"x").insertBefore(event_group_main);
                    var events = $("<div>").addClass("stream-events global-stream").appendTo(group);
                    var event = $("<div>").addClass("stream-event").html(this.html).appendTo(events);
                });
            }
        }

        Utils.exec(o.onCreate, [element]);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('streamer', Streamer);