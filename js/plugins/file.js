var File = {
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
        caption: "Choose file",
        disabled: false,
        onCreate: $.noop()
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
        var prev = element.prev();
        var parent = element.parent();
        var container = $("<div>").addClass("file " + element[0].className);
        var caption = $("<span>").addClass("caption");
        var button;

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);
        caption.insertBefore(element);

        element.on('change', function(){
            var val = $(this).val();
            if (val !== '') {
                caption.html(val.replace(/.+[\\\/]/, ""));
                caption.attr('title', val.replace(/.+[\\\/]/, ""));
            }
        });

        button = $("<button>").addClass("button").attr("tabindex", -1).attr("type", "button").html(o.caption);
        button.appendTo(container);

        button.on('click', function(){
            element.trigger("click");
        });

        if (element.attr('dir') === 'rtl' ) {
            container.addClass("rtl");
        }

        element[0].className = '';

        if (o.disabled === true || element.is(":disabled")) {
            this.disable();
        } else {
            this.enable();
        }
    },

    disable: function(){
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        this.element.data("disabled", false);
        this.element.parent().removeClass("disabled");
    },

    toggleState: function(){
        if (this.element.data("disabled") === false) {
            this.disable();
        } else {
            this.enable();
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'disabled': this.toggleState(); break;
        }
    }
};

Metro.plugin('file', File);