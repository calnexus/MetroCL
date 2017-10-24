var Select = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onSelectCreate, [this.element]);

        return this;
    },
    options: {
        copyInlineStyles: true,
        dropHeight: 200,
        disabled: false,
        onChange: Metro.noop,
        onSelectCreate: Metro.noop
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
        var container = $("<div>").addClass("select " + element[0].className);
        var multiple = element.prop("multiple");
        var select_id = Utils.uniqueId();

        container.attr("id", select_id).addClass("dropdown-toggle");

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);

        if (multiple === false) {
            var input = $("<input data-role='input'>").attr("type", "text").attr("name", "__" + element.attr("name") + "__").prop("readonly", true);
            var list = $("<ul>").addClass("d-menu").css({
                "max-height": o.dropHeight
            });
            $.each(element.children(), function(){
                var opt = this, option = $(this);
                var l, a;

                l = $("<li>").data('value', opt.value).appendTo(list);
                a = $("<a>").html(opt.text).appendTo(l).addClass(opt.className);

                if (option.is(":selected")) {
                    input.val(opt.value).trigger("change");
                }

                a.appendTo(l);
                l.appendTo(list);
            });
            list.on("click", "li", function(){
                var val = $(this).data('value');
                var list_obj = list.data('dropdown');
                input.val(val).trigger("change");
                element.val(val);
                element.trigger("change");
                list_obj.close();
                Utils.exec(o.onChange, [val]);
                //console.log(element.val());
            });
            container.on("click", function(e){
                e.preventDefault();
                e.stopPropagation();
            });

            input.on("blur", function(){container.removeClass("focused");});
            input.on("focus", function(){container.addClass("focused");});

            container.append(input);
            container.append(list);
            list.dropdown({
                toggleElement: "#"+select_id
            });
        }

        if (o.copyInlineStyles === true) {
            for (var i = 0, l = element[0].style.length; i < l; i++) {
                container.css(element[0].style[i], element.css(element[0].style[i]));
            }
        }

        if (o.disabled === true || element.is(':disabled')) {
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

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('select', Select);