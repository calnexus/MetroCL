var Treeview = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        effect: "slide",
        duration: 100,
        onTreeviewCreate: Metro.noop
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

        this._createTree();
        this._createEvents();

        Utils.exec(o.onTreeviewCreate, [element]);
    },

    _createTree: function(){
        var that = this, element = this.element, o = this.options;

        element.addClass("treeview");
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on("click", ".dropdown-toggle", function(e){
            var toggle = $(this);
            var node = toggle.parent();

            that.toggleNode(node);

            e.preventDefault();
        });

        element.on("dblclick", ".caption", function(e){
            var node = $(this).parent();
            var toggle = node.children(".dropdown-toggle");
            var subtree = node.children("ul");

            if (toggle.length > 0 || subtree.length > 0) {
                that.toggleNode(node);
            }

            e.preventDefault();
        });
    },

    toggleNode: function(node){
        var o = this.options;
        var func;

        node.toggleClass("expanded");

        if (o.effect === "slide") {
            func = node.hasClass("expanded") !== true ? "slideUp" : "slideDown";
        } else {
            func = node.hasClass("expanded") !== true ? "fadeOut" : "fadeIn";
        }

        node.children("ul")[func](o.duration);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('treeview', Treeview);