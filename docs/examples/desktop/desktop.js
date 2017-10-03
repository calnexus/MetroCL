var Desktop = {
    options: {
        windowArea: ".window-area",
        windowAreaClass: "",
        taskBar: ".task-bar > .tasks",
        taskBarClass: ""
    },

    wins: {},

    setup: function(options){
        this.options = $.extend( {}, this.options, options );
        return this;
    },

    addToTaskBar: function(wnd){
        var icon = wnd.getIcon();
        var wID = wnd.win.attr("id");
        var item = $("<span>").addClass("task-bar-item started").html(icon);

        item.data("wID", wID);

        item.appendTo($(this.options.taskBar));
    },

    removeFromTaskBar: function(wnd){
        var wID = wnd.attr("id");
        var items = $(".task-bar-item");
        var that = this;
        $.each(items, function(){
            var item = $(this);
            if (item.data("wID") === wID) {
                delete that.wins[wID];
                item.remove();
            }
        })
    },

    createWindow: function(o){
        var that = this;
        o.position = "fixed";
        o.onDragStart = function(el, pos){
            console.log(el);
            win = $(el);
            win.css("z-index", 1);
            if (!win.hasClass("modal"))
                win.css("z-index", 3);
        };
        o.onDragStop = function(el, pos){
            console.log(el);
            win = $(el);
            if (!win.hasClass("modal"))
                win.css("z-index", 2);
        };
        o.onDestroy = function(el){
            console.log(el);
            win = el[0];
            that.removeFromTaskBar(win);
        };
        var w = $("<div>").appendTo($(this.options.windowArea));
        var wnd = w.window(o).data("window");
        var win = wnd.win;
        var shift = $.Metro.utils.objectLength(this.wins) * 16;
        win.css({
            top: shift,
            left: shift
        });
        this.wins[win.attr("id")] = wnd;
        this.addToTaskBar(wnd);
    }
};

Desktop.setup();