var AppBar = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        onAppBarCreate: Metro.noop
    },

    _setOptionsFromDOM: function(){
        var that = this, element = this.element, o = this.options;

        $.each(element.data(), function(key, value){
            if (key in o) {
                try {
                    o[key] = JSON.parse(value);
                } catch (e) {
                    o[key] = value;
                }
            }
        });
    },

    _create: function(){
        var that = this, element = this.element, o = this.options;

        this._createStructure();
        this._createEvents();

        Utils.exec(o.onAppBarCreate, [element]);
    },

    _createStructure: function(){
        var that = this, element = this.element, o = this.options;
        var id = Utils.elementId("app-bar");

        element.addClass("app-bar");

        if( !!element.attr("id") === false ){
            element.attr("id", id);
        }
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on(Metro.events.click, ".hamburger", function(){
            element.find(".app-bar-menu").toggleClass("collapsed");
        });
    },

    changeAttribute: function(attributeName){

    },

    destroy: function(){

    }
};

Metro.plugin('appbar', AppBar);