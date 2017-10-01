var WinUtils = {
    create: function(o){
    }
};

var Window = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.win = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCreate);

        return this;
    },

    options: {
        width: "auto",
        height: "auto",
        btnClose: false,
        btnMin: false,
        btnMax: false,
        clsCaption: "",
        clsContent: "",
        draggable: false,
        dragElement: ".window-caption",
        dragArea: "parent",
        shadow: false,
        icon: "",
        title: "Window",
        resizable: false,
        onDragStart: function(){},
        onDragStop: function(){},
        onDragMove: function(){},
        onCaptionDblClick: function(){},
        onCloseClick: function(){},
        onMaxClick: function(){},
        onMinClick: function(){},
        onResizeStart: function(){},
        onResizeStop: function(){},
        onResize: function(){},
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

    createWindow: function(o){
        var win, caption, content, icon, title, buttons, btnClose, btnMin, btnMax, resizer, status;

        win = $("<div>").addClass("window");
        win.css({
            width: o.width,
            height: o.height
        });

        caption = $("<div>").addClass("window-caption");
        content = $("<div>").addClass("window-content");

        win.append(caption);
        win.append(content);

        if (o.status === true) {
            status = $("<div>").addClass("window-status");
            win.append(status);
        }

        if (o.shadow === true) {
            win.addClass("win-shadow");
        }

        if (o.icon !== undefined) {
            icon = $(o.icon).addClass("icon");
            icon.appendTo(caption);
        }

        if (o.title !== undefined) {
            title = $("<span>").addClass("title").html(o.title);
            title.appendTo(caption);
        }

        if (o.content !== undefined) {
            content.html(Utils.isJQueryObject(o.content) ? o.content.html() : o.content);
        }

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

        caption.addClass(o.clsCaption);
        content.addClass(o.clsContent);

        win.attr("id", o.id === undefined ? Utils.uniqueId() : o.id);

        if (o.resizable === true) {
            resizer = $("<span>").addClass("resizer");
            resizer.appendTo(win);
            win.addClass("resizable");
        }

        win.on("dblclick", ".window-caption", function(){
            win.toggleClass("maximized");
            Utils.exec(o.onCaptionDblClick, [win]);
        });
        win.on("click", ".btn-max", function(){
            win.toggleClass("maximized");
            Utils.exec(o.onMaxClick, [win]);
        });
        win.on("click", ".btn-min", function(){
            win.toggleClass("minimized");
            Utils.exec(o.onMinClick, [win]);
        });
        win.on("click", ".btn-close", function(){
            win.fadeOut("slow", function(){
                win.remove();
                Utils.exec(o.onCloseClick, [win]);
                Utils.exec(o.onDestroy, [win]);
            });
        });

        win.on(Metro.eventStart, ".resizer", function(e){

            var startXY = Utils.clientXY(e);
            var startWidth = parseInt(win.outerWidth());
            var startHeight = parseInt(win.outerHeight());

            Utils.exec(o.onResizeStart, [win]);

            $(document).on(Metro.eventMove, function(e){
                var moveXY = Utils.clientXY(e);
                win.css({
                    width: startWidth + moveXY.x - startXY.x,
                    height: startHeight + moveXY.y - startXY.y
                });
                Utils.exec(o.onResize, [win]);
            });
        });

        win.on(Metro.eventStop, ".resizer", function(){
            $(document).off(Metro.eventMove);
            Utils.exec(o.onResizeStop, [win]);
        });

        if (o.draggable === true) {
            win.draggable({
                dragElement: o.dragElement,
                dragArea: o.dragArea,
                onDragStart: o.onDragStart,
                onDragStop: o.onDragStop,
                onDragMove: o.onDragMove
            })
        }

        return win;
    },

    _create: function(){
        var that = this, element = this.element, o = this.options;
        var win;
        var prev = element.prev();
        var parent = element.parent();


        win = this.createWindow(o);

        if (prev.length === 0) {
            parent.prepend(win);
        } else {
            win.insertAfter(prev);
        }

        element.appendTo(win.find(".window-content"));

        this.win = win;
    },

    toggleButtons: function(a) {
        var that = this, element = this.element, win = this.win, o = this.options;
        var btnClose = win.find(".btn-close");
        var btnMin = win.find(".btn-min");
        var btnMax = win.find(".btn-max");

        if (a === "data-btn-close") {
            btnClose.toggle();
        }
        if (a === "data-btn-min") {
            btnMin.toggle();
        }
        if (a === "data-btn-max") {
            btnMax.toggle();
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "data-btn-close":
            case "data-btn-min":
            case "data-btn-max": this.toggleButtons(attributeName); break;
        }
    }
};

Metro.plugin('window', Window);

