var Dialog = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.interval = null;
        this.overlay = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCreate, [this.element]);

        return this;
    },

    options: {
        title: "",
        content: "",
        actions: {},
        overlay: true,
        overlayColor: '#000000',
        overlayAlpha: .5,
        overlayClickClose: false,
        width: '480',
        height: 'auto',
        duration: METRO_ANIMATION_DURATION,
        easing: 'swing',
        closeAction: true,
        closeElement: ".js-dialog-close",
        clsDialog: "",
        clsTitle: "",
        clsContent: "",
        autoHide: 0,
        removeOnClose: false,
        show: false,
        onOpen: Metro.noop,
        onClose: Metro.noop,
        onCreate: Metro.noop
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
        var body = $("body");
        var overlay;

        element.addClass("dialog");

        if (element.attr("id") === undefined) {
            element.attr("id", Utils.uniqueId());
        }

        if (o.title !== "") {
            this.setTitle(o.title);
        }

        if (o.content !== "") {
            this.setContent(o.content);
        }

        if (o.actions !== false && typeof o.actions === 'object' && Utils.objectLength(o.actions) > 0) {
            var buttons = $("<div>").addClass("dialog-actions").appendTo(element);
            $.each(o.actions, function(){
                var item = this;
                var button = $("<button>").addClass("button").addClass(item.cls).html(item.caption);
                if (item.onclick !== undefined) button.on("click", function(){
                    Utils.exec(item.onclick, [element]);
                });
                button.appendTo(buttons);
            });
        }

        if (o.overlay === true) {
            overlay  = this._overlay();
            this.overlay = overlay;
        }

        if (o.closeAction === true) {
            element.on("click", ".js-dialog-close", function(){
                that.close();
            });
        }

        element.css({
            width: o.width,
            height: o.height,
            visibility: "hidden",
            top: '100%',
            left: Utils.placeElement(element, "center").left
        });

        element.addClass(o.clsDialog);
        element.find(".dialog-title").addClass(o.clsTitle);
        element.find(".dialog-content").addClass(o.clsContent);

        element.appendTo(body);

        if (o.show) {
            this.open();
        }
    },

    _overlay: function(){
        var that = this, element = this.element, o = this.options;

        var overlay = $("<div>");
        overlay.addClass("overlay");

        if (o.overlayColor === 'transparent') {
            overlay.addClass("transparent");
        } else {
            overlay.css({
                background: Utils.hex2rgba(o.overlayColor, o.overlayAlpha)
            });
        }

        return overlay;
    },

    hide: function(callback){
        var element = this.element, o = this.options;
        element.animate({
            top: "100%",
            opacity: 0
        }, o.duration, function(){
            element.css({
                visibility: "hidden"
            });
            if (o.removeOnClose === true) {
                element.remove();
            }
            Utils.callback(callback);
        });
    },

    show: function(callback){
        var element = this.element, o = this.options;
        //this._setContent();
        console.log("show");
        element.css({
            visibility: "visible",
            top: "100%"
        }).animate({
            top: Utils.placeElement(element, "center").top,
            opacity: 1
        }, o.duration, o.easing, function () {
            Utils.callback(callback);
        });
    },

    setPosition: function(){
        var element = this.element;
        element.css(Utils.placeElement(element, "center"));
    },

    setContent: function(c){
        var that = this, element = this.element, o = this.options;
        var content = element.find(".dialog-content");
        if (content.length === 0) {
            content = $("<div>").addClass("dialog-content");
            content.appendTo(element);
        }

        if (!Utils.isJQueryObject(c) && Utils.isFunc(c)) {
            c = Utils.exec(c);
        }

        if (Utils.isJQueryObject(c)) {
            c.appendTo(content);
        } else {
            content.html(c);
        }

        this.setPosition();
    },

    setTitle: function(t){
        var that = this, element = this.element, o = this.options;
        var title = element.find(".dialog-title");
        if (title.length === 0) {
            title = $("<div>").addClass("dialog-title");
            title.appendTo(element);
        }
        title.html(t);

        this.setPosition();
    },

    close: function(){
        var that = this, element = this.element, o = this.options;

        $('body').find('.overlay').remove();

        this.hide(function(){
            element.data("open", false);
            Utils.exec(o.onClose, [element]);
        });
    },

    open: function(){
        var that = this, element = this.element, o = this.options;

        if (o.overlay === true) {
            this.overlay.appendTo($("body"));
            if (o.overlayClickClose === true) {
                this.overlay.on("click", function(){
                    that.close();
                });
            }
        }

        this.show(function(){
            Utils.exec(o.onOpen, [element]);
            element.data("open", true);
            if (parseInt(o.autoHide) > 0) {
                setTimeout(function(){
                    that.close();
                }, parseInt(o.autoHide));
            }
        });
    },

    toggle: function(){
        var element = this.element;
        if (element.data('open')) {
            this.close();
        } else {
            this.open();
        }
    },

    isOpen: function(){
        return this.element.data('open') === true;
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('dialog', Dialog);

Metro['dialog'] = {

    isDialog: function(el){
        return Utils.isMetroObject(el, "dialog");
    },

    open: function(el, content, title){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        if (title !== undefined) {
            dialog.setTitle(title);
        }
        if (content !== undefined) {
            dialog.setContent(content);
        }
        dialog.open();
    },

    close: function(el){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        dialog.close();
    },

    toggle: function(el){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        dialog.toggle();
    },

    isOpen: function(){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        return dialog.isOpen();
    },

    remove: function(el){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        dialog.options.removeOnClose = true;
        dialog.close();
    },

    create: function(options){
        var dlg;

        dlg = $("<div>").appendTo($("body"));

        var dlg_options = $.extend({}, {
            show: true,
            closeAction: true,
            removeOnClose: true
        }, (options !== undefined ? options : {}));

        return dlg.dialog(dlg_options);
    }
};