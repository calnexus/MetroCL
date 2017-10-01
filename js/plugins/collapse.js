var Collapse = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.toggle = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCreate);

        return this;
    },

    options: {
        toggleElement: false,
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
        var toggle;

        toggle = o.toggleElement !== false ? $(o.toggleElement) : element.siblings('.collapse-toggle').length > 0 ? element.siblings('.collapse-toggle') : element.siblings('a:nth-child(1)');

        toggle.on('click', function(e){
            if (element.css('display') === 'block' && !element.hasClass('keep-open')) {
                that._close(element);
            } else {
                that._open(element);
            }
            e.preventDefault();
            e.stopPropagation();
        });

        this.toggle = toggle;
    },

    _close: function(el){

        if (Utils.isJQueryObject(el) === false) {
            el = $(el);
        }

        var dropdown  = el.data("collapse");
        var options = dropdown.options;

        el.slideUp(options.duration, function(){
            el.trigger("onCollapse", null, el);
            el.data("collapsed", true);
            el.addClass("collapsed");
            Utils.exec(options.onUp, [el]);
        });
    },

    _open: function(el){
        if (Utils.isJQueryObject(el) === false) {
            el = $(el);
        }

        var dropdown  = el.data("collapse");
        var options = dropdown.options;

        el.slideDown(options.duration, function(){
            el.trigger("onExpand", null, el);
            el.data("collapsed", false);
            el.removeClass("collapsed");
            Utils.exec(options.onDrop, [el]);
        });
    },

    collapse: function(){
        this._close(this.element);
    },

    expand: function(){
        this._open(this.element);
    },

    isCollapsed: function(){
        return this.element.data("collapsed");
    },

    toggleState: function(){
        var element = this.element;
        if (element.attr("collapsed") === true || element.data("collapsed") === true) {
            this.expand();
        } else {
            this.collapse();
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "collapsed":
            case "data-collapsed": this.toggleState(); break;
        }
    }
};

Metro.plugin('collapse', Collapse);