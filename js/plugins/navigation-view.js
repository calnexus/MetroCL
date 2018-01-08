var NavigationView = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        onNavigationViewCreate: Metro.noop
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

        this._createView();
        this._createEvents();

        Utils.exec(o.onNavigationViewCreate, [element]);
    },

    _createView: function(){
        var that = this, element = this.element, o = this.options;

        element.addClass("navview");
    },

    _createEvents: function(){},

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('navigationView', NavigationView);