var Validator = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCreate, this.element[0]);

        return this;
    },
    options: {
        onBeforeSubmit: function(){},
        onSubmit: function(){},
        onError: function(){},
        onValid: function(){},
        onCreate: function(){}
    },

    _onsubmit: null,
    _action: null,

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

    is_control: function(el){
        return el.parent().hasClass("input") || el.parent().hasClass("select") || el.parent().hasClass("textarea")
    },

    _create: function(){
        var that = this, element = this.element, o = this.options;
        var inputs = element.find("[data-validate]");

        this._action = element[0].action;

        element
            .attr("novalidate", 'novalidate')
            .attr("action", "javascript:");

        $.each(inputs, function(){
            var input = $(this);
            var funcs = input.data("validate");
            var required = funcs.indexOf("required") > -1;
            if (required) {
                if (that.is_control(input)) {
                    input.parent().addClass("required");
                } else {
                    input.addClass("required");
                }
            }
        });

        this._onsubmit = null;

        if (element[0].onsubmit !== null) {
            this._onsubmit = element[0].onsubmit;
            element[0].onsubmit = null;
        }

        element[0].onsubmit = function(){
            return that._submit();
        };
    },

    _submit: function(){
        var that = this, element = this.element, o = this.options;
        var inputs = element.find("[data-validate]");
        var submit = element.find(":submit").attr('disabled', 'disabled').addClass('disabled');
        var result = 0;

        $.each(inputs, function(){
            var this_result = true;
            var input = $(this);
            var control = that.is_control(input);
            var funcs = input.data('validate') !== undefined ? String(input.data('validate')).split(",").map(function(s){return s.trim();}) : [];

            if (input.is(":disabled")) return;

            if (control) {
                input.parent().removeClass("invalid valid");
            } else {
                input.removeClass("invalid valid");
            }

            $.each(funcs, function(){
                if (this_result === false) return;
                var f = this.split("=")[0], a = this.split("=")[1];
                if (f === 'compare') {
                    a = that.element[0].elements[a].value;
                }
                this_result = that._funcs[f](input.val(), a);
                result += this_result ? 0 : 1;
            });

            if (this_result === false) {
                if (control) {
                    input.parent().addClass("invalid")
                } else {
                    input.addClass("invalid")
                }

                Utils.exec(o.onError, [input, input.val()]);

            } else {
                if (control) {
                    input.parent().addClass("valid")
                } else {
                    input.addClass("valid")
                }

                Utils.exec(o.onValid, [input, input.val()]);
            }
        });

        submit.removeAttr("disabled").removeClass("disabled");

        element[0].action = this._action;

        result += Utils.exec(o.onBeforeSubmit, [element[0]]) === false ? 1 : 0;

        if (result === 0) {
            Utils.exec(o.onSubmit, [element[0]]);
            if (this._onsubmit !==  null) Utils.exec(this._onsubmit);
        }

        return result === 0;
    },

    _funcs: {
        required: function(val){
            return val.trim() !== "";
        },
        length: function(val, len){
            if (len === undefined || isNaN(len) || len <= 0) {
                return false;
            }
            return val.trim().length === parseInt(len);
        },
        minlength: function(val, len){
            if (len === undefined || isNaN(len) || len <= 0) {
                return false;
            }
            return val.trim().length >= parseInt(len);
        },
        maxlength: function(val, len){
            if (len === undefined || isNaN(len) || len <= 0) {
                return false;
            }
            return val.trim().length <= parseInt(len);
        },
        min: function(val, min_value){
            if (min_value === undefined || isNaN(min_value)) {
                return false;
            }
            if (!this.number(val)) {
                return false;
            }
            if (isNaN(val)) {
                return false;
            }
            return Number(val) >= Number(min_value);
        },
        max: function(val, max_value){
            if (max_value === undefined || isNaN(max_value)) {
                return false;
            }
            if (!this.number(val)) {
                return false;
            }
            if (isNaN(val)) {
                return false;
            }
            return Number(val) <= Number(max_value);
        },
        email: function(val){
            return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(val);
        },
        url: function(val){
            return /^(?:[a-z]+:)?\/\//i.test(val);
        },
        date: function(val){
            return (new Date(val) !== "Invalid Date" && !isNaN(new Date(val)));
        },
        number: function(val){
            return !isNaN(val);
        },
        digits: function(val){
            return /^\d+$/.test(val);
        },
        hexcolor: function(val){
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(val);
        },
        pattern: function(val, pat){
            if (pat === undefined) {
                return false;
            }
            var reg = new RegExp(pat);
            return reg.test(val);
        },
        compare: function(val, val2){
            return val === val2;
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
        }
    }
};

Metro.plugin('validator', Validator);