var Window = {
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
        btnClose: true,
        btnMin: true,
        btnMax: true,
        clsCaption: "",
        clsContent: "",
        draggable: true,
        shadow: true,
        icon: "",
        title: "",
        resizable: false,
        onCreate: function(){},
        onDestroy: function(){}
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
        var is_window = element.hasClass("window") && (element.children(".window-caption").length > 0 && element.children(".window-content").length > 0);
        var win, caption, content, buttons, btnClose, btnMin, btnMax, icon, title, status;
        var prev = element.prev();
        var parent = element.parent();

        if (is_window) {
            win = element;
            caption = element.children(".window-caption");
            content = element.children(".window-content");
            //status = element.children(".window-status");
            if (caption.length > 0) buttons = caption.find(".buttons");
            if (buttons.length > 0) btnClose = buttons.children(".btn-close");
            if (buttons.length > 0) btnMin = buttons.children(".btn-min");
            if (buttons.length > 0) btnMax = buttons.children(".btn-max");
        } else {
            win = $("<div>").addClass("window");
            if (prev.length === 0) {
                parent.prepend(win);
            } else {
                win.insertAfter(prev);
            }
            //status = $("<div>").addClass("window-status");
            caption = $("<div>").addClass("window-caption");
            content = $("<div>").addClass("window-content").append(element);

            win.append(caption);
            win.append(content);
            //win.append(status);

            if (o.icon !== "") {
                icon = $(o.icon).addClass("icon");
                icon.appendTo(caption);
            }

            if (o.title === "") {o.title = "Window";}
            title = $("<span>").addClass("title").html(o.title);
            title.appendTo(caption);


            if (o.btnClose === true || o.btnMin === true || o.btnMax === true) {
                buttons = $("<div>").addClass("buttons");
                buttons.appendTo(caption);

                if (o.btnMax === true) {
                    btnMax = $("<span>").addClass("btn-max");
                    btnMax.appendTo(buttons);
                }

                if (o.btnMin === true) {
                    btnMin = $("<span>").addClass("btn-min");
                    btnMin.appendTo(buttons);
                }

                if (o.btnClose === true) {
                    btnClose = $("<span>").addClass("btn-close");
                    btnClose.appendTo(buttons);
                }
            }
            this.element = win;
        }

        caption.addClass(o.clsCaption);
        content.addClass(o.clsContent);

        if (win.attr("id") === undefined) {
            win.attr("id", Utils.uniqueId());
        }

        if (o.resizable === true) {
            var resizer = $("<span>").addClass("resizer").appendTo(win);
            win.addClass("resizable");
            resizer.on(Metro.eventStart, function(e){

                var startXY = Utils.clientXY(e);
                var startWidth = parseInt(element.outerWidth());
                var startHeight = parseInt(element.outerHeight());

                $(document).on(Metro.eventMove, function(e){
                    var moveXY = Utils.clientXY(e);
                    element.css({
                        width: startWidth + moveXY.x - startXY.x,
                        height: startHeight + moveXY.y - startXY.y
                    });
                });
            });
            resizer.on(Metro.eventStop, function(){
                $(document).off(Metro.eventMove);
            });
        }

        btnMax.on("click", function(){
            win.toggleClass("maximized");
        });
        caption.on("dblclick", function(){
            win.toggleClass("maximized");
        });
        btnMin.on("click", function(){
            win.toggleClass("minimized");
        });
        btnClose.on("click", function(){
            that._destroy(win);
        });

    },

    _destroy: function(){
        var element = this.element, o = this.options;
        element.fadeOut("slow", function(){
            element.remove();
            Utils.exec(o.onDestroy, [element[0]]);
        })
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('window', Window);

