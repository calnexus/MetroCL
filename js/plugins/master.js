var Master = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.pages = [];
        this.currentIndex = 0;
        this.isAnimate = false;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        effect: "switch", // slide, fade, switch, slowdown, custom
        effectFunc: "linear",
        duration: 1000,

        controlPrev: "<",
        controlNext: ">",
        controlTitle: "Ordering, step $1 / $2",

        clsMaster: "",
        clsControls: "",
        clsControlPrev: "",
        clsControlNext: "",
        clsControlTitle: "",
        clsPages: "",
        clsPage: "",

        onBeforePage: Metro.noop_true,
        onBeforeNext: Metro.noop_true,
        onBeforePrev: Metro.noop_true,
        onMasterCreate: Metro.noop
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

        element.addClass("master").addClass(o.clsMaster);

        this._createControls();
        this._createPages();
        this._createEvents();

        Utils.exec(this.options.onMasterCreate, [this.element]);
    },

    _createControls: function(){
        var that = this, element = this.element, o = this.options;
        var controls_position = ['top', 'bottom'];
        var i, controls, title, pages = element.find(".page");

        title = String(o.controlTitle).replace("$1", "1");
        title = String(title).replace("$2", pages.length);

        $.each(controls_position, function(){
            controls = $("<div>").addClass("controls controls-"+this).appendTo(element);
            $("<span>").addClass("prev").html(o.controlPrev).appendTo(controls);
            $("<span>").addClass("next").html(o.controlNext).appendTo(controls);
            $("<span>").addClass("title").html(title).appendTo(controls);
        });

        this._enableControl("prev", false);
    },

    _enableControl: function(type, state){
        var control = this.element.find(".controls ." + type);
        if (state === true) {
            control.removeClass("disabled");
        } else {
            control.addClass("disabled");
        }
    },

    _setTitle: function(){
        var title = this.element.find(".controls .title");

        var title_str = this.options.controlTitle.replace("$1", this.currentIndex + 1);
        title_str = title_str.replace("$2", String(this.pages.length));

        title.html(title_str);
    },

    _createPages: function(){
        var that = this, element = this.element, o = this.options;
        var pages = element.find(".pages");
        var page = element.find(".page");

        if (pages.length === 0) {
            pages = $("<div>").addClass("pages").appendTo(element);
        }

        pages.addClass(o.clsPages);

        $.each(page, function(){
            var p = $(this);
            if (p.data("cover") !== undefined) {
                p.css({
                    backgroundImage: "url("+p.data('cover')+")",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                });
            }

            p.css({
                left: "100%"
            });

            p.addClass(o.clsPage);

            that.pages.push(p);
        });

        page.appendTo(pages);

        this.currentIndex = 0;
        this.pages[this.currentIndex].css("left", "0");

        setTimeout(function(){
            pages.css({
                height: that.pages[0].outerHeight()
            });
        }, 0);
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on("click", ".controls .prev", function(){
            if (
                Utils.exec(o.onBeforePrev, [that.currentIndex, that.pages[that.currentIndex], element]) === true &&
                Utils.exec(o.onBeforePage, ["next", that.currentIndex, that.pages[that.currentIndex], element]) === true
            ) {
                that.prev();
            }
        });

        element.on("click", ".controls .next", function(){
            if (
                Utils.exec(o.onBeforeNext, [that.currentIndex, that.pages[that.currentIndex], element]) === true &&
                Utils.exec(o.onBeforePage, ["next", that.currentIndex, that.pages[that.currentIndex], element]) === true
            ) {
                that.next();
            }
        });
    },

    _slideToPage: function(index){
        var current, next, to;

        if (this.pages[index] === undefined) {
            return ;
        }

        if (this.currentIndex === index) {
            return ;
        }

        to = index > this.currentIndex ? "next" : "prev";
        current = this.pages[this.currentIndex];
        next = this.pages[index];

        this.currentIndex = index;

        this._effect(current, next, to);
    },

    _slideTo: function(to){
        var current, next;

        if (to === undefined) {
            return ;
        }

        current = this.pages[this.currentIndex];

        if (to === "next") {
            if (this.currentIndex + 1 >= this.pages.length) {
                return ;
            }
            this.currentIndex++;
        } else {
            if (this.currentIndex - 1 < 0) {
                return ;
            }
            this.currentIndex--;
        }

        next = this.pages[this.currentIndex];

        this._effect(current, next, to);
    },

    _effect: function(current, next, to){
        var that = this, element = this.element, o = this.options;
        var out = element.width();
        var pages = element.find(".pages");

        this._setTitle();

        if (this.currentIndex === this.pages.length - 1) {
            this._enableControl("next", false);
        } else {
            this._enableControl("next", true);
        }

        if (this.currentIndex === 0) {
            this._enableControl("prev", false);
        } else {
            this._enableControl("prev", true);
        }

        current.stop(true, true);
        next.stop(true, true);
        this.isAnimate = true;

        pages.css({
            height: next.outerHeight(true)
        });

        function _slide(){
            setTimeout(function(){that.isAnimate = false;}, o.duration);
            current.animate({
                left: to === "next" ? -out : out
            }, o.duration, o.effectFunc);
            next.css({
                left: to === "next" ? out : -out
            }).animate({
                left: 0
            }, o.duration, o.effectFunc, function(){
            });
        }

        function _switch(){
            setTimeout(function(){that.isAnimate = false;}, 0);
            current.hide(0);
            next.hide(0).css("left", 0).show(0);
        }

        function _fade(){
            setTimeout(function(){that.isAnimate = false;}, o.duration);
            current.fadeOut(o.duration);
            next.hide(0).css("left", 0).fadeIn(o.duration, function(){
            });
        }

        function _slowdown(){
            setTimeout(function(){that.isAnimate = false;}, o.duration);
            var options = {
                'duration': o.duration,
                'easing': 'doubleSqrt'
            };
            $.easing.doubleSqrt = function(t) {
                return Math.sqrt(Math.sqrt(t));
            };

            current.animate({
                left: to === "next" ? -out : out
            }, options);
            next.css({
                left: to === "next" ? out : -out
            }).animate({
                left: 0
            }, options, function(){
            });
        }

        switch (o.effect) {
            case "slowdown": _slowdown(); break;
            case "fade": _fade(); break;
            case "switch": _switch(); break;
            default: _slide();
        }
    },

    toPage: function(index){
        this._slideToPage(index);
    },

    next: function(){
        this._slideTo("next");
    },

    prev: function(){
        this._slideTo("prev");
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('master', Master);