var Hint = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.hint = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onHintCreate, [this.element]);

        return this;
    },

    options: {
        hintHide: 5000,
        clsHint: "",
        hintText: "",
        hintPosition: "top",
        hintOffset: 4,
        onHintCreate: Metro.noop,
        onHintShow: Metro.noop,
        onHintHide: Metro.noop
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

        element.on(Metro.eventEnter, function(){
            that.createHint();
            if (o.hintHide > 0) {
                setTimeout(function(){
                    that.removeHint();
                }, o.hintHide);
            }
        });

        element.on(Metro.eventLeave, function(){
            that.removeHint();
        });
    },

    createHint: function(){
        var that = this, elem = this.elem, element = this.element, o = this.options;
        var hint = $("<div>").addClass("hint").addClass(o.clsHint).html(o.hintText);
        var hint_size = Utils.hiddenElementSize(hint);

        $(".hint").remove();

        if (elem.tagName === 'TD' || elem.tagName === 'TH') {
            var wrp = $("<div/>").css("display", "inline-block").html(element.html());
            element.html(wrp);
            element = wrp;
        }

        if (o.hintPosition === 'top') {
            hint.addClass('top');
            hint.css({
                top: element.offset().top - $(window).scrollTop() - hint_size.height - o.hintOffset,
                left: element.offset().left + element.outerWidth()/2 - hint_size.width/2  - $(window).scrollLeft()
            });
        } else if (o.hintPosition === 'right') {
            hint.addClass('right');
            hint.css({
                top: element.offset().top + element.outerHeight()/2 - hint_size.height/2 - $(window).scrollTop(),
                left: element.offset().left + element.outerWidth() - $(window).scrollLeft() + o.hintOffset
            });
        } else if (o.hintPosition === 'left') {
            hint.addClass('left');
            hint.css({
                top: element.offset().top + element.outerHeight()/2 - hint_size.height/2 - $(window).scrollTop(),
                left: element.offset().left - hint_size.width - $(window).scrollLeft() - o.hintOffset
            });
        } else {
            hint.addClass('bottom');
            hint.css({
                top: element.offset().top - $(window).scrollTop() + element.outerHeight() + o.hintOffset,
                left: element.offset().left + element.outerWidth()/2 - hint_size.width/2  - $(window).scrollLeft()
            });
        }

        hint.appendTo($('body'));
        this.hint = hint;
        Utils.exec(o.onHintShow, [hint, element]);
    },

    removeHint: function(){
        var hint = this.hint;
        var element = this.element;
        var options = this.options;
        var timeout = options.onHintHide === Metro.noop ? 0 : 300;

        if (hint !== null) {
            Utils.exec(options.onHintHide, [hint, element]);
            setTimeout(function(){
                hint.hide(0, function(){
                    hint.remove();
                });
            }, timeout);
        }
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('hint', Hint);