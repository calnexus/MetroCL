var Listview = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.views = ['list', 'content', 'icons', 'icons-medium', 'icons-large', 'tiles'];

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        effect: "slide",
        duration: 100,
        view: METRO_LISTVIEW_MODE.LIST,
        selectNode: true,
        onNodeInsert: Metro.noop,
        onNodeDelete: Metro.noop,
        onNodeClean: Metro.noop,
        onCollapseNode: Metro.noop,
        onExpandNode: Metro.noop,
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
        var icon, src;

        src = Utils.isTag(data) ? $(data) : $("<img>").attr("src", data);
        icon = $("<span>").addClass("icon");
        icon.html(src);

        return icon;
    },

    _createCaption: function(data){
        return $("<span>").addClass("caption").html(data);
    },

    _createToggle: function(){
        return $("<span>").addClass("node-toggle");
    },

    _createNode: function(data){
        var node;

        node = $("<li>");

        if (data.caption !== undefined) {
            node.prepend(this._createCaption(data.caption));
        }

        if (data.icon !== undefined) {
            node.prepend(this._createIcon(data.icon));
        }

        if (data.html !== undefined) {
            node.append(data.html);
        }

        return node;
    },

    _createView: function(){
        var that = this, element = this.element, o = this.options;
        var nodes = element.find("li");

        element.addClass("listview");
        element.find("ul").addClass("listview");

        $.each(nodes, function(){
            var node = $(this);

            if (node.data("caption") !== undefined) {
                node.prepend(that._createCaption(node.data("caption")));
            }

            if (node.data('icon') !== undefined) {
                node.prepend(that._createIcon(node.data('icon')));
            }

            if (node.children("ul").length > 0) {
                node.addClass("node-group");
                node.append(that._createToggle());
                if (node.data("collapsed") !== true) node.addClass("expanded");
            } else {
                node.addClass("node");
            }
        });

        this.view(o.view);
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on("click", ".node", function(){
            element.find(".node").removeClass("current");
            $(this).toggleClass("current");
        });

        element.on("click", ".node-toggle", function(){
            var node = $(this).closest("li");
            that.toggleNode(node);
        });

        element.on("click", ".node-group > .caption", function(){
            var node = $(this).closest("li");
            node.find("li").addClass("current");
        });

        element.on("dblclick", ".node-group > .caption", function(){
            var node = $(this).closest("li");
            that.toggleNode(node);
        });
    },

    view: function(v){
        var element = this.element, o = this.options;
        var views = this.views;

        if (v === undefined) {
            return o.view;
        }

        if (views.indexOf(v) === -1) {
            return ;
        }

        o.view = v;

        $.each(this.views, function(){
            element.removeClass("view-"+this);
            element.find("ul").removeClass("view-"+this);
        });

        element.addClass("view-" + o.view);
        element.find("ul").addClass("view-" + o.view);
    },

    toggleNode: function(node){
        var element = this.element, o = this.options;
        var func;

        node.toggleClass("expanded");

        if (o.effect === "slide") {
            func = node.hasClass("expanded") !== true ? "slideUp" : "slideDown";
            Utils.exec(o.onCollapseNode, [node, element]);
        } else {
            func = node.hasClass("expanded") !== true ? "fadeOut" : "fadeIn";
            Utils.exec(o.onExpandNode, [node, element]);
        }

        node.children("ul")[func](o.duration);
    },

    add: function(node, data){
        var that = this, element = this.element, o = this.options;
        var target;
        var new_node;
        var toggle;

        if (node === null) {
            target = element;
        } else {
            target = node.children("ul");
            if (target.length === 0) {
                target = $("<ul>").appendTo(node);
                toggle = this._createToggle();
                toggle.appendTo(node);
                node.addClass("expanded");
            }
        }

        new_node = this._createNode(data);

        new_node.appendTo(target);

        Utils.exec(o.onNodeInsert, [node, element]);
    },

    insertBefore: function(node, data){
        var new_node = this._createNode(data);
        new_node.insertBefore(node);
        Utils.exec(this.options.onNodeInsert, [new_node, element]);
    },

    insertAfter: function(node, data){
        var new_node = this._createNode(data);
        new_node.insertAfter(node);
        Utils.exec(this.options.onNodeInsert, [new_node, element]);
    },

    del: function(node){
        var element = this.element;
        var parent_list = node.closest("ul");
        var parent_node = parent_list.closest("li");
        node.remove();
        if (parent_list.children().length === 0 && !parent_list.is(element)) {
            parent_list.remove();
            parent_node.removeClass("expanded");
            parent_node.children(".node-toggle").remove();
        }
        Utils.exec(this.options.onNodeDelete, [node, element]);
    },

    clean: function(node){
        node.children("ul").remove();
        node.removeClass("expanded");
        node.children(".node-toggle").remove();
        Utils.exec(this.options.onNodeClean, [node, element]);
    },

    changeView: function(){
        var element = this.element, o = this.options;
        var new_view = "view-"+element.attr("data-view");
        if (this.views.indexOf(new_view) === -1) {
            return ;
        }
        o.view = new_view;
        this.view();
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "data-view": this.changeView(); break;
        }
    }
};

Metro.plugin('listview', Listview);