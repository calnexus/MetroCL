var Windows = {
    options: {
        desktop: null,
        winWidth: 300,
        winHeight: 300,
        onWinCreate: function(){},
        onWinDestroy: function(){},
        onCreate: function(){}
    },

    _windows: {},

    setup: function(options){
        this.options = $.extend({}, this.options, options);

        if (this.options.desktop === null) {
            this.options.desktop = $("body");
        } else {
            this.options.desktop = $(this.options.desktop);
        }

        //this.options.desktop.addClass("windows-container");

        return this;
    },

    /*
    * options = {
    *     icon: null,
    *     title: "",
    *     content: eny,
    *     btnClose: true,
    *     btnMin: true,
    *     btnMax: true,
    * }
    * */

    create: function(options){
        var that = this, o = this.options;
        var win_id = Utils.uniqueId();
        var win = $("<div>").addClass("window win-shadow");
        var caption = $("<div>").addClass("window-caption");
        var content = $("<div>").addClass("window-content");
        var buttons, btnClose, btnMin, btnMax, icon, title;

        var objects = Utils.objectLength(this._windows);

        win.css({
            width: options.width ? options.width : o.winWidth,
            height: options.height ? options.height : o.winHeight,
            zIndex: 1,
            position: "absolute",
            top: objects * 16,
            left: objects * 16
        });

        win.data("wID", win_id).attr("id", win_id);
        win.append(caption);
        win.append(content);
        win.appendTo(o.desktop);

        if (options.icon !== undefined) {
            icon = $(options.icon).addClass("icon");
            icon.appendTo(caption);
        }

        if (options.title !== undefined && options.title.trim() !== "") {
            title = $("<span>").addClass("title").html(options.title);
            title.appendTo(caption);
        }

        if (options.btnClose === true || options.btnMin === true || options.btnMax === true) {
            buttons = $("<div>").addClass("buttons");
            buttons.appendTo(caption);

            if (options.btnMax === true) {
                btnMax = $("<span>").addClass("btn-max");
                btnMax.appendTo(buttons);
                btnMax.on("click", function(){
                    win.toggleClass("maximized");
                });
                caption.on("dblclick", function(){
                    win.toggleClass("maximized");
                });
            }

            if (options.btnMin === true) {
                btnMin = $("<span>").addClass("btn-min");
                btnMin.appendTo(buttons);
                btnMin.on("click", function(){
                    win.toggleClass("minimized");
                });
            }

            if (options.btnClose === true) {
                btnClose = $("<span>").addClass("btn-close");
                btnClose.appendTo(buttons);
                btnClose.on("click", function(){
                    that.kill(win);
                });
            }
        }

        if (options.clsCaption !== undefined) {
            caption.addClass(options.clsCaption);
        }

        if (options.clsContent !== undefined) {
            content.addClass(options.clsContent);
        }


        if (options.draggable !== false) {
            win.draggable({
                dragArea: o.desktop,
                dragElement: ".window-caption",
                onDragStop: function () {

                    o.desktop.find(".window").css({
                        zIndex: 1
                    });

                    win.css({
                        zIndex: 2
                    })
                }
            });
        }

        this._windows[win_id] = win;

        Utils.exec(o.onWinCreate, [win]);

        return win;
    },

    setTitle: function(wID, title) {
        var win = $(wID);
        if (win.length === 0) {
            return this;
        }
        win.find(".window-caption title").html(title);
        return this;
    },

    setContent: function(wID, content) {
        var win = $('#'+wID);
        if (win.length === 0) {
            return this;
        }
        win.find(".window-content").html(Utils.isJQueryObject(content) ? content[0] : content);
        return this;
    },

    appendContent: function(wID, content) {
        console.log(wID, content);
        var win = $('#'+wID);
        if (win.length === 0) {
            return this;
        }
        var wc = win.find(".window-content");
        var c = wc.html();
        console.log(c);
        c += Utils.isJQueryObject(content) ? content[0] : content;
        console.log(c);
        wc.html(c);
        return this;
    },

    kill: function(win){
        var that = this, o = this.options;
        win.fadeOut('slow', function(){
            delete that._windows[win.data('wID')];
            win.remove();
            Utils.exec(o.onWinDestroy, [win]);
        });
    },

    killAll: function(){
        var that = this;
        $.each(that._windows, function(){
            //that.kill($(this));
        });
    }

};

$.Metro['windows'] = Windows.setup();