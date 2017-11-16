var Charms = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        position: "right",
        opacity: 1,
        clsCharms: "",
        onCharmCreate: Metro.noop,
        onOpen: Metro.noop,
        onClose: Metro.noop
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

        element
            .addClass("charms")
            .addClass(o.position + "-side")
            .addClass(o.clsCharms);

        element.css({
            backgroundColor: Utils.computedRgbToRgba(Utils.getStyleOne(element, "background-color"), o.opacity)
        });

        Utils.exec(o.onCharmCreate, [element]);
    },

    open: function(){
        var that = this, element = this.element, o = this.options;

        element.addClass("open");

        Utils.exec(o.onOpen, [element]);
    },

    close: function(){
        var that = this, element = this.element, o = this.options;

        element.removeClass("open");

        Utils.exec(o.onClose, [element]);
    },

    toggle: function(){
        var that = this, element = this.element, o = this.options;

        element.toggleClass("open");

        if (element.hasClass("open") === true) {
            Utils.exec(o.onOpen, [element]);
        } else {
            Utils.exec(o.onClose, [element]);
        }
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('charms', Charms);

Metro['charms'] = {

    check: function(el){
        if (Utils.isMetroObject(el, "charms") === false) {
            console.log("Element is not a charms component");
            return false;
        }
        return true;
    },

    isOpened: function(el){
        if (this.check(el) === false) return ;

        var charms = $(el).data("charms");

        return charms.hasClass("open");
    },

    open: function(el){
        if (this.check(el) === false) return ;

        var charms = $(el).data("charms");
        charms.open();
    },

    close: function(el){
        if (this.check(el) === false) return ;

        var charms = $(el).data("charms");
        charms.close();
    },

    toggle: function(el){
        if (this.check(el) === false) return ;

        var charms = $(el).data("charms");
        charms.toggle();
    },

    closeAll: function(el){
        $('[data-role*=charms]').each(function() {
            $(this).data('charms').close();
        });
    }
};