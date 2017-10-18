var Calendar = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.today = new Date();
        this.current = {
            year: this.today.getFullYear(),
            month: this.today.getMonth(),
            day: this.today.getDate(),
            week_day: this.today.getDay()
        };
        this.preset = [];
        this.selected = [];

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCalendarCreate, [this.element]);

        return this;
    },

    options: {
        locale: METRO_LOCALE,
        weekStart: 1,
        onCalendarCreate: Metro.noop
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

        this._drawCalendar();
        this._bindEvents();
    },

    _bindEvents: function(){

    },

    _drawCalendar: function(){
        var that = this, element = this.element, o = this.options;
        var header, content, footer, toolbar;
        var calendar_locale = Locales[o.locale]['calendar'];
        var buttons_locale = Locales[o.locale]['buttons'];
        var i, j, counter = 0;
        var first = new Date(this.current.year, this.current.month, 1);
        var first_day = first.getDay() === 0 ? 7 : first.getDay() - 1;
        var prev_month_days = (new Date(this.current.year, this.current.month, 0)).getDate();
        var next_month_days = (new Date(this.current.year, this.current.month + 2, 0)).getDate();
        var curr_month_days = (new Date(this.current.year, this.current.month + 1, 0)).getDate();
        var prev_year, next_year, prev_month, next_month;

        if (this.current.month - 1 < 0) {
            prev_month = 11;
            prev_year = this.current.year - 1;
        }

        if (this.current.month + 1 > 11) {
            next_month = 0;
            next_year = this.current.year + 1;
        }

        element.html("").addClass("calendar");

        header = $("<div>").addClass("calendar-header").appendTo(element);
        content = $("<div>").addClass("calendar-content").appendTo(element);
        footer = $("<div>").addClass("calendar-footer").appendTo(element);
        toolbar = $("<div>").addClass("calendar-toolbar").appendTo(content);

        /**
        * Calendar header
        */
        $("<div>").addClass("year").html(this.current.year).appendTo(header);
        $("<div>").addClass("day").html(calendar_locale['days'][this.current.week_day] + ", " + calendar_locale['months'][this.current.month + 12] + " " + this.current.day).appendTo(header);

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
        for(i = prev_month_days - first_day + 2; i <= prev_month_days; i++) {
            var d = $("<div>").addClass("day outside").html(i).appendTo(days_row);
            var s = new Date(prev_year, prev_month, i);
            d.data('day', s);
            if (this.preset.indexOf(s.getTime()) !== -1) {
                d.addClass("preset")
            }
            if (this.selected.indexOf(s.getTime()) !== -1) {
                d.addClass("selected")
            }
            counter++;
        }

        while(first.getMonth() === this.current.month) {
            var d = $("<div>").addClass("day").html(first.getDate()).appendTo(days_row);

            d.data('day', first.getTime());

            if (
                this.today.getFullYear() === first.getFullYear() &&
                this.today.getMonth() === first.getMonth() &&
                this.today.getDate() === first.getDate()
            ) {
                d.addClass("today");
            }

            if (this.preset.indexOf(s.getTime()) !== -1) {
                d.addClass("preset")
            }
            if (this.selected.indexOf(s.getTime()) !== -1) {
                d.addClass("selected")
            }
            counter++;
            if (counter % 7 === 0) {
                days_row = $("<div>").addClass("days-row").appendTo(days);
            }
            first.setDate(first.getDate() + 1);
        }

        var day_height = element.find(".day:nth-child(1)").css('width');

        element.find(".days-row .day").css({
            height: day_height,
            lineHeight: day_height
        });

    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('calendar', Calendar);