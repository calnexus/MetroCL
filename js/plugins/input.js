var Input = {
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
        clearButton: true,
        revealButton: true,
        clearButtonIcon: "<span class='mif-cross'></span>",
        revealButtonIcon: "<span class='mif-eye'></span>",
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
        var container = $("<div>").addClass("input " + element[0].className);
        var buttons = $("<div>").addClass("button-group");
        var clearButton, revealButton;

        if (prev.length === 0) {
            container.appendTo(parent);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);
        buttons.appendTo(container);

        if (o.clearButton !== false) {
            clearButton = $("<button>").addClass("button").attr("tabindex", -1).attr("type", "button").html(o.clearButtonIcon);
            clearButton.on("click", function(){
                element.val("").trigger('change').focus();
            });
            clearButton.appendTo(buttons);
        }
        if (element.attr('type') === 'password' && o.revealButton !== false) {
            revealButton = $("<button>").addClass("button").attr("tabindex", -1).attr("type", "button").html(o.revealButtonIcon);
            revealButton
                .on('mousedown', function(){element.attr('type', 'text');})
                .on('mouseup', function(){element.attr('type', 'password').focus();});
            revealButton.appendTo(buttons);
        }

        if (element.attr('dir') === 'rtl' ) {
            container.addClass("rtl");
        }

        element[0].className = '';

        if (o.disabled === true) {
            this.disable();
        }
    },

    disable: function(){
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        this.element.data("disabled", false);
        this.element.parent().removeClass("disabled");
    }
};

Metro.plugin('input', Input);