var WinUtils = {
    window: function(o){
        var win, caption, content, icon, title, buttons, btnClose, btnMin, btnMax, resizer, status;

        win = $("<div>").addClass("window");
        win.css({
            width: o.width,
            height: o.height,
            position: o.position,
            top: o.top,
            left: o.left
        });

        if (o.modal === true) {
            win.addClass("modal");
        }

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
            icon = $("<span>").addClass("icon").html(o.icon);
            icon.appendTo(caption);
        }

        if (o.title !== undefined) {
            title = $("<span>").addClass("title").html(o.title);
            title.appendTo(caption);
        }

        if (o.content !== undefined && o.content !== 'original') {

            if (Utils.isUrl(o.content) && Utils.isVideoUrl(o.content)) {
                o.content = Utils.embedUrl(o.content);
            }

            if (!Utils.isJQueryObject(o.content) && Utils.isFunc(o.content)) {
                o.content = Utils.exec(o.content);
            }

            if (Utils.isJQueryObject(o.content)) {
                o.content.appendTo(content);
            } else {
                content.html(o.content);
            }
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

        win.attr("id", o.id === undefined ? Utils.uniqueId() : o.id);

        if (o.resizable === true) {
            resizer = $("<span>").addClass("resize-element");
            resizer.appendTo(win);
            win.addClass("resizable");
        }

        win.on("dblclick", ".window-caption", function(){
            win.toggleClass("maximized");
            Utils.exec(o.onCaptionDblClick, win);
        });
        win.on("click", ".btn-max", function(){
            win.toggleClass("maximized");
            Utils.exec(o.onMaxClick, win);
        });
        win.on("click", ".btn-min", function(){
            win.toggleClass("minimized");
            Utils.exec(o.onMinClick, win);
        });
        win.on("click", ".btn-close", function(){
            win.fadeOut(METRO_ANIMATION_DURATION, function(){
                if (o.modal === true) {
                    win.siblings(".overlay").remove();
                }
                win.remove();
                Utils.exec(o.onCloseClick, win);
                Utils.exec(o.onDestroy, win);
            });
        });

        if (o.resizable === true) {
            win.resizable({
                resizeElement: ".resize-element",
                onResizeStart: o.onResizeStart,
                onResizeStop: o.onResizeStop,
                onResize: o.onResize
            });
        }

        if (o.draggable === true) {
            win.draggable({
                dragElement: o.dragElement,
                dragArea: o.dragArea,
                onDragStart: o.onDragStart,
                onDragStop: o.onDragStop,
                onDragMove: o.onDragMove
            })
        }


        if (o.place !== 'auto') {
            win.css(Utils.placeElement(win, o.place));
        }

        win.addClass(o.clsWindow);
        caption.addClass(o.clsCaption);
        content.addClass(o.clsContent);

        return win;
    },

    overlay: function(transparent){
        var o = $("<div>").addClass("overlay");
        if (transparent === true) {
            o.addClass("transparent");
        }

        return o;
    }
};

