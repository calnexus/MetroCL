var Dropdown = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this._toggle = null;
        this.displayOrigin = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onDropdownCreate, [this.element]);

        return this;
    },

    options: {
        effect: 'slide',
        toggleElement: false,
        noClose: false,
        duration: METRO_ANIMATION_DURATION,
        onDrop: Metro.noop,
        onUp: Metro.noop,
        onDropdownCreate: Metro.noop
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

        toggle = o.toggleElement !== false ? $(o.toggleElement) : element.siblings('.dropdown-toggle').length > 0 ? element.siblings('.dropdown-toggle') : element.siblings('a:nth-child(1)');

        this.displayOrigin = element.css("display");
        this.element.css("display", "none");

        toggle.on('click', function(e){
            parent.siblings(parent[0].tagName).removeClass("active-container");
            $(".active-container").removeClass("active-container");

            if (element.css('display') !== 'none' && !element.hasClass('keep-open')) {
                that._close(element);
            } else {
                $('[data-role=dropdown]').each(function(i, el){
                    if (!element.parents('[data-role=dropdown]').is(el) && !$(el).hasClass('keep-open') && $(el).css('display') !== 'none') {
                        that._close(el);
                    }
                });
                if (element.hasClass('horizontal')) {
                    element.css({
                        'visibility': 'hidden',
                        'display': 'block'
                    });
                    var item_length = $(element.children('li')[0]).outerWidth();
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

        this._toggle = toggle;

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

        if (Utils.isJQueryObject(el) === false) {
            el = $(el);
        }

        var dropdown  = el.data("dropdown");
        var toggle = dropdown._toggle;
        var options = dropdown.options;

        toggle.removeClass('active-toggle').removeClass("active-control");
        el.slideUp(options.duration, function(){
            el.trigger("onClose", null, el);
        });
        Utils.exec(options.onUp, [el]);
    },

    _open: function(el){
        if (Utils.isJQueryObject(el) === false) {
            el = $(el);
        }

        var dropdown  = el.data("dropdown");
        var toggle = dropdown._toggle;
        var options = dropdown.options;

        toggle.addClass('active-toggle').addClass("active-control");
        el.slideDown(options.duration, function(){
            el.trigger("onOpen", null, el);
        });
        Utils.exec(options.onDrop, [el]);
    },

    close: function(){
        this._close(this.element);
    },

    open: function(){
        this._open(this.element);
    },

    changeAttribute: function(attributeName){

    }
};

$(document).on('click', function(e){
    $('[data-role*=dropdown]').each(function(){
        var el = $(this);

        if (el.css('display')==='block' && el.hasClass('keep-open') === false) {
            var dropdown = el.data('dropdown');
            dropdown.close();
        }
    });
});

Metro.plugin('dropdown', Dropdown);