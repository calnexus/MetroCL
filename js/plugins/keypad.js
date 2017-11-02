var Keypad = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();

        this.keys = Utils.strToArray(this.options.keys, ",");

        this._create();

        return this;
    },

    options: {
        keySize: 32,
        keys: "1, 2, 3, 4, 5, 6, 7, 8, 9, 0",
        copyInlineStyles: true,
        target: null,
        length: 0,

        clsKeypad: "",
        clsInput: "",
        clsKeys: "",
        clsKey: "",
        clsBackspace: "",
        clsClear: "",

        onClear: Metro.noop,
        onBackspace: Metro.noop,
        onShuffle: Metro.noop,
        onKey: Metro.noop,
        onKeypadCreate: Metro.noop
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
        this._createKeypad();
        this._createKeys();
        this._createEvents();

        Utils.exec(this.options.onKeypadCreate, [this.element]);
    },

    _createKeypad: function(){
        var that = this, element = this.element, o = this.options;
        var prev = element.prev();
        var parent = element.parent();
        var keypad = $("<div>").addClass("keypad " + element[0].className);

        if (element.attr("type") === undefined) {
            element.attr("type", "text");
        }

        if (prev.length === 0) {
            parent.prepend(keypad);
        } else {
            keypad.insertAfter(prev);
        }

        element.attr("readonly", true);
        element.appendTo(keypad);

        element.addClass(o.clsInput);
        keypad.addClass(o.clsKeypad);

        element[0].className = '';
        if (o.copyInlineStyles === true) {
            for (var i = 0, l = element[0].style.length; i < l; i++) {
                keypad.css(element[0].style[i], element.css(element[0].style[i]));
            }
        }

        element.on("blur", function(){keypad.removeClass("focused");});
        element.on("focus", function(){keypad.addClass("focused");});

        if (o.disabled === true || element.is(":disabled")) {
            this.disable();
        } else {
            this.enable();
        }
    },

    _createKeys: function(){
        var that = this, element = this.element, o = this.options;
        var keypad = element.parent();
        var factor = Math.round(Math.sqrt(this.keys.length + 2));
        var key_size = o.keySize;
        var width = factor * key_size + factor * 4;
        var key, keys = $("<div>").addClass("keys").addClass("drop-shadow").addClass(o.clsKeys).appendTo(keypad);
        var i, k = this.keys;

        if (o.shuffle === true) {
            k.shuffle();
        }

        $.each(k, function(){
            key = $("<span>").addClass("key").addClass(o.clsKey).html(this);
            key.data("key", this);
            key.css({
                width: o.keySize,
                height: o.keySize,
                lineHeight: o.keySize - 4 + "px"
            }).appendTo(keys);
        });

        var service_keys = ['&larr;', '&times;'];

        $.each(service_keys, function(){
            key = $("<span>").addClass("key service-key").addClass(o.clsKey).html(this);
            if (this === '&larr;') {
                key.addClass(o.clsBackspace);
            }
            if (this === '&times;') {
                key.addClass(o.clsClear);
            }
            key.data("key", this);
            key.css({
                width: o.keySize,
                height: o.keySize,
                lineHeight: o.keySize - 4 + "px"
            }).appendTo(keys);
        });

        keys.width(width);
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;
        var keys = element.parent().find(".keys");

        keys.on("click", ".key", function(e){
            var key = $(this);

            if (key.data('key') !== '&larr;' && key.data('key') !== '&times;') {
                if (o.length > 0 && element.val().length === o.length) {
                    return false;
                }
                element.val(element.val() + '' + key.data('key'));
            } else {
                if (key.data('key') === '&times;') {
                    element.val('');
                }
                if (key.data('key') === '&larr;') {
                    var val = element.val();
                    element.val(val.substring(0, val.length - 1));
                }
            }

            element.trigger('change');

            if (o.shuffle) {
                that.shuffle();
            }

            e.preventDefault();
            e.stopPropagation();
        });
    },

    shuffle: function(){

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

Metro.plugin('keypad', Keypad);