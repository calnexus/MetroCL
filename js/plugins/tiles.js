var Tile = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.effectInterval = false;
        this.images = [];
        this.slides = [];
        this.currentSlide = -1;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        size: "medium",
        cover: "",
        effect: "",
        effectInterval: 3000,
        target: null,
        onClick: Metro.noop,
        onTileCreate: Metro.noop
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

        this._createTile();
        this._createEvents();

        Utils.exec(o.onTileCreate, [element]);
    },

    _createTile: function(){
        var that = this, element = this.element, o = this.options;
        var slides = element.find(".slide");

        element.addClass("tile-" + o.size);

        if (o.effect.indexOf("hover-") > -1) {
            element.addClass("effect-" + o.effect);
        }

        if (o.effect.indexOf("animate-") > -1 && slides.length > 1) {
            $.each(slides, function(i){
                var slide = $(this);

                that.slides.push(this);

                if (slide.data("cover") !== undefined) {
                    that._setCover(slide, slide.data("cover"));
                }

                if (i > 0) {
                    if (["animate-slide-up", "animate-slide-down"].indexOf(o.effect) > -1) slide.css("top", "100%");
                    if (["animate-slide-left", "animate-slide-right"].indexOf(o.effect) > -1) slide.css("left", "100%");
                    if (["animate-fade"].indexOf(o.effect) > -1) slide.css("opacity", 0);
                }
            });

            this.currentSlide = 0;

            this.effectInterval = setInterval(function(){
                var current, next;

                current = $(that.slides[that.currentSlide]);

                that.currentSlide++;
                if (that.currentSlide === that.slides.length) {
                    that.currentSlide = 0;
                }

                next = that.slides[that.currentSlide];

                if (o.effect === "animate-slide-up") Animation.slideUp($(current), $(next));
                if (o.effect === "animate-slide-down") Animation.slideDown($(current), $(next));
                if (o.effect === "animate-slide-left") Animation.slideLeft($(current), $(next));
                if (o.effect === "animate-slide-right") Animation.slideRight($(current), $(next));
                if (o.effect === "animate-fade") Animation.fade($(current), $(next));

            }, o.effectInterval);
        }

        if (o.cover !== "") {
            this._setCover(element, o.cover);
        }

        if (o.effect === "image-set") {
            element.addClass("image-set");
            $.each(element.children("img"), function(){
                var img = $(this);
                var src = this.src;
                var div = $("<div>").addClass("img");

                if (img.hasClass("icon")) {
                    return ;
                }

                that.images.push(this);

                div.css("background-image", "url("+src+")");
                element.prepend(div);
                img.remove();
            });

            function switchImage(el, img_src){
                setTimeout(function(){
                    el.fadeOut(500, function(){
                        el.css("background-image", "url(" + img_src + ")");
                        el.fadeIn();
                    });
                }, Utils.random(0,1000));
            }

            setInterval(function(){
                var temp = that.images.slice();
                for(var i = 0; i < element.find(".img").length; i++) {
                    var rnd_index = Utils.random(0, temp.length - 1);
                    var div = $(element.find(".img").get(i));
                    switchImage(div, temp[rnd_index].src);
                    temp.splice(rnd_index, 1);
                }
            }, 3000);
        }
    },

    _setCover: function(to, src){
        to.css({
            backgroundImage: "url("+src+")",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat"
        });
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on(Metro.eventStart, function(e){
            var tile = $(this);
            var dim = {w: element.width(), h: element.height()};
            var X = Utils.pageXY(e).x - tile.offset().left,
                Y = Utils.pageXY(e).y - tile.offset().top;
            var side;

            if (Utils.isRightMouse(e) === false) {

                if (X < dim.w * 1 / 3 && (Y < dim.h * 1 / 2 || Y > dim.h * 1 / 2)) {
                    side = 'left';
                } else if (X > dim.w * 2 / 3 && (Y < dim.h * 1 / 2 || Y > dim.h * 1 / 2)) {
                    side = 'right';
                } else if (X > dim.w * 1 / 3 && X < dim.w * 2 / 3 && Y > dim.h / 2) {
                    side = 'bottom';
                } else {
                    side = "top";
                }

                tile.addClass("transform-" + side);

                if (o.target !== null) {
                    setTimeout(function(){
                        document.location.href = o.target;
                    }, 100);
                }

                Utils.exec(o.onClick, [tile]);
            }
        });

        element.on([Metro.eventStop, Metro.eventLeave].join(" "), function(e){
            $(this)
                .removeClass("transform-left")
                .removeClass("transform-right")
                .removeClass("transform-top")
                .removeClass("transform-bottom");
        });
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('tile', Tile);