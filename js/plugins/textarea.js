var Textarea = {
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
        autoSize: false,
        maxHeight: 200,
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
        var container = $("<div>").addClass("textarea " + element[0].className);

        element.detach().appendTo(container);

        if (prev.length === 0) {
            container.appendTo(parent);
        } else {
            container.insertAfter(prev);
        }

        var resize = function(){
            element[0].style.height = 0;

            var adjust = element[0].scrollHeight;

            if (o.maxHeight > 0) {
                if (o.maxHeight > adjust) {
                    element[0].style.height = adjust + 'px';
                } else {
                    element[0].style.height = o.maxHeight + 'px';
                }
            } else {
                element[0].style.height = adjust + 'px';
            }
        };

        if (o.autoSize) {

            container.addClass("autosize");

            element.on('keyup', resize);
            element.on('keydown', resize);
            element.on('change', resize);
            element.on('focus', resize);
            element.on('cut', resize);
            element.on('paste', resize);
            element.on('drop', resize);
        }

        element[0].className = '';

        if (o.disabled === true && element.is(':disabled')) {
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

Metro.plugin('textarea', Textarea);