var Calendar = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.today = new Date();
        this.today.setHours(0,0,0,0);
        this.current = {
            year: this.today.getFullYear(),
            month: this.today.getMonth(),
            day: this.today.getDate()
        };
        this.preset = [];
        this.selected = [];
        this.exclude = [];

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCalendarCreate, [this.element]);

        return this;
    },

    options: {
        locale: METRO_LOCALE,
        weekStart: 0,
        outside: true,
        buttons: ['cancel', 'today', 'clear', 'done'],
        clsToday: "",
        clsSelected: "",
        clsExclude: "",
        clsCancelButton: "",
        clsTodayButton: "",
        clsClearButton: "",
        clsDoneButton: "",
        isDialog: false,
        ripple: false,
        rippleColor: "#cccccc",
        exclude: null,
        preset: null,
        minDate: null,
        maxDate: null,
        onCancel: Metro.noop,
        onToday: Metro.noop,
        onClear: Metro.noop,
        onDone: Metro.noop,
        onDayClick: Metro.noop,
        onWeekDayClick: Metro.noop,
        onMonthChange: Metro.noop,
        onYearChange: Metro.noop,
        onCalendarCreate: Metro.noop
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

        element.html("").addClass("calendar");

        if (o.preset !== null) {
            if (Array.isArray(o.preset) === false) {
                o.preset = o.preset.split(",").map(function(item){
                    return item.trim();
                });
            }

            $.each(o.preset, function(){
                if (Utils.isDate(this) === false) {
                    return ;
                }
                that.selected.push((new Date(this)).getTime());
            });
        }

        if (o.exclude !== null) {
            if (Array.isArray(o.exclude) === false) {
                o.exclude = o.exclude.split(",").map(function(item){
                    return item.trim();
                });
            }

            $.each(o.exclude, function(){
                if (Utils.isDate(this) === false) {
                    return ;
                }
                that.exclude.push((new Date(this)).getTime());
            });
        }

        if (o.buttons !== false) {
            if (Array.isArray(o.buttons) === false) {
                o.buttons = o.buttons.split(",").map(function(item){
                    return item.trim();
                });
            }
        }

        this._drawCalendar();
        this._bindEvents();

        if (o.ripple === true) {
            element.ripple({
                rippleTarget: ".button, .prev-month, .next-month, .prev-year, .next-year, .day",
                rippleColor: o.rippleColor
            });
        }
    },

    _bindEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on("click", ".prev-month, .next-month, .prev-year, .next-year", function(){
            var new_date, el = $(this);

            if (el.hasClass("prev-month")) {
                new_date = new Date(that.current.year, that.current.month - 1, 1);
            }
            if (el.hasClass("next-month")) {
                new_date = new Date(that.current.year, that.current.month + 1, 1);
            }
            if (el.hasClass("prev-year")) {
                new_date = new Date(that.current.year - 1, that.current.month, 1);
            }
            if (el.hasClass("next-year")) {
                new_date = new Date(that.current.year + 1, that.current.month, 1);
            }

            that.current = {
                year: new_date.getFullYear(),
                month: new_date.getMonth(),
                day: new_date.getDate()
            };
            setTimeout(function(){
                that._drawContent();
                if (el.hasClass("prev-month") || el.hasClass("next-month")) {
                    Utils.exec(o.onMonthChange, [that.current, element]);
                }
                if (el.hasClass("prev-year") || el.hasClass("next-year")) {
                    Utils.exec(o.onYearChange, [that.current, element]);
                }
            }, o.ripple ? 300 : 0);
        });

        element.on("click", ".button.today", function(){
            that.today = new Date();
            that.current = {
                year: that.today.getFullYear(),
                month: that.today.getMonth(),
                day: that.today.getDate()
            };
            that._drawHeader();
            that._drawContent();
            Utils.exec(o.onToday, [that.today, element]);
        });

        element.on("click", ".button.clear", function(){
            that.selected = [];
            that._drawContent();
            Utils.exec(o.onClear, [element]);
        });

        element.on("click", ".button.cancel", function(){
            that._drawContent();
            Utils.exec(o.onCancel, [element]);
        });

        element.on("click", ".button.done", function(){
            that._drawContent();
            Utils.exec(o.onDone, [that.selected, element]);
        });

        element.on("click", ".day", function(){
            var day = $(this);
            var index, date;

            if ($(this).parent().hasClass("week-days")) {
                index = day.index();
                $.each(element.find(".days-row .day:nth-child("+(index + 1)+")"), function(){
                    var d = $(this);
                    var dd = d.data('day');
                    Utils.arrayDelete(that.selected, dd);
                    that.selected.push(dd);
                    d.addClass("selected").addClass(o.clsSelected);
                });
                Utils.exec(o.onWeekDayClick, [that.selected, day, element]);
            } else {
                date = day.data('day');
                index = that.selected.indexOf(date);

                if (index === -1) {
                    that.selected.push(date);
                    day.addClass("selected").addClass(o.clsSelected);
                } else {
                    day.removeClass("selected").removeClass(o.clsSelected);
                    Utils.arrayDelete(that.selected, date);
                }
                Utils.exec(o.onDayClick, [that.selected, day, element]);
            }
        });
    },

    _drawHeader: function(){
        var element = this.element, o = this.options;
        var calendar_locale = Locales[o.locale]['calendar'];
        var header = element.find(".calendar-header");

        if (header.length === 0) {
            header = $("<div>").addClass("calendar-header").appendTo(element);
        }

        header.html("");

        $("<div>").addClass("header-year").html(this.today.getFullYear()).appendTo(header);
        $("<div>").addClass("header-day").html(calendar_locale['days'][this.today.getDay()] + ", " + calendar_locale['months'][this.today.getMonth() + 12] + " " + this.today.getDate()).appendTo(header);
    },

    _drawFooter: function(){
        var element = this.element, o = this.options;
        var buttons_locale = Locales[o.locale]['buttons'];
        var footer = element.find(".calendar-footer");

        if (o.buttons === false) {
            return ;
        }

        if (footer.length === 0) {
            footer = $("<div>").addClass("calendar-footer").appendTo(element);
        }

        footer.html("");

        $.each(o.buttons, function(){
            var button = $("<button>").addClass("button " + this + " " + o['cls'+this.capitalize()+'Button']).html(buttons_locale[this]).appendTo(footer);
            if (this === 'cancel' || this === 'done') {
                button.addClass("js-dialog-close");
            }
        });
    },

    _drawContent: function(){
        var element = this.element, o = this.options;
        var content = element.find(".calendar-content"), toolbar;
        var calendar_locale = Locales[o.locale]['calendar'];
        var i, j, d, s, counter = 0;
        var first = new Date(this.current.year, this.current.month, 1);
        var first_day;
        var prev_month_days = (new Date(this.current.year, this.current.month, 0)).getDate();
        var year, month;

        if (content.length === 0) {
            content = $("<div>").addClass("calendar-content").appendTo(element);
        }
        content.html("");

        toolbar = $("<div>").addClass("calendar-toolbar").appendTo(content);

        /**
         * Calendar toolbar
         */
        $("<span>").addClass("prev-month").appendTo(toolbar);
        $("<span>").addClass("curr-month").html(calendar_locale['months'][this.current.month]).appendTo(toolbar);
        $("<span>").addClass("next-month").appendTo(toolbar);

        $("<span>").addClass("prev-year").appendTo(toolbar);
        $("<span>").addClass("curr-year").html(this.current.year).appendTo(toolbar);
        $("<span>").addClass("next-year").appendTo(toolbar);

        /**
         * Week days
         */
        var week_days = $("<div>").addClass("week-days").appendTo(content);
        for (i = 0; i < 7; i++) {
            if (o.weekStart === 0) {
                j = i;
            } else {
                j = i + 1;
                if (j === 7) j = 0;
            }
            $("<span>").addClass("day").html(calendar_locale["days"][j + 7]).appendTo(week_days);
        }

        /**
         * Calendar days
         */
        var days = $("<div>").addClass("days").appendTo(content);
        var days_row = $("<div>").addClass("days-row").appendTo(days);

        first_day = o.weekStart === 0 ? first.getDay() : (first.getDay() === 0 ? 6 : first.getDay() - 1);

        if (this.current.month - 1 < 0) {
            month = 11;
            year = this.current.year - 1;
        } else {
            month = this.current.month - 1;
            year = this.current.year;
        }

        for(i = 0; i < first_day; i++) {
            var v = prev_month_days - first_day + i + 1;
            d = $("<div>").addClass("day outside").appendTo(days_row);

            s = new Date(year, month, v);
            s.setHours(0,0,0,0);

            d.data('day', s.getTime());

            if (o.outside === true) {
                d.html(v);
                if (this.selected.indexOf(s.getTime()) !== -1) {
                    d.addClass("selected").addClass(o.clsSelected);
                }
                if (this.exclude.indexOf(s.getTime()) !== -1) {
                    d.addClass("disabled").addClass(o.clsExclude);
                }
            }

            counter++;
        }

        first.setHours(0,0,0,0);
        while(first.getMonth() === this.current.month) {
            d = $("<div>").addClass("day").html(first.getDate()).appendTo(days_row);

            d.data('day', first.getTime());

            if (
                this.today.getFullYear() === first.getFullYear() &&
                this.today.getMonth() === first.getMonth() &&
                this.today.getDate() === first.getDate()
            ) {
                d.addClass("today").addClass(o.clsToday);
            }

            if (this.selected.indexOf(first.getTime()) !== -1) {
                d.addClass("selected").addClass(o.clsSelected);
            }
            if (this.exclude.indexOf(first.getTime()) !== -1) {
                d.addClass("disabled").addClass(o.clsExclude);
            }
            counter++;
            if (counter % 7 === 0) {
                days_row = $("<div>").addClass("days-row").appendTo(days);
            }
            first.setDate(first.getDate() + 1);
            first.setHours(0,0,0,0);
        }

        first_day = o.weekStart === 0 ? first.getDay() : (first.getDay() === 0 ? 6 : first.getDay() - 1);

        if (this.current.month + 1 > 11) {
            month = 0;
            year = this.current.year + 1;
        } else {
            month = this.current.month + 1;
            year = this.current.year;
        }

        if (first_day > 0) for(i = 0; i < 7 - first_day; i++) {
            d = $("<div>").addClass("day outside").appendTo(days_row);
            s = new Date(year, month, i + 1);
            s.setHours(0,0,0,0);
            if (o.outside === true) {
                d.html(i + 1);
                if (this.selected.indexOf(s.getTime()) !== -1) {
                    d.addClass("selected").addClass(o.clsSelected);
                }
                if (this.exclude.indexOf(s.getTime()) !== -1) {
                    d.addClass("disabled").addClass(o.clsExclude);
                }
            }
        }

        var day_height = element.find(".day:nth-child(1)").css('width');

        element.find(".days-row .day").css({
            height: day_height,
            lineHeight: day_height
        });
    },

    _drawCalendar: function(){
        this.element.html("");
        this._drawHeader();
        this._drawContent();
        this._drawFooter();
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('calendar', Calendar);