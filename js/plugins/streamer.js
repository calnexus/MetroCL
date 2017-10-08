var Streamer = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.data = null;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        source: null,
        data: null,
        onCreate: function(){}
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

        element.addClass("streamer");

        if (o.source === null && o.data === null) {
            return false;
        }

        if (o.source !== null) {
            $.get(o.source, function(data){
                that.data = data;
                that.build();
            });
        } else {
            this.data = o.data;
            this.build();
        }
    },

    build: function(){
        var that = this, element = this.element, o = this.options, data = this.data;
        var streams = $("<div>").addClass("streams").appendTo(element);
        var events_area = $("<div>").addClass("events-area").appendTo(element);
        var timeline = $("<ul>").addClass("streamer-timeline").appendTo(events_area);

        if (data.actions !== undefined) {
            var actions = $("<div>").addClass("streamer-actions").appendTo(streams);
            $.each(data.actions, function(){
                var item = this;
                var button = $("<button>").addClass("streamer-action").addClass(item.cls).html(item.html);
                if (item.onclick !== undefined) button.on("click", function(){
                    Utils.exec(item.onclick, [element]);
                });
                button.appendTo(actions);
            });
        }

        if (data.streams !== undefined) {
            $.each(data.streams, function(){
                var item = this;
                var stream = $("<div>").addClass("stream").addClass(this.cls).appendTo(streams);

                $("<div>").addClass("stream-title").html(this.title).appendTo(stream);
                $("<div>").addClass("stream-secondary").html(this.secondary).appendTo(stream);
                $(this.icon).addClass("stream-icon").appendTo(stream);
            });
        }

        Utils.exec(o.onCreate, [element]);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('streamer', Streamer);