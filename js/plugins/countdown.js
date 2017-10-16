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
        alarm: false,
        daysLabel: "days",
        hoursLabel: "hours",
        minutesLabel: "mins",
        secondsLabel: "secs",
        clsZero: "",
        clsAlert: "",
        clsDays: "",
        clsHours: "",
        clsMinutes: "",
        clsSeconds: "",
        chars: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
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

            $("<div>").addClass("digit").appendTo(part);
            $("<div>").addClass("digit").appendTo(part);

            if (this === "days" && delta_days >= 100) {

                for(var i = 0; i < String(delta_days/100).length; i++) {
                    $("<div>").addClass("digit").appendTo(part);
                }

            }
        });

        element.find(".digit").html(o.chars[0]);
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
            Utils.exec(o.onAlarm, [now, element]);
            return ;
        }

        d = Math.floor(left / dm);
        left -= d * dm;
        this.draw("days", d);

        h = Math.floor(left / hm);
        left -= h*hm;
        this.draw("hours", h);

        m = Math.floor(left / mm);
        left -= m*mm;
        this.draw("minutes", m);

        s = Math.floor(left / sm);
        this.draw("seconds", s);
    },

    draw: function(part, value){
        var that = this, element = this.element, o = this.options;
        var major_value, minor_value;
        var len = String(value).length;

        if (len > 2) {

            for(var i = 0; i < len; i++){
                minor_value = Math.floor( value / Math.pow(10, i) ) % 10;
                console.log(i, minor_value);
                element.find("." + part + " .digit:eq("+ (len - 1 - i) +")").html(minor_value);
            }

            // major_value = Math.floor( value / 10 ) % 10;
            // minor_value = value % 10;
            //
            // element.find("." + part + " .digit:eq(0)").html(major_value);
            // element.find("." + part + " .digit:eq(1)").html(minor_value);
        } else {
            major_value = Math.floor( value / 10 ) % 10;
            minor_value = value % 10;

            element.find("." + part + " .digit:eq(0)").html(major_value);
            element.find("." + part + " .digit:eq(1)").html(minor_value);
        }
    },

    stop: function(){
        clearInterval(this.blinkInterval);
        clearInterval(this.tickInterval);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('countdown', Countdown);