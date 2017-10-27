var Input = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onInputCreate, [this.element]);

        return this;
    },
    options: {
        clsElement: "",
        clsInput: "",
        clsPrepend: "",
        clsClearButton: "",
        clsRevealButton: "",
        size: "default",
        prepend: "",
        copyInlineStyles: true,
        clearButton: true,
        revealButton: true,
        clearButtonIcon: "<span class='mif-cross'></span>",
        revealButtonIcon: "<span class='mif-eye'></span>",
        customButtons: [],
        disabled: false,
        onInputCreate: Metro.noop
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

        if (element.attr("type") === undefined) {
            element.attr("type", "text");
        }

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);
        buttons.appendTo(container);

        container.addClass(o.clsElement);
        element.addClass(o.clsInput);

        if (o.clearButton !== false) {
            clearButton = $("<button>").addClass("button").addClass(o.clsClearButton).attr("tabindex", -1).attr("type", "button").html(o.clearButtonIcon);
            clearButton.on("click", function(){
                element.val("").trigger('change').trigger('keyup').focus();
            });
            clearButton.appendTo(buttons);
        }
        if (element.attr('type') === 'password' && o.revealButton !== false) {
            revealButton = $("<button>").addClass("button").addClass(o.clsRevealButton).attr("tabindex", -1).attr("type", "button").html(o.revealButtonIcon);
            revealButton
                .on('mousedown', function(){element.attr('type', 'text');})
                .on('mouseup', function(){element.attr('type', 'password').focus();});
            revealButton.appendTo(buttons);
        }

        if (o.prepend !== "") {
            var prepend = Utils.isTag(o.prepend) ? $(o.prepend) : $("<span>"+o.prepend+"</span>");
            prepend.addClass("prepend").addClass(o.clsPrepend).appendTo(container);
        }

        if (typeof o.customButtons === "string") {
            o.customButtons = Utils.isObject(o.customButtons);
        }

        if (typeof o.customButtons === "object" && Utils.objectLength(o.customButtons) > 0) {
            $.each(o.customButtons, function(){
                var item = this;
                var customButton = $("<button>").addClass("button custom-input-button").addClass(item.cls).attr("tabindex", -1).attr("type", "button").html(item.html);
                customButton.on("click", function(){
                    Utils.exec(item.onclick, [customButton, element]);
                });
                customButton.appendTo(buttons);
            });
        }

        if (element.attr('dir') === 'rtl' ) {
            container.addClass("rtl").attr("dir", "rtl");
        }

        element[0].className = '';
        if (o.copyInlineStyles === true) {
            for (var i = 0, l = element[0].style.length; i < l; i++) {
                container.css(element[0].style[i], element.css(element[0].style[i]));
            }
        }

        if (o.size !== "default") {
            container.css({
                width: o.size
            });
        }

        element.on("blur", function(){container.removeClass("focused");});
        element.on("focus", function(){container.addClass("focused");});

        if (o.disabled === true || element.is(":disabled")) {
            this.disable();
        } else {
            this.enable();
        }
    },

    disable: function(){
        //this.element.attr("disabled", true);
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        //this.element.attr("disabled", false);
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

    toggleValid: function(){
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'disabled': this.toggleState(); break;
            case 'data-valid': this.toggleValid(); break;
        }
    }
};

Metro.plugin('input', Input);