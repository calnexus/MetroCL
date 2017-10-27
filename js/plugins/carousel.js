var Carousel = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.height = 0;
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
        stopOnMouseOver: true,

        controls: true,
        controlsPosition: "inside", // inside, outside
        controlPrev: '',
        controlNext: '',
        clsControls: "",
        bullets: true,
        bulletsStyle: "square", // square, circle, rect, diamond
        bulletsPosition: "inside", // inside, outside

        onChange: Metro.noop,
        onStop: Metro.noop,
        onStart: Metro.noop,
        onSlideStop: Metro.noop,
        onSlideStart: Metro.noop,
        onSlideClick: Metro.noop,
        onBulletClick: Metro.noop,
        onMouseEnter: Metro.noop,
        onMouseLeave: Metro.noop,
        onCarouselCreate: Metro.noop
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
        var slides = element.find(".slide");
        var slides_container = element.find(".slides");
        var height = 0, maxHeight = 0;

        element.addClass("carousel");

        if (slides_container.length === 0) {
            slides_container = $("<div>").addClass("slides").appendTo(element);
            slides.appendTo(slides_container);
        }

        if (slides.length === 0) {
            Utils.exec(this.options.onCarouselCreate, [this.element]);
            return ;
        }

        $.each(slides, function(){
            var slide = $(this);
            var slideSize = Utils.hiddenElementSize(slide);
            if (maxHeight < slideSize.height) {
                maxHeight = slideSize.height;
            }
        });

        this.height = String(o.height).indexOf("%") > -1 || Utils.isInt(o.height) === true ? o.height : maxHeight;

        element.css("height", this.height);

        this._createSlides();
        this._createControls();
        this._createBullets();
        this._createEvents();

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
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                });
            }

            slide.css({
                left: "100%"
            });

            that.slides.push(slide);
        });

        this.currentIndex = 0;
        this.slides[this.currentIndex].css("left", "0");
        this.current = this.slides[this.currentIndex];
    },

    _createControls: function(){
        var that = this, element = this.element, o = this.options;
        var next, prev;

        next = $('<span/>').addClass('carousel-switch-next').addClass(o.clsControls).html("&gt;");
        prev = $('<span/>').addClass('carousel-switch-prev').addClass(o.clsControls).html("&lt;");

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
        var that = this, element = this.element, o = this.options;
        var bullets, i;

        if (o.bullets === false) {
            return ;
        }

        bullets = $('<div>').addClass("carousel-bullets");

        for (i = 0; i < this.slides.length; i++) {
            var bullet = $('<span class="carousel-bullet"></span>').data("slide", i);
            if (i === 0) {
                bullet.addClass('bullet-on');
            }
            bullet.appendTo(bullets);
        }

        bullets.appendTo(element);
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on("click", ".carousel-bullet", function(){
            if (that.isAnimate === false)
                that._slideToSlide($(this).data('slide'));
        });

        element.on("click", ".carousel-switch-next", function(){
            if (that.isAnimate === false)
                that._slideTo("next");
        });

        element.on("click", ".carousel-switch-prev", function(){
            if (that.isAnimate === false)
                that._slideTo("prev");
        });

        if (o.stopOnMouseOver === true && o.autoStart === true) {
            element.on(Metro.eventEnter, function () {
                clearInterval(that.interval);
            });
            element.on(Metro.eventLeave, function () {
                that._start();
            });
        }
    },

    _slideToSlide: function(index){
        var that = this, element = this.element, o = this.options;
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

        element.find(".carousel-bullet").removeClass("bullet-on");
        element.find(".carousel-bullet:nth-child("+(this.currentIndex+1)+")").addClass("bullet-on");
    },

    _slideTo: function(to){
        var that = this, element = this.element, o = this.options;
        var current, next;

        if (to === undefined) {
            to = "next";
        }

        current = this.slides[this.currentIndex];

        if (to === "next") {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.slides.length - 1;
            }
        } else {
            this.currentIndex++;
            if (this.currentIndex >= this.slides.length) {
                this.currentIndex = 0;
            }
        }

        next = this.slides[this.currentIndex];

        this._effect(current, next, o.effect, to);

        element.find(".carousel-bullet").removeClass("bullet-on");
        element.find(".carousel-bullet:nth-child("+(this.currentIndex+1)+")").addClass("bullet-on");
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
    },

    play: function(){
        this._start();
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('carousel', Carousel);