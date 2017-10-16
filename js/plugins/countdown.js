var Countdown = {
    init: function( options, elem ) {
        var that = this;
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.timepoint = (new Date()).getTime();
        this.breakpoint = null;
        this.blinkInterval = null;
        this.tickInterval = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCreate, [this.element]);

        this.tick();

        this.blinkInterval = setInterval(function(){that.blink();}, 500);
        this.tickInterval = setInterval(function(){that.tick();}, 1000);

        return this;
    },

    options: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        date: null,
        daysLabel: "days",
        hoursLabel: "hours",
        minutesLabel: "mins",
        secondsLabel: "secs",
        clsZero: "",
        clsAlarm: "",
        clsDays: "",
        clsHours: "",
        clsMinutes: "",
        clsSeconds: "",
        onCreate: Metro.noop,
        onAlarm: Metro.noop,
        onTick: Metro.noop,
        onZero: Metro.noop
    },

    _setOptionsFromDOM: function(){
        var element = this.element, o = this.options;

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
        var parts = ["days", "hours", "minutes", "seconds"];
        var dm = 24*60*60*1000, hm = 60*60*1000, mm = 60*1000, sm = 1000;
        var delta_days, delta_hours, delta_minutes;

        element.addClass("countdown");

        if (o.date !== null && Utils.isDate(o.date) !== false) {
            this.timepoint = (new Date(o.date)).getTime();
        }

        this.breakpoint = this.timepoint;

        if (parseInt(o.days) > 0) {
            this.breakpoint += parseInt(o.days) * dm;
        }
        if (parseInt(o.hours) > 0) {
            this.breakpoint += parseInt(o.hours) * hm;
        }
        if (parseInt(o.minutes) > 0) {
            this.breakpoint += parseInt(o.minutes) * mm;
        }
        if (parseInt(o.seconds) > 0) {
            this.breakpoint += parseInt(o.seconds) * sm;
        }

        delta_days = Math.round((that.breakpoint - that.timepoint) / dm);
        delta_hours = Math.round((that.breakpoint - that.timepoint) / hm);
        delta_minutes = Math.round((that.breakpoint - that.timepoint) / mm);

        $.each(parts, function(){
            if (this === "days" && delta_days === 0) {
                return ;
            }

            if (this === "hours" && delta_days === 0 && delta_hours === 0) {
                return ;
            }

            if (this === "minutes" && delta_days === 0 && delta_hours === 0 && delta_minutes === 0) {
                return ;
            }

            if (this === "seconds") {
            }

            var part = $("<div>").addClass("part " + this).attr("data-label", o[this+'Label']).appendTo(element);

            if (this === "days") {part.addClass(o.clsDays);}
            if (this === "hours") {part.addClass(o.clsHours);}
            if (this === "minutes") {part.addClass(o.clsMinutes);}
            if (this === "seconds") {part.addClass(o.clsSeconds);}

            $("<div>").addClass("digit").appendTo(part);
            $("<div>").addClass("digit").appendTo(part);

            if (this === "days" && delta_days >= 100) {

                for(var i = 0; i < String(delta_days/100).length; i++) {
                    $("<div>").addClass("digit").appendTo(part);
                }

            }
        });

        element.find(".digit").html("0");
    },

    blink: function(){
        this.element.toggleClass("blink");
    },

    tick: function(){
        var that = this, element = this.element, o = this.options;
        var dm = 24*60*60, hm = 60*60, mm = 60, sm = 1;
        var left, now = (new Date()).getTime();
        var d, h, m, s;

        left = Math.floor((this.breakpoint - now)/1000);

        if (left <= 0) {
            this.stop();
            element.addClass(o.clsAlarm);
            Utils.exec(o.onAlarm, [now, element]);
            return ;
        }

        d = Math.floor(left / dm);
        left -= d * dm;
        this.draw("days", d);

        if (d === 0) {
            element.find(".part.days").addClass(o.clsZero);
            Utils.exec(o.onZero, ["days", element]);
        }

        h = Math.floor(left / hm);
        left -= h*hm;
        this.draw("hours", h);

        if (d === 0 && h === 0) {
            element.find(".part.hours").addClass(o.clsZero);
            Utils.exec(o.onZero, ["hours", element]);
        }

        m = Math.floor(left / mm);
        left -= m*mm;
        this.draw("minutes", m);

        if (d === 0 && h === 0 && m === 0) {
            element.find(".part.minutes").addClass(o.clsZero);
            Utils.exec(o.onZero, ["minutes", element]);
        }

        s = Math.floor(left / sm);
        this.draw("seconds", s);

        if (d === 0 && h === 0 && m === 0 && s === 0) {
            element.find(".part.seconds").addClass(o.clsZero);
            Utils.exec(o.onZero, ["seconds", element]);
        }

        Utils.exec(o.onTick, [{days:d, hours:h, minutes:m, seconds:s}, element]);
    },

    draw: function(part, value){
        var that = this, element = this.element, o = this.options;
        var major_value, minor_value, digit_value;
        var len = String(value).length;

        var digits = element.find("."+part+" .digit").html("0");
        var digits_length = digits.length;

        for(var i = 0; i < len; i++){
            digit_value = Math.floor( value / Math.pow(10, i) ) % 10;
            element.find("." + part + " .digit:eq("+ (digits_length - 1) +")").html(digit_value);
            digits_length--;
        }
        // if (len > 2) {
        //
        //     var digits = element.find("."+part+" .digit").html("0");
        //     var digits_length = digits.length;
        //
        //     for(var i = 0; i < len; i++){
        //         minor_value = Math.floor( value / Math.pow(10, i) ) % 10;
        //         element.find("." + part + " .digit:eq("+ (digits_length - 1) +")").html(minor_value);
        //         digits_length--;
        //     }
        //
        // } else {
        //     major_value = Math.floor( value / 10 ) % 10;
        //     minor_value = value % 10;
        //
        //     element.find("." + part + " .digit:eq(0)").html(major_value);
        //     element.find("." + part + " .digit:eq(1)").html(minor_value);
        // }
    },

    stop: function(){
        var that = this, element = this.element, o = this.options;
        element.find(".digit").html("0");
        clearInterval(this.blinkInterval);
        clearInterval(this.tickInterval);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('countdown', Countdown);