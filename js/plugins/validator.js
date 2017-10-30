var ValidatorFuncs = {
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
    },

    is_control: function(el){
        return el.parent().hasClass("input") || el.parent().hasClass("select") || el.parent().hasClass("textarea")
    },

    validate: function(el, result, cb_ok, cb_error){
        var this_result = true;
        var input = $(el);
        var control = ValidatorFuncs.is_control(input);
        var funcs = input.data('validate') !== undefined ? String(input.data('validate')).split(",").map(function(s){return s.trim();}) : [];

        if (funcs.length === 0) {
            return true;
        }

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
                a = input[0].form.elements[a].value;
            }
            this_result = ValidatorFuncs[f](input.val(), a);
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

            if (cb_error !== undefined) Utils.exec(cb_error, [input, input.val()]);

        } else {
            if (control) {
                input.parent().addClass("valid")
            } else {
                input.addClass("valid")
            }

            if (cb_ok !== undefined) Utils.exec(cb_ok, [input, input.val()]);
        }

        return true;
    }
};

Metro['validator'] = ValidatorFuncs;

var Validator = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this._onsubmit = null;
        this._action = null;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        submitTimeout: 200,
        interactiveCheck: false,
        onBeforeSubmit: Metro.noop_true,
        onSubmit: Metro.noop,
        onError: Metro.noop,
        onValid: Metro.noop,
        onValidatorCreate: Metro.noop
    },

    _setOptionsFromDOM: function(){
        var element = this.element, o = this.options;

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
                if (ValidatorFuncs.is_control(input)) {
                    input.parent().addClass("required");
                } else {
                    input.addClass("required");
                }
            }
            if (o.interactiveCheck === true) {
                input.on("propertychange change keyup input paste", function () {
                    //that._check(this);
                    ValidatorFuncs.validate(this);
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

        Utils.exec(this.options.onValidatorCreate, [this.element]);
    },

    _submit: function(){
        var that = this, element = this.element, o = this.options;
        var inputs = element.find("[data-validate]");
        var submit = element.find(":submit").attr('disabled', 'disabled').addClass('disabled');
        var result = {
            val: 0
        };

        $.each(inputs, function(){
            //that._check(this, result, true);
            ValidatorFuncs.validate(this, result, o.onValid, o.onError);
        });

        submit.removeAttr("disabled").removeClass("disabled");

        element[0].action = this._action;

        result.val += Utils.exec(o.onBeforeSubmit, [element]) === false ? 1 : 0;

        if (result.val === 0) {
            setTimeout(function(){
                Utils.exec(o.onSubmit, [element]);
                if (that._onsubmit !==  null) Utils.exec(that._onsubmit);
            }, o.submitTimeout);
        }

        return result.val === 0;
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
        }
    }
};

Metro.plugin('validator', Validator);