var Window = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.win = null;
        this.overlay = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCreate, [this.win, this.element]);

        return this;
    },

    options: {
        width: "auto",
        height: "auto",
        btnClose: true,
        btnMin: true,
        btnMax: true,
        clsCaption: "",
        clsContent: "",
        clsWindow: "",
        draggable: true,
        dragElement: ".window-caption",
        dragArea: "parent",
        shadow: false,
        icon: "",
        title: "Window",
        content: "original",
        resizable: true,
        overlay: false,
        overlayTransparent: false,
        modal: false,
        position: "absolute",
        checkEmbed: true,
        top: "auto",
        left: "auto",
        place: "auto",
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
        onShow: function(){},
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
        var win, overlay;
        var prev = element.prev();
        var parent = element.parent();
        var body = $("body");

        if (o.modal === true) {
            o.btnMax = false;
            o.btnMin = false;
            o.resizable = false;
        }

        if (o.content === "original") {
            o.content = element;
        }

        win = WinUtils.window(o);

        if (o.overlay === true) {
            overlay = WinUtils.overlay(o.overlayTransparent).appendTo(win.parent());
            this.overlay = overlay;
        }

        if (prev.length === 0) {
            parent.prepend(win);
        } else {
            win.insertAfter(prev);
        }

        Utils.exec(o.onShow, win);

        this.win = win;
    },

    maximized: function(){
        var that = this, win = this.win,  element = this.element, o = this.options;
        win.toggleClass("maximized");
    },

    minimized: function(){
        var that = this, win = this.win,  element = this.element, o = this.options;
        win.toggleClass("minimized");
    },

    close: function(){
        var that = this, win = this.win,  element = this.element, o = this.options;
        win.fadeOut(METRO_ANIMATION_DURATION, function(){
            if (o.modal === true) {
                win.siblings(".overlay").remove();
            }
            win.remove();
            Utils.exec(o.onDestroy, win);
        });
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

    changeSize: function(a){
        var that = this, element = this.element, win = this.win, o = this.options;
        if (a === "data-width") {
            win.css("width", element.data("width"));
        }
        if (a === "data-height") {
            win.css("height", element.data("height"));
        }
    },

    changeClass: function(a){
        var that = this, element = this.element, win = this.win, o = this.options;
        if (a === "data-cls-caption") {
            win.find(".window-caption")[0].className = element.attr("data-cls-caption");
        }
        if (a === "data-cls-content") {
            win.find(".window-content")[0].className = element.attr("data-cls-content");
        }
    },

    toggleShadow: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var flag = JSON.parse(element.attr("data-shadow"));
        if (flag === true) {
            win.addClass("win-shadow");
        } else {
            win.removeClass("win-shadow");
        }
    },

    setContent: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var content = element.attr("data-content");
        var result;

        if (!Utils.isJQueryObject(content) && Utils.isFunc(content)) {
            result = Utils.exec(content);
        } else if (Utils.isJQueryObject(content)) {
            result = content.html();
        } else {
            result = content;
        }

        win.find(".window-content").html(result);
    },

    setTitle: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var title = element.attr("data-title");
        win.find(".window-caption .title").html(title);
    },

    setIcon: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var icon = element.attr("data-icon");
        win.find(".window-caption .icon").html(icon);
    },

    getIcon: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        return win.find(".window-caption .icon").html();
    },

    getTitle: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        return win.find(".window-caption .title").html();
    },

    toggleDraggable: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var flag = JSON.parse(element.attr("data-draggable"));
        var drag = win.data("draggable");
        if (flag === true) {
            drag.on();
        } else {
            drag.off();
        }
    },

    toggleResizable: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var flag = JSON.parse(element.attr("data-resizable"));
        var resize = win.data("resizable");
        if (flag === true) {
            resize.on();
            win.find(".resize-element").removeClass("resize-element-disabled");
        } else {
            resize.off();
            win.find(".resize-element").addClass("resize-element-disabled");
        }
    },

    changeTopLeft: function(a){
        var that = this, element = this.element, win = this.win, o = this.options;
        var pos;
        if (a === "data-top") {
            pos = parseInt(element.attr("data-top"));
            if (!isNaN(pos)) {
                return ;
            }
            win.css("top", pos);
        }
        if (a === "data-left") {
            pos = parseInt(element.attr("data-left"));
            if (!isNaN(pos)) {
                return ;
            }
            win.css("left", pos);
        }
    },

    changePlace: function (a) {
        var that = this, element = this.element, win = this.win, o = this.options;
        var place = element.attr("data-place");
        Utils.placeElement(win, place);
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "data-btn-close":
            case "data-btn-min":
            case "data-btn-max": this.toggleButtons(attributeName); break;
            case "data-width":
            case "data-height": this.changeSize(attributeName); break;
            case "data-cls-caption":
            case "data-cls-content": this.changeClass(attributeName); break;
            case "data-shadow": this.toggleShadow(); break;
            case "data-icon": this.setIcon(); break;
            case "data-title": this.setTitle(); break;
            case "data-content": this.setContent(); break;
            case "data-draggable": this.toggleDraggable(); break;
            case "data-resizable": this.toggleResizable(); break;
            case "data-top":
            case "data-left": this.changeTopLeft(attributeName); break;
            case "data-place": this.changePlace(attributeName); break;
        }
    }
};

Metro.plugin('window', Window);

