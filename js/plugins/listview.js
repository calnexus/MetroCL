var Listview = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        mode: METRO_LISTVIEW_MODE.LIST,
        onListviewCreate: Metro.noop
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

        this._createView();
        this._createEvents();

        Utils.exec(o.onListviewCreate, [element]);
    },

    _createIcon: function(data){
        var icon;

        icon = Utils.isTag(data) ? $(data) : $("<img>").attr("src", data);
        icon.addClass("icon");

        return icon;
    },

    _createCaption: function(data){
        return $("<span>").addClass("caption").html(data);
    },

    _createView: function(){
        var that = this, element = this.element, o = this.options;
        var nodes = element.find("li");

        element.addClass("listview").addClass("view-" + o.mode);

        $.each(nodes, function(){
            var node = $(this);

            if (node.data("caption") !== undefined) {
                node.prepend(that._createCaption(node.data("caption")));
            }

            if (node.data('icon') !== undefined) {
                node.prepend(that._createIcon(node.data('icon')));
            }
        });
    },

    _createEvents: function(){},

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('listview', Listview);