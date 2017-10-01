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

    // options: {
    //     width: "auto",
    //     height: "auto",
    //     btnClose: false,
    //     btnMin: false,
    //     btnMax: false,
    //     clsCaption: "",
    //     clsContent: "",
    //     draggable: false,
    //     dragElement: ".window-caption",
    //     dragArea: "parent",
    //     shadow: false,
    //     icon: "",
    //     title: "Window",
    //     resizable: false,
    //     onDragStart: function(){},
    //     onDragStop: function(){},
    //     onDragMove: function(){},
    //     onCaptionDblClick: function(){},
    //     onCloseClick: function(){},
    //     onMaxClick: function(){},
    //     onMinClick: function(){},
    //     onResizeStart: function(){},
    //     onResizeStop: function(){},
    //     onResize: function(){},
    //     onCreate: function(){},
    //     onDestroy: function(){}
    // },

    create: function(options){
        var that = this, o = this.options;
        var win;
        var objects_count = Utils.objectLength(this._windows);

        options.onDragStop = function(){
            o.desktop.find(".window").css({
                zIndex: 1
            });

            win.css({
                zIndex: 2
            })
        };
        options.onDestroy = function(){
            Utils.exec(o.onWinDestroy, [win]);
        };
        win = Window.createWindow(options);

        win.css({
            width: options.width ? options.width : o.winWidth,
            height: options.height ? options.height : o.winHeight,
            zIndex: 1,
            position: "absolute",
            top: objects_count * 16,
            left: objects_count * 16
        });

        win.appendTo(o.desktop);

        this._windows[win.attr("id")] = win;

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
        win.find(".window-content").html(Utils.isJQueryObject(content) ? content.html() : content);
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

    killAll: function(){
        var that = this;
        $.each(that._windows, function(){
            //that.kill($(this));
        });
    }
};

$.Metro['windows'] = Windows.setup();