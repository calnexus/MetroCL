var Validator = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this._onsubmit = null;
        this._action = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCreate, this.element[0]);

        return this;
    },
    options: {
        submitTimeout: 200,
        interactiveCheck: false,
        onBeforeSubmit: function(){},
        onSubmit: function(){},
        onError: function(){},
        onValid: function(){},
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
            if (o.interactiveCheck === true) {
                input.on("propertychange change keyup input paste", function () {
                    that._check(this);
                });
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

    _check: function(el, result, events){
        var that = this, o = this.options;
        var this_result = true;
        var input = $(el);
        var control = this.is_control(input);
        var funcs = input.data('validate') !== undefined ? String(input.data('validate')).split(",").map(function(s){return s.trim();}) : [];

        if (input.is(":disabled")) return;

        if (control) {
            input.parent().removeClass("invalid valid");
        } else {
            input.removeClass("invalid valid");
        }

        $.each(funcs, function(){
            if (this_result === false) return;
            var rule = this.split("=");
            var f, a;

            f = rule[0]; rule.shift();
            a = rule.join("=");

            if (f === 'compare') {
                a = that.element[0].elements[a].value;
            }
            this_result = that._funcs[f](input.val(), a);
            if (result !== undefined) {
                result.val += this_result ? 0 : 1;
            }
        });

        if (this_result === false) {
            if (control) {
                input.parent().addClass("invalid")
            } else {
                input.addClass("invalid")
            }

            if (events === true) {
                Utils.exec(o.onError, [input, input.val()]);
            }

        } else {
            if (control) {
                input.parent().addClass("valid")
            } else {
                input.addClass("valid")
            }

            if (events === true) {
                Utils.exec(o.onValid, [input, input.val()]);
            }
        }
    },

    _submit: function(){
        var that = this, element = this.element, o = this.options;
        var inputs = element.find("[data-validate]");
        var submit = element.find(":submit").attr('disabled', 'disabled').addClass('disabled');
        var result = {
            val: 0
        };

        $.each(inputs, function(){
            that._check(this, result, true);
        });

        submit.removeAttr("disabled").removeClass("disabled");

        element[0].action = this._action;

        result.val += Utils.exec(o.onBeforeSubmit, [element[0]]) === false ? 1 : 0;

        if (result.val === 0) {
            setTimeout(function(){
                Utils.exec(o.onSubmit, [element[0]]);
                if (that._onsubmit !==  null) Utils.exec(that._onsubmit);
            }, o.submitTimeout);
        }

        return result.val === 0;
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
            return /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(val);
        },
        url: function(val){
            return /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(val);
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