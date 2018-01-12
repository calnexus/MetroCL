var NavigationView = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.pane = null;
        this.content = null;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        state: "wide", //compact
        expand: "md",
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

        this.pane = element.children(".navview-pane").length > 0 ? element.children(".navview-pane") : null;
        this.content = element.children(".navview-content").length > 0 ? element.children(".navview-content") : null;
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;
        var pane = this.pane, content = this.content;

        element.on(Metro.events.click, ".pull-button", function(){
            console.log(pane.width());
        });
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('navview', NavigationView);