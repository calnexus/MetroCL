var Carousel = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.height = 0;
        this.width = 0;
        this.slides = [];
        this.current = null;
        this.currentIndex = null;
        this.dir = this.options.direction;
        this.interval = null;
        this.isAnimate = false;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        autoStart: false,
        width: "100%",
        height: "auto", // auto, px, %
        effect: "slide", // slide, fade, switch, slowdown, custom
        effectFunc: "linear",
        direction: "left", //left, right
        duration: 1000,
        period: 5000,
        stopOnMouse: true,

        controls: true,
        bullets: true,
        bulletStyle: "square", // square, circle, rect, diamond
        controlsOnMouse: false,
        controlsOutside: false,
        bulletsPosition: "default", // default, left, right

        controlPrev: '&#x23F4',
        controlNext: '&#x23F5',
        clsCarousel: "",
        clsSlides: "",
        clsSlide: "",
        clsControls: "",
        clsControlNext: "",
        clsControlPrev: "",
        clsBullets: "",
        clsBullet: "",
        clsBulletOn: "",
        clsThumbOn: "",

        onStop: Metro.noop,
        onStart: Metro.noop,
        onPlay: Metro.noop,
        onSlideClick: Metro.noop,
        onBulletClick: Metro.noop,
        onThumbClick: Metro.noop,
        onMouseEnter: Metro.noop,
        onMouseLeave: Metro.noop,
        onNextClick: Metro.noop,
        onPrevClick: Metro.noop,
        onCarouselCreate: Metro.noop
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
        var element = this.element, o = this.options;
        var slides = element.find(".slide");
        var slides_container = element.find(".slides");
        var maxHeight = 0;

        element.addClass("carousel").addClass(o.clsCarousel);
        if (o.controlsOutside === true) {
            element.addClass("controls-outside");
        }

        if (slides_container.length === 0) {
            slides_container = $("<div>").addClass("slides").appendTo(element);
            slides.appendTo(slides_container);
        }

        slides.addClass(o.clsSlides);

        if (slides.length === 0) {
            Utils.exec(this.options.onCarouselCreate, [this.element]);
            return ;
        }

        $.each(slides, function(){
            var slide = $(this);
            var height = slide.outerHeight(true);
            if (maxHeight <= height) {
                maxHeight = height;
            }
        });

        this.height = o.height !== "auto" ? o.height : maxHeight;
        this.width = o.width;

        slides.outerHeight(this.height);

        element.css({
            height: this.height,
            width: this.width
        });

        if (o.height !== "auto") {
            element.addClass("fixed-size");
        }

        this._createSlides();
        this._createControls();
        this._createBullets();
        this._createEvents();

        if (o.controlsOnMouse === true) {
            element.find("[class*=carousel-switch]").hide();
            element.find(".carousel-bullets").hide();
        }

        if (o.autoStart === true) {
            this._start();
        }

        Utils.exec(this.options.onCarouselCreate, [this.element]);
    },

    _start: function(){
        var that = this, element = this.element, o = this.options;

        this.interval = setInterval(function () {
            if (o.direction === 'left') {
                that._slideTo('next');
            } else {
                that._slideTo('prior');
            }
        }, o.period);

        Utils.exec(o.onStart, [element]);
    },

    _createSlides: function(){
        var that = this, element = this.element, o = this.options;
        var slides = element.find(".slide");

        $.each(slides, function(){
            var slide = $(this);
            if (slide.data("cover") !== undefined) {
                slide.css({
                    backgroundImage: "url("+slide.data('cover')+")",
                    backgroundSize: "cover",
                    // backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                });
            }

            slide.css({
                left: "100%"
            });

            slide.addClass(o.clsSlide);

            that.slides.push(slide);
        });

        this.currentIndex = 0;
        this.slides[this.currentIndex].css("left", "0");
        this.current = this.slides[this.currentIndex];
    },

    _createControls: function(){
        var element = this.element, o = this.options;
        var next, prev;

        if (o.controls === false) {
            return ;
        }

        next = $('<span/>').addClass('carousel-switch-next').addClass(o.clsControls).addClass(o.clsControlNext).html(">");
        prev = $('<span/>').addClass('carousel-switch-prev').addClass(o.clsControls).addClass(o.clsControlPrev).html("<");

        if (o.controlNext) {
            next.html(o.controlNext);
        }

        if (o.controlPrev) {
            prev.html(o.controlPrev);
        }

        next.appendTo(element);
        prev.appendTo(element);
    },

    _createBullets: function(){
        var element = this.element, o = this.options;
        var bullets, i;

        if (o.bullets === false) {
            return ;
        }

        bullets = $('<div>').addClass("carousel-bullets").addClass("bullet-style-"+o.bulletStyle).addClass(o.clsBullets);
        if (o.bulletsPosition === 'default' || o.bulletsPosition === 'center') {
            bullets.addClass("flex-justify-center");
        } else if (o.bulletsPosition === 'left') {
            bullets.addClass("flex-justify-start");
        } else {
            bullets.addClass("flex-justify-end");
        }

        for (i = 0; i < this.slides.length; i++) {
            var bullet = $('<span>').addClass("carousel-bullet").addClass(o.clsBullet).data("slide", i);
            if (i === 0) {
                bullet.addClass('bullet-on').addClass(o.clsBulletOn);
            }
            bullet.appendTo(bullets);
        }

        bullets.appendTo(element);
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on("click", ".carousel-bullet", function(e){
            var bullet = $(this);
            if (that.isAnimate === false) {
                that._slideToSlide(bullet.data('slide'));
                Utils.exec(o.onBulletClick, [bullet,  element, e])
            }
        });

        element.on("click", ".carousel-switch-next", function(e){
            if (that.isAnimate === false) {
                that._slideTo("next");
                Utils.exec(o.onNextClick, [element, e])
            }
        });

        element.on("click", ".carousel-switch-prev", function(e){
            if (that.isAnimate === false) {
                that._slideTo("prev");
                Utils.exec(o.onPrevClick, [element, e])
            }
        });

        if (o.stopOnMouse === true && o.autoStart === true) {
            element.on(Metro.eventEnter, function (e) {
                if (o.controlsOnMouse === true) {
                    element.find("[class*=carousel-switch]").fadeIn();
                    element.find(".carousel-bullets").fadeIn();
                }
                clearInterval(that.interval);
                Utils.exec(o.onMouseEnter, [element, e])
            });
            element.on(Metro.eventLeave, function (e) {
                if (o.controlsOnMouse === true) {
                    element.find("[class*=carousel-switch]").fadeOut();
                    element.find(".carousel-bullets").fadeOut();
                }
                that._start();
                Utils.exec(o.onMouseLeave, [element, e])
            });
        }

        if (o.controlsOnMouse === true) {
            element.on(Metro.eventEnter, function () {
                element.find("[class*=carousel-switch]").fadeIn();
                element.find(".carousel-bullets").fadeIn();
            });
            element.on(Metro.eventLeave, function () {
                element.find("[class*=carousel-switch]").fadeOut();
                element.find(".carousel-bullets").fadeOut();
            });
        }

        element.on("click", ".slide", function(e){
            var slide = $(this);
            Utils.exec(o.onSlideClick, [slide, element, e])
        });
    },

    _slideToSlide: function(index){
        var element = this.element, o = this.options;
        var current, next, to;

        if (this.slides[index] === undefined) {
            return ;
        }

        if (this.currentIndex === index) {
            return ;
        }

        to = index > this.currentIndex ? "next" : "prev";
        current = this.slides[this.currentIndex];
        next = this.slides[index];

        this.currentIndex = index;

        this._effect(current, next, o.effect, to);

        element.find(".carousel-bullet").removeClass("bullet-on").removeClass(o.clsBulletOn);
        element.find(".carousel-bullet:nth-child("+(this.currentIndex+1)+")").addClass("bullet-on").addClass(o.clsBulletOn);
    },

    _slideTo: function(to){
        var element = this.element, o = this.options;
        var current, next;

        if (to === undefined) {
            to = "next";
        }

        current = this.slides[this.currentIndex];

        if (to === "next") {
            this.currentIndex++;
            if (this.currentIndex >= this.slides.length) {
                this.currentIndex = 0;
            }
        } else {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.slides.length - 1;
            }
        }

        next = this.slides[this.currentIndex];

        this._effect(current, next, o.effect, to);

        element.find(".carousel-bullet").removeClass("bullet-on").removeClass(o.clsBulletOn);
        element.find(".carousel-bullet:nth-child("+(this.currentIndex+1)+")").addClass("bullet-on").addClass(o.clsBulletOn);
    },

    _effect: function(current, next, effect, to){
        var that = this, element = this.element, o = this.options;
        var out = element.width();

        current.stop(true, true);
        next.stop(true, true);
        this.isAnimate = true;

        function _slide(){
            setTimeout(function(){that.isAnimate = false;}, o.duration);
            current.animate({
                left: to === "next" ? -out : out
            }, o.duration, o.effectFunc);
            next.css({
                left: to === "next" ? out : -out
            }).animate({
                left: 0
            }, o.duration, o.effectFunc);
        }

        function _switch(){
            setTimeout(function(){that.isAnimate = false;}, 0);
            current.hide();
            next.hide().css("left", 0).show();
        }

        function _fade(){
            setTimeout(function(){that.isAnimate = false;}, o.duration);
            current.fadeOut(o.duration);
            next.hide().css("left", 0).fadeIn(o.duration);
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
            }, options);
        }

        switch (effect) {
            case "slowdown": _slowdown(); break;
            case "fade": _fade(); break;
            case "switch": _switch(); break;
            default: _slide();
        }
    },

    toSlide: function(index){
        this._slideToSlide(index);
    },

    next: function(){
        this._slideTo("next");
    },

    prev: function(){
        this._slideTo("prev");
    },

    stop: function () {
        clearInterval(this.interval);
        Utils.exec(this.options.onStop, [this.element])
    },

    play: function(){
        this._start();
        Utils.exec(this.options.onPlay, [this.element])
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('carousel', Carousel);