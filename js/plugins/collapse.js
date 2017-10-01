var Collapse = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this._toggle = null;

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
        onDrop: function(){},
        onUp: function(){},
        onCreate: function(){}
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

        toggle = o.toggleElement !== false ? $(o.toggleElement) : element.siblings('.collapse-toggle').length > 0 ? element.siblings('.collapse-toggle') : element.siblings('a:nth-child(1)');

        toggle.on('click', function(e){
            parent.siblings(parent[0].tagName).removeClass("active-container");
            $(".active-container").removeClass("active-container");

            if (element.css('display') === 'block' && !element.hasClass('keep-open')) {
                that._close(element);
            } else {
                $('[data-role=collapse]').each(function(i, el){
                    if (!element.parents('[data-role=collapse]').is(el) && !$(el).hasClass('keep-open') && $(el).css('display') === 'block') {
                        that._close(el);
                    }
                });
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

        var dropdown  = el.data("collapse");
        var toggle = dropdown._toggle;
        var options = dropdown.options;

        el.slideUp(options.duration, function(){
            el.trigger("onClose", null, el);
            toggle.removeClass('active-toggle').removeClass("active-control");

            Utils.exec(options.onUp, [el]);
        });
    },

    _open: function(el){
        if (Utils.isJQueryObject(el) === false) {
            el = $(el);
        }

        var dropdown  = el.data("collapse");
        var toggle = dropdown._toggle;
        var options = dropdown.options;

        el.slideDown(options.duration, function(){
            el.trigger("onOpen", null, el);
            toggle.addClass('active-toggle').addClass("active-control");

            Utils.exec(options.onDrop, [el]);
        });
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
    $('[data-role*=collapse]').each(function(){
        var el = $(this);

        if (el.css('display')==='block' && el.hasClass('keep-open') === false) {
            var dropdown = el.data('collapse');
            dropdown.close();
        }
    });
});

Metro.plugin('collapse', Collapse);