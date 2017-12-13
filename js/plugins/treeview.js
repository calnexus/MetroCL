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
        onNodeClick: Metro.noop,
        onNodeDblClick: Metro.noop,
        onCheckClick: Metro.noop,
        onRadioClick: Metro.noop,
        onExpandNode: Metro.noop,
        onCollapseNode: Metro.noop,
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

    _createIcon: function(data){
        var icon;

        icon = Utils.isTag(data) ? $(data) : $("<img>").attr("src", data);
        icon.addClass("icon");

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


    _createTree: function(){
        var that = this, element = this.element, o = this.options;
        var nodes = element.find("li");

        element.addClass("treeview");

        $.each(nodes, function(){
            var node = $(this);


            if (node.data("caption") !== undefined) {
                node.prepend(that._createCaption(node.data("caption")));
            }

            if (node.data("icon") !== undefined) {
                node.prepend(that._createIcon(node.data("icon")));
            }

            if (node.children("ul").length > 0) {
                node.append(that._createToggle());
                if (node.data("closed") !== true) {
                    node.addClass("expanded");
                } else {
                    node.children("ul").hide();
                }
            }

        });
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        element.on("click", ".node-toggle", function(e){
            var toggle = $(this);
            var node = toggle.parent();

            that.toggleNode(node);

            e.preventDefault();
        });

        element.on("click", "li > .caption", function(e){
            var node = $(this).parent();

            element.find("li").removeClass("current");
            node.addClass("current");

            Utils.exec(o.onNodeClick, [node, element]);

            e.preventDefault();
        });

        element.on("dblclick", "li > .caption", function(e){
            var node = $(this).closest("li");
            var toggle = node.children(".node-toggle");
            var subtree = node.children("ul");

            if (toggle.length > 0 || subtree.length > 0) {
                that.toggleNode(node);
            }

            Utils.exec(o.onNodeDblClick, [node, element]);

            e.preventDefault();
        });

        element.on("click", "input[type=radio]", function(e){
            var check = $(this);
            var checked = check.is(":checked");
            var node = check.closest("li");

            Utils.exec(o.onRadioClick, [checked, check, node, element]);
        });

        element.on("click", "input[type=checkbox]", function(e){
            var check = $(this);
            var checked = check.is(":checked");
            var node = check.closest("li");
            var checks;

            // down
            checks = check.closest("li").find("ul input[type=checkbox]");
            checks.prop("indeterminate", false);
            checks.prop("checked", checked);

            checks = [];

            $.each(element.find("input[type=checkbox]"), function(){
                checks.push(this);
            });

            $.each(checks.reverse(), function(){
                var ch = $(this);
                var children = ch.closest("li").children("ul").find("input[type=checkbox]").length;
                var children_checked = ch.closest("li").children("ul").find("input[type=checkbox]:checked").length;

                if (children > 0 && children_checked === 0) {
                    ch.prop("indeterminate", false);
                    ch.prop("checked", false);
                }

                if (children_checked === 0) {
                    ch.prop("indeterminate", false);
                } else {
                    if (children_checked > 0 && children > children_checked) {
                        ch.prop("indeterminate", true);
                    } else if (children === children_checked) {
                        ch.prop("indeterminate", false);
                        ch.prop("checked", true);
                    }
                }
            });

            Utils.exec(o.onCheckClick, [checked, check, node, element]);

        });
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

    addTo: function(node, data){
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
    },

    insertBefore: function(node, data){
        var new_node = this._createNode(data);
        new_node.insertBefore(node);
    },

    insertAfter: function(node, data){
        var new_node = this._createNode(data);
        new_node.insertAfter(node);
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
    },

    clean: function(node){
        node.children("ul").remove();
        node.removeClass("expanded");
        node.children(".node-toggle").remove();
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('treeview', Treeview);