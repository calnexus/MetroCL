var Wizard = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        start: 1,
        finish: 0,
        iconHelp: "<span class='default-icon-help'></span>",
        iconPrev: "<span class='default-icon-left-arrow'></span>",
        iconNext: "<span class='default-icon-right-arrow'></span>",
        iconFinish: "<span class='default-icon-check'></span>",
        onPage: Metro.noop,
        onHelpClick: Metro.noop,
        onPrevClick: Metro.noop,
        onNextClick: Metro.noop,
        onFinishClick: Metro.noop,
        onBeforePrev: Metro.noop_true,
        onBeforeNext: Metro.noop_true,
        onBeforeFinish: Metro.noop_true,
        onWizardCreate: Metro.noop
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

        this._createWizard();
        this._createEvents();

        Utils.exec(o.onWizardCreate, [element]);
    },

    _createWizard: function(){
        var that = this, element = this.element, o = this.options;
        var bar;

        element.addClass("wizard").addClass(o.view);

        bar = $("<div>").addClass("action-bar").appendTo(element);

        $("<button>").addClass("button cycle outline wizard-btn-help").html(o.iconHelp).appendTo(bar);
        $("<button>").addClass("button cycle outline wizard-btn-prev").html(o.iconPrev).appendTo(bar);
        $("<button>").addClass("button cycle outline wizard-btn-next").html(o.iconNext).appendTo(bar);
        $("<button>").addClass("button cycle outline wizard-btn-finish").html(o.iconFinish).appendTo(bar);

        this.toPage(o.start);
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on("click", ".wizard-btn-help", function(){
            Utils.exec(o.onHelpClick, [that.current, element])
        });

        element.on("click", ".wizard-btn-prev", function(){
            that.prev();
            Utils.exec(o.onPrevClick, [that.current, element])
        });

        element.on("click", ".wizard-btn-next", function(){
            that.next();
            Utils.exec(o.onNextClick, [that.current, element])
        });

        element.on("click", ".wizard-btn-finish", function(){
            Utils.exec(o.onFinishClick, [that.current, element])
        });
    },

    next: function(){
        var that = this, element = this.element, o = this.options;
        var pages = element.children("section");

        if (this.current + 1 > pages.length || Utils.exec(o.onBeforeNext) === false) {
            return ;
        }

        this.current++;

        this.toPage(this.current);
    },

    prev: function(){
        var that = this, element = this.element, o = this.options;

        if (this.current - 1 === 0 || Utils.exec(o.onBeforePrev) === false) {
            return ;
        }

        this.current--;

        this.toPage(this.current);
    },

    last: function(){
        var that = this, element = this.element, o = this.options;

        this.toPage(element.children("section").length);
    },

    first: function(){
        this.toPage(1);
    },

    toPage: function(page){
        var that = this, element = this.element, o = this.options;
        var target = $(element.children("section").get(page - 1));

        if (target.length === 0) {
            return ;
        }

        element.find(".wizard-btn-finish").addClass("disabled");

        this.current = page;

        element.children("section")
            .removeClass("complete current")
            .removeClass(o.clsCurrent)
            .removeClass(o.clsComplete);

        target.addClass("current").addClass(o.clsCurrent);
        target.prevAll().addClass("complete").addClass(o.clsComplete);

        $(".action-bar").animate({
            left: element.children("section.complete").length * 25 + 41
        });

        if (
            (this.current === element.children("section").length) || (o.finish > 0 && this.current >= o.finish)
        ) {
            element.find(".wizard-btn-finish").removeClass("disabled");
        }

        Utils.exec(o.onPage, [this.current, element]);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('wizard', Wizard);