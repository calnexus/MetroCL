var Timepicker = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.picker = null;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        distance: 3,
        hours: true,
        minutes: true,
        seconds: false,
        h12: true,
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

        this._createStructure();
        this._createEvents();

        Utils.exec(o.onTimepickerCreate, [element]);
    },

    _createStructure: function(){
        var that = this, element = this.element, o = this.options;
        var picker, hours, minutes, seconds, ampm, select, i;
        var selectWrapper, selectBlock, actionBlock;

        var prev = element.prev();
        var parent = element.parent();
        var id = Utils.elementId("timepicker");

        picker = $("<div>").addClass("wheelpicker timepicker " + String(element[0].className).replace("d-block", "d-flex")).addClass(o.clsPicker);

        if (prev.length === 0) {
            parent.prepend(picker);
        } else {
            picker.insertAfter(prev);
        }

        element.appendTo(picker);

        if (o.hours === true) {
            hours = $("<div>").addClass("hours").html(9).appendTo(picker);
        }
        if (o.minutes === true) {
            minutes = $("<div>").addClass("minutes").html(26).appendTo(picker);
        }
        if (o.seconds === true) {
            seconds = $("<div>").addClass("seconds").html(56).appendTo(picker);
        }
        if (o.h12 === true) {
            ampm = $("<div>").addClass("ampm").html("AM").appendTo(picker);
        }

        selectWrapper = $("<div>").addClass("select-wrapper").appendTo(picker);

        selectBlock = $("<div>").addClass("select-block").appendTo(selectWrapper);
        if (o.hours === true) {
            hours = $("<ul>").addClass("sel-hours").appendTo(selectBlock);
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(hours);
            for (i = 0; i < (o.h12 === true ? 12 : 24); i++) {
                $("<li>").addClass("js-hours-"+i).html(i).data("value", i).appendTo(hours);
            }
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(hours);
        }
        if (o.minutes === true) {
            minutes = $("<ul>").addClass("sel-minutes").appendTo(selectBlock);
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(minutes);
            for (i = 0; i < 60; i++) {
                $("<li>").addClass("js-minutes-"+i).html(i).data("value", i).appendTo(minutes);
            }
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(minutes);
        }
        if (o.seconds === true) {
            seconds = $("<ul>").addClass("sel-seconds").appendTo(selectBlock);
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(seconds);
            for (i = 0; i < 60; i++) {
                $("<li>").addClass("js-seconds-"+i).html(i).data("value", i).appendTo(seconds);
            }
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(seconds);
        }
        if (o.h12 === true) {
            ampm = $("<ul>").addClass("sel-ampm").appendTo(selectBlock);
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(ampm);
            $("<li>").addClass("js-ampm-0").html("AM").data("value", "AM").appendTo(ampm);
            $("<li>").addClass("js-ampm-1").html("PM").data("value", "PM").appendTo(ampm);
            for (i = 0; i < o.distance; i++) $("<li>").html("&nbsp;").data("value", -1).appendTo(ampm);
        }

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

            $(document).on(Metro.events.stop + "-picker", function(){
                $(document).off(Metro.events.move + "-picker");
                $(document).off(Metro.events.stop + "-picker");
            });
        });

        this._addScrollEvents();
    },

    _addScrollEvents: function(){
        var picker = this.picker, o = this.options;
        var lists = ['hours', 'minutes', 'seconds', 'ampm'];
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
        var lists = ['hours', 'minutes', 'seconds', 'ampm'];
        $.each(lists, function(){
            picker.find(".sel-" + this).off("scrollstart scrollstop");
        });
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('timepicker', Timepicker);