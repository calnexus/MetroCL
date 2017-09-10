var Dropdown = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCreate);

        return this;
    },
    options: {
        effect: 'slide',
        toggleElement: false,
        noClose: false,
        duration: METRO_ANIMATION_DURATION,
        onDrop: $.noop(),
        onUp: $.noop(),
        onCreate: $.noop()
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
        var toggle, parent = element.parent();

        toggle = o.toggleElement ? $(o.toggleElement) : parent.children('.dropdown-toggle').length > 0 ? parent.children('.dropdown-toggle') : parent.children('a:nth-child(1)');

        toggle.on('click', function(e){
            parent.siblings(parent[0].tagName).removeClass("active-container");
            $(".active-container").removeClass("active-container");

            if (element.css('display') === 'block' && !element.hasClass('keep-open')) {
                that._close(element);
            } else {
                $('[data-role=dropdown]').each(function(i, el){
                    if (!element.parents('[data-role=dropdown]').is(el) && !$(el).hasClass('keep-open') && $(el).css('display') === 'block') {
                        that._close(el);
                    }
                });
                if (element.hasClass('horizontal')) {
                    element.css({
                        'visibility': 'hidden',
                        'display': 'block'
                    });
                    var item_length = $(element.children('li')[0]).outerWidth();
                    //var item_length2 = $(menu.children('li')[0]).width();
                    element.css({
                        'visibility': 'visible',
                        'display': 'none'
                    });
                    var menu_width = element.children('li').length * item_length + (element.children('li').length - 1);
                    element.css('width', menu_width);
                }
                that._open(element);
                parent.addClass("active-container");
            }
            e.preventDefault();
            e.stopPropagation();
        });

        if (o.noClose === true) {
            element.on('click', function (e) {
                //e.preventDefault();
                e.stopPropagation();
            });
        }

        $(element).find('li.disabled a').on('click', function(e){
            e.preventDefault();
        });
    },

    _close: function(el){
        var parent = $(el).parent(), o = this.options;
        var toggle = o.toggleElement ? $(o.toggleElement) : parent.children('.dropdown-toggle').length > 0 ? parent.children('.dropdown-toggle') : parent.children('a:nth-child(1)');

        switch (this.options.effect) {
            case 'fade': $(el).fadeOut(o.duration); break;
            case 'slide': $(el).slideUp(o.duration); break;
            default: $(el).hide();
        }
        this.element.trigger("onClose", null, el);
        toggle.removeClass('active-toggle');

        Utils.exec(o.onUp);
    },

    _open: function(el){
        var parent = this.element.parent(), o = this.options;
        var toggle = o.toggleElement ? $(o.toggleElement) : parent.children('.dropdown-toggle').length > 0 ? parent.children('.dropdown-toggle') : parent.children('a:nth-child(1)');

        switch (this.options.effect) {
            case 'fade': $(el).fadeIn(o.duration); break;
            case 'slide': $(el).slideDown(o.duration); break;
            default: $(el).show();
        }
        this.element.trigger("onOpen", null, el);
        toggle.addClass('active-toggle');

        Utils.exec(o.onDrop);
    },

    close: function(){
        this._close(this.element);
    },

    open: function(){
        this._open(this.element);
    }
};

$(document).on('click', function(e){
    $('[data-role=dropdown]').each(function(i, el){
        if (!$(el).hasClass('keep-open') && $(el).css('display')==='block') {
            var that = $(el).data('dropdown');
            that._close(el);
        }
    });
});

Metro.plugin('dropdown', Dropdown);