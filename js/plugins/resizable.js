var Resizable = {
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
        resizeElement: ".resize-element",
        onResizeStart: function(){},
        onResizeStop: function(){},
        onResize: function(){},
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

        element.on();

        element.on(Metro.eventStart, o.resizeElement, function(e){

            if (element.data("canResize") === false) {
                return ;
            }

            var startXY = Utils.clientXY(e);
            var startWidth = parseInt(element.outerWidth());
            var startHeight = parseInt(element.outerHeight());
            var size = {width: startWidth, height: startHeight};

            Utils.exec(o.onResizeStart, [element, size]);

            $(document).on(Metro.eventMove, function(e){
                var moveXY = Utils.clientXY(e);
                var size = {
                    width: startWidth + moveXY.x - startXY.x,
                    height: startHeight + moveXY.y - startXY.y
                };
                element.css(size);
                Utils.exec(o.onResize, [element, size]);
            });
        });

        element.on(Metro.eventStop, o.resizeElement, function(){
            $(document).off(Metro.eventMove);

            var size = {
                width: parseInt(element.outerWidth()),
                height: parseInt(element.outerHeight())
            };
            Utils.exec(o.onResizeStop, [element, size]);
        });
    },

    off: function(){
        this.element.data("canResize", false);
    },

    on: function(){
        this.element.data("canResize", true);
    },

    changeAttribute: function(attributeName){
    }
};

Metro.plugin('resizable', Resizable);