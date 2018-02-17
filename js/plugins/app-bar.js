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
        duration: 100,
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
        var hamburger, menu;

        element.addClass("app-bar");

        hamburger = element.find(".hamburger");
        if (hamburger.length === 0) {
            hamburger = $("<button>").addClass("hamburger").appendTo(element);
            for(var i = 0; i < 3; i++) {
                $("<span>").addClass("line").appendTo(hamburger);
            }

            if (Colors.isLight(Utils.computedRgbToHex(Utils.getStyleOne(element, "background-color"))) === true) {
                hamburger.addClass("dark");
            }
        }

        menu = element.find(".app-bar-menu");

        if( !!element.attr("id") === false ){
            element.attr("id", id);
        }

        if (hamburger.css('display') === 'block') {
            menu.hide().addClass("collapsed");
        }
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;
        var menu = element.find(".app-bar-menu");
        var hamburger = element.find(".hamburger");

        element.on(Metro.events.click, ".hamburger", function(){
            if (menu.length === 0) return ;
            var collapsed = menu.hasClass("collapsed");
            if (collapsed) {
                menu.slideDown(o.duration, function(){
                    menu.removeClass("collapsed");
                    hamburger.addClass("active");
                });
            } else {
                menu.slideUp(o.duration, function(){
                    menu.addClass("collapsed");
                    hamburger.removeClass("active");
                });
            }
        });

        $(window).on(Metro.events.resize+"-"+element.attr("id"), function(){
            if (menu.length === 0) return ;

            if (hamburger.css('display') !== 'block') {
                menu.show();
            } else {
                if (hamburger.hasClass("active")) {
                    menu.show().removeClass("collapsed");
                } else {
                    menu.hide().addClass("collapsed");
                }
            }
        });
    },

    changeAttribute: function(attributeName){

    },

    destroy: function(){
        element.off(Metro.events.click, ".hamburger");
        $(window).off(Metro.events.resize+"-"+element.attr("id"));
    }
};

Metro.plugin('appbar', AppBar);