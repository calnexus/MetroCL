var Timepicker = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.picker = null;
        this.isOpen = false;
        this.value = [];

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        value: "00:00:00",
        distance: 3,
        hours: true,
        minutes: true,
        seconds: false,
        duration: METRO_ANIMATION_DURATION,
        scrollSpeed: 5,
        clsPicker: "",
        clsPart: "",
        clsHours: "",
        clsMinutes: "",
        clsSeconds: "",
        clsAmPm: "",
        onTimepickerCreate: Metro.noop
    },

    _setOptionsFromDOM: function(){
        var that = this, element = this.element, o = this.options;

        $.each(element.data(), function(key, value){
            if (key in o) {
                try {
                    o[key] = JSON.parse(value);
                } catch (e) {
                    o[key] = value;
                }
            }
        });
    },

    _create: function(){
        var that = this, element = this.element, o = this.options;
        var i;

        if (o.distance < 1) {
            o.distance = 1;
        }

        this.value = Utils.strToArray(element.val() !== "" ? element.val() : o.value, ":");

        for(i = 0; i < 3; i++) {
            if (this.value[i] === undefined || this.value[i] === null) {
                this.value[i] = 0;
            } else {
                this.value[i] = parseInt(this.value[i]);
            }
        }

        this._createStructure();
        this._createEvents();
        this._set();

        Utils.exec(o.onTimepickerCreate, [element]);
    },

    _createStructure: function(){
        var that = this, element = this.element, o = this.options;
        var picker, hours, minutes, seconds, ampm, select, i;
        var timeWrapper, selectWrapper, selectBlock, actionBlock;

        var prev = element.prev();
        var parent = element.parent();
        var id = Utils.elementId("timepicker");

        picker = $("<label>").addClass("wheelpicker timepicker " + String(element[0].className).replace("d-block", "d-flex")).addClass(o.clsPicker);

        if (prev.length === 0) {
            parent.prepend(picker);
        } else {
            picker.insertAfter(prev);
        }

        element.appendTo(picker);


        timeWrapper = $("<div>").addClass("time-wrapper").appendTo(picker);

        if (o.hours === true) {
            hours = $("<div>").addClass("hours").appendTo(timeWrapper);
        }
        if (o.minutes === true) {
            minutes = $("<div>").addClass("minutes").appendTo(timeWrapper);
        }
        if (o.seconds === true) {
            seconds = $("<div>").addClass("seconds").appendTo(timeWrapper);
        }

        selectWrapper = $("<div>").addClass("select-wrapper").appendTo(picker);

        selectBlock = $("<div>").addClass("select-block").appendTo(selectWrapper);
        if (o.hours === true) {
            hours = $("<ul>").addClass("sel-hours").appendTo(selectBlock);
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(hours);
            for (i = 0; i < 24; i++) {
                $("<li>").addClass("js-hours-"+i).html(i < 10 ? "0"+i : i).data("value", i).appendTo(hours);
            }
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(hours);
        }
        if (o.minutes === true) {
            minutes = $("<ul>").addClass("sel-minutes").appendTo(selectBlock);
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(minutes);
            for (i = 0; i < 60; i++) {
                $("<li>").addClass("js-minutes-"+i).html(i < 10 ? "0"+i : i).data("value", i).appendTo(minutes);
            }
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(minutes);
        }
        if (o.seconds === true) {
            seconds = $("<ul>").addClass("sel-seconds").appendTo(selectBlock);
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(seconds);
            for (i = 0; i < 60; i++) {
                $("<li>").addClass("js-seconds-"+i).html(i < 10 ? "0"+i : i).data("value", i).appendTo(seconds);
            }
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(seconds);
        }

        selectBlock.height((o.distance * 2 + 1) * 40);

        actionBlock = $("<div>").addClass("action-block").appendTo(selectWrapper);
        $("<button>").addClass("button action-ok").html("<span class='default-icon-check'></span>").appendTo(actionBlock);
        $("<button>").addClass("button action-cancel").html("<span class='default-icon-cross'></span>").appendTo(actionBlock);

        this.picker = picker;
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;
        var picker = this.picker;

        picker.on(Metro.events.start, ".select-block ul", function(e){
            var target = this;
            var pageY = Utils.pageXY(e).y;

            $(document).on(Metro.events.move + "-picker", function(e){

                target.scrollTop -= o.scrollSpeed * (pageY  > Utils.pageXY(e).y ? -1 : 1);

                pageY = Utils.pageXY(e).y;
            });

            $(document).on(Metro.events.stop + "-picker", function(e){
                $(document).off(Metro.events.move + "-picker");
                $(document).off(Metro.events.stop + "-picker");
            });
        });

        picker.on(Metro.events.click, function(){
            if (that.isOpen === false) that.open();
        });

        picker.on(Metro.events.click, ".action-ok", function(e){
            var h, m, s, a;

            h = picker.find(".sel-hours li.active").data("value");
            m = picker.find(".sel-minutes li.active").data("value");
            s = picker.find(".sel-seconds li.active").data("value");

            that.value = [h, m, s];
            that._set();

            that.close();
            e.stopPropagation();
        });

        picker.on(Metro.events.click, ".action-cancel", function(e){
            that.close();
            e.stopPropagation();
        });

        this._addScrollEvents();
    },

    _addScrollEvents: function(){
        var picker = this.picker, o = this.options;
        var lists = ['hours', 'minutes', 'seconds'];
        $.each(lists, function(){
            var list_name = this;
            var list = picker.find(".sel-" + list_name);

            if (list.length === 0) return ;

            list.on(Metro.events.scrollStart, function(){
                list.find(".active").removeClass("active");
            });
            list.on(Metro.events.scrollStop, function(){

                var target = Math.round((Math.ceil(list.scrollTop() + 40) / 40)) - 1;
                var target_element = list.find(".js-"+list_name+"-"+target);
                var scroll_to = target_element.position().top - (o.distance * 40) + list.scrollTop();

                list.animate({
                    scrollTop: scroll_to
                }, o.duration, function(){
                    target_element.addClass("active")
                });
            });
        });
    },

    _removeScrollEvents: function(){
        var picker = this.picker;
        var lists = ['hours', 'minutes', 'seconds'];
        $.each(lists, function(){
            picker.find(".sel-" + this).off("scrollstart scrollstop");
        });
    },

    _set: function(){
        var that = this, element = this.element, o = this.options;
        var picker = this.picker;
        var h, m, s;

        if (o.hours === true) {
            h = this.value[0];
            if (h < 10) {
                h = "0"+h;
            }
            picker.find(".hours").html(h);
        }
        if (o.minutes === true) {
            m = this.value[1];
            if (m < 10) {
                m = "0"+m;
            }
            picker.find(".minutes").html(m);
        }
        if (o.seconds === true) {
            s = this.value[2];
            if (s < 10) {
                s = "0"+s;
            }
            picker.find(".seconds").html(s);
        }
    },

    open: function(){
        var that  = this, element = this.element, o = this.options;
        var picker = this.picker;
        var h, m, s;
        var h_list, m_list, s_list, a_list;

        picker.find(".select-wrapper").show();
        picker.find("li").removeClass("active");

        if (o.hours === true) {
            h = this.value[0];
            h_list = picker.find(".sel-hours");
            h_list.scrollTop(0).animate({
                scrollTop: h_list.find("li").eq(h).addClass("active").position().top
            });
        }
        if (o.minutes === true) {
            m = this.value[1];
            m_list = picker.find(".sel-minutes");
            m_list.scrollTop(0).animate({
                scrollTop: m_list.find("li").eq(m).addClass("active").position().top
            });
        }
        if (o.seconds === true) {
            s = this.value[2];
            s_list = picker.find(".sel-seconds");
            s_list.scrollTop(0).animate({
                scrollTop: s_list.find("li").eq(s).addClass("active").position().top
            });
        }

        this.isOpen = true;
    },

    close: function(){
        var picker = this.picker;
        picker.find(".select-wrapper").hide();
        this.isOpen = false;
    },

    time: function(t){
        if (t === undefined) {
            return element.val();
        }
        this.value = t;
        this._set();
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('timepicker', Timepicker);