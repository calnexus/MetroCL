var Keypad = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.value = "";

        this._setOptionsFromDOM();

        this.keys = Utils.strToArray(this.options.keys, ",");
        this.keys_to_work = this.keys;

        this._create();

        return this;
    },

    options: {
        keySize: 32,
        keys: "1, 2, 3, 4, 5, 6, 7, 8, 9, 0",
        copyInlineStyles: true,
        target: null,
        length: 0,
        shuffle: false,
        position: "bottom-center", //top-left, top, top-right, right, bottom-right, bottom, bottom-left, left
        serviceButtons: true,
        showValue: true,

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
        if (this.options.shuffle === true) {
            this.shuffle();
        }
        this._createKeys();
        this._createEvents();

        Utils.exec(this.options.onKeypadCreate, [this.element]);
    },

    _createKeypad: function(){
        var that = this, element = this.element, o = this.options;
        var prev = element.prev();
        var parent = element.parent();
        var keypad;

        if (parent.hasClass("input")) {
            keypad = parent;
        } else {
            keypad = $("<div>").css({
                position: "relative"
            }).addClass(element[0].className);
        }

        keypad.addClass("keypad");

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
        var key, keys = keypad.find(".keys");
        var i, k = this.keys;

        if (keys.length === 0) {
            keys = $("<div>").addClass("keys").addClass("drop-shadow").addClass(o.clsKeys).appendTo(keypad);
        }

        keys.html("");

        $.each(this.keys_to_work, function(){
            key = $("<span>").addClass("key").addClass(o.clsKey).html(this);
            key.data("key", this);
            key.css({
                width: o.keySize,
                height: o.keySize,
                lineHeight: o.keySize - 4 + "px"
            }).appendTo(keys);
        });

        if (o.serviceButtons === true) {

            var service_keys = ['&larr;', '&times;'];

            $.each(service_keys, function () {
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
        }

        keys.width(width);
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;
        var keypad = element.parent();
        var keys = keypad.find(".keys");

        keypad.on("click", ".keys", function(e){
            e.preventDefault();
            e.stopPropagation();
        });

        keypad.on("click", function(e){
            if (keys.hasClass("open") === true) {
                keys.removeClass("open");
            } else {
                keys.addClass("open");
            }
            e.preventDefault();
            e.stopPropagation();
        });

        keypad.on("click", ".key", function(e){
            var key = $(this);

            if (key.data('key') !== '&larr;' && key.data('key') !== '&times;') {
                if (o.length > 0 && (String(that.value).length === o.length)) {
                    return false;
                }

                that.value = that.value + "" + key.data('key');

                if (o.shuffle === true) {
                    that.shuffle();
                    that._createKeys();
                }
            } else {
                if (key.data('key') === '&times;') {
                    that.value = "";
                }
                if (key.data('key') === '&larr;') {
                    that.value = (that.value.substring(0, that.value.length - 1));
                }
            }

            if (o.showValue === true) {
                if (element[0].tagName === "INPUT") {
                    element.val(that.value);
                } else {
                    element.text(that.value);
                }
            }

            element.trigger('change');

            e.preventDefault();
            e.stopPropagation();
        });

        if (o.target !== null) {
            element.on("change", function(){
                var t = $(o.target);
                if (t.length === 0) {
                    return ;
                }
                if (t[0].tagName === "INPUT") {
                    t.val(that.value);
                } else {
                    t.text(that.value);
                }
            });
        }
    },

    shuffle: function(){
        this.keys_to_work = this.keys_to_work.shuffle();
    },

    val: function(v){
        if (v !== undefined) {
            this.value = v;
            this.element[0].tagName === "INPUT" ? this.element.val(v) : this.element.text(v);
        } else {
            return this.value;
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

Metro.plugin('keypad', Keypad);

$(document).on('click', function(e){
    $(".keypad .keys").removeClass("open");
});
