var Slider = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.slider = null;
        this.value = 0;
        this.percent = 0;
        this.pixel = 0;
        this.buffer = 0;
        this.keyInterval = false;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        min: 0,
        max: 100,
        value: 0,
        buffer: 0,
        hint: false,
        hintAlways: false,
        hintPosition: METRO_POSITION.TOP,
        hintMask: "$1",
        vertical: false,
        target: null,
        returnType: "value", // value or percent
        size: 0,

        clsSlider: "",
        clsBackside: "",
        clsComplete: "",
        clsBuffer: "",
        clsMarker: "",
        clsHint: "",

        onStart: Metro.noop,
        onStop: Metro.noop,
        onMove: Metro.noop,
        onClick: Metro.noop,
        onChangeValue: Metro.noop,
        onChangeBuffer: Metro.noop,
        onFocus: Metro.noop,
        onBlur: Metro.noop,
        onSliderCreate: Metro.noop
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

        this._createSlider();
        this._createEvents();

        setTimeout(function(){
            that.buff(o.buffer);
            that.val(o.value);
            that._hint();
        }, 100);

        Utils.exec(o.onSliderCreate, [element]);
    },

    _createSlider: function(){
        var element = this.element, o = this.options;

        var prev = element.prev();
        var parent = element.parent();
        var slider = $("<div>").addClass("slider " + element[0].className).addClass(o.clsSlider);
        var backside = $("<div>").addClass("backside").addClass(o.clsBackside);
        var complete = $("<div>").addClass("complete").addClass(o.clsComplete);
        var buffer = $("<div>").addClass("buffer").addClass(o.clsBuffer);
        var marker = $("<button>").attr("type", "button").addClass("marker").addClass(o.clsMarker);
        var hint = $("<div>").addClass("hint").addClass(o.hintPosition + "-side").addClass(o.clsHint);
        var id = Utils.uniqueId();

        slider.attr("id", id);

        if (o.size > 0) {
            if (o.vertical === true) {
                slider.outerHeight(o.size);
            } else {
                slider.outerWidth(o.size);
            }
        }

        if (o.vertical === true) {
            slider.addClass("vertical-slider");
        }

        if (prev.length === 0) {
            parent.prepend(slider);
        } else {
            slider.insertAfter(prev);
        }

        if (o.hintAlways === true) {
            hint.css({
                display: "block"
            });
        }

        element.appendTo(slider);
        backside.appendTo(slider);
        complete.appendTo(slider);
        buffer.appendTo(slider);
        marker.appendTo(slider);
        hint.appendTo(marker);

        this.slider = slider;
    },

    _createEvents: function(){
        var that = this, slider = this.slider, o = this.options;
        var marker = slider.find(".marker");
        var hint = slider.find(".hint");

        marker.on(Metro.eventStart, function(){
            $(document).on(Metro.eventMove, function(e){
                if (o.hint === true && o.hintAlways !== true) {
                    hint.fadeIn();
                }
                that._move(e);
                Utils.exec(o.onMove, [that.value, slider]);
            });

            $(document).on(Metro.eventStop, function(){
                $(document).off(Metro.eventMove);
                $(document).off(Metro.eventStop);

                if (o.hintAlways !== true) {
                    hint.fadeOut();
                }

                Utils.exec(o.onStop, [that.value, slider]);
            });

            Utils.exec(o.onStart, [that.value, slider]);
        });

        marker.on("focus", function(){
            Utils.exec(o.onFocus, [that.value, slider]);
        });

        marker.on("blur", function(){
            Utils.exec(o.onBlur, [that.value, slider]);
        });

        marker.on("keydown", function(e){

            var key = e.keyCode ? e.keyCode : e.which;

            if ([37,38,39,40].indexOf(key) === -1) {
                return;
            }

            var marker = $(this);
            var length = ( o.vertical === true ? slider.outerHeight() : slider.outerWidth() ) - marker.outerWidth();
            var step = 1;

            if (that.keyInterval) {
                return ;
            }
            that.keyInterval = setInterval(function(){

                var pos = parseInt(o.vertical === true ? marker.css('top') : marker.css('left'));

                if (e.keyCode === 37 || e.keyCode === 40) { // left, down
                    if (pos - step <= 0) {
                        that.pixel = 0;
                    } else {
                        that.pixel -= step;
                    }
                }

                if (e.keyCode === 38 || e.keyCode === 39) { // right, up
                    if (pos + step >= length) {
                        that.pixel = length;
                    } else {
                        that.pixel += step;
                    }
                }

                that.value = that._convert(that.pixel, 'pix2val');
                that.percent = that._convert(that.pixel, 'pix2prc');

                that._marker();
                that._value();
            }, 100);

            e.preventDefault();
        });

        marker.on("keyup", function(){
            clearInterval(that.keyInterval);
            that.keyInterval = false;
        });

        slider.on(Metro.eventClick, function(e){
            that._move(e);
            Utils.exec(o.onClick, [that.value, slider]);
        });

        $(window).resize(function(e){
            that.val(that.value);
        });
    },

    _convert: function(v, how){
        var slider = this.slider, o = this.options;
        var length = (o.vertical === true ? slider.outerHeight() : slider.outerWidth()) - slider.find(".marker").outerWidth();
        switch (how) {
            case "pix2prc": return Math.round( v * 100 / length );
            case "pix2val": return Math.round( this._convert(v, 'pix2prc') * ((o.max - o.min) / 100) + o.min );
            case "val2prc": return Math.round( (v - o.min)/( (o.max - o.min) / 100 )  );
            case "prc2pix": return Math.round( v / ( 100 / length ));
        }
    },

    _move: function(e){
        var slider = this.slider, o = this.options;
        var offset = slider.offset(),
            marker_size = slider.find(".marker").outerWidth(),
            length = o.vertical === true ? slider.outerHeight() : slider.outerWidth(),
            cPos, cPix, cStart = 0, cStop = length - marker_size;

        cPos = o.vertical === true ? Utils.pageXY(e).y - offset.top : Utils.pageXY(e).x - offset.left;
        cPix = o.vertical === true ? length - cPos - marker_size / 2 : cPos - marker_size / 2;

        if (cPix < cStart || cPix > cStop) {
            return ;
        }

        this.pixel = cPix;
        this.value = this._convert(cPix, 'pix2val');
        this.percent = this._convert(cPix, 'pix2prc');

        this._marker();
        this._value();
        this._hint();
    },

    _hint: function(){
        var o = this.options, slider = this.slider, marker = slider.find(".marker"), hint = slider.find(".hint");
        var value;

        value = o.hintMask.replace("$1", this.value).replace("$1", this.percent);

        hint.text(value);
    },

    _value: function(){
        var element = this.element, o = this.options, slider = this.slider;
        var value = o.returnType === 'value' ? this.value : this.percent;

        if (element[0].tagName === "INPUT") {
            element.val(value);
        } else {
            element.text(value);
        }

        element.trigger("change");

        if (o.target !== null) {
            var target = $(o.target);
            if (target.length !== 0) {
                if (target[0].tagName === "INPUT") {
                    target.val(value);
                } else {
                    target.text(value);
                }
            }
        }

        Utils.exec(o.onChangeValue, [value, slider]);
    },

    _marker: function(){
        var slider = this.slider, o = this.options;
        var marker = slider.find(".marker"), complete = slider.find(".complete");
        var length = o.vertical === true ? slider.outerHeight() : slider.outerWidth();

        if (o.vertical === true) {
            marker.css('top', length - this.pixel);
            complete.css('height', this.percent+"%");
        } else {
            marker.css('left', this.pixel);
            complete.css('width', this.percent+"%");
        }
    },

    val: function(v){
        var o = this.options;

        if (v === undefined || isNaN(v)) {
            return this.value;
        }

        if (v < o.min) {
            v = o.min;
        }

        if (v > o.max) {
            v = o.max;
        }

        this.value = v;
        this.percent = this._convert(v, 'val2prc');
        this.pixel = this._convert(this.percent, 'prc2pix');

        this._marker();
        this._value();
    },

    buff: function(v){
        var slider = this.slider, o = this.options;
        var buffer = slider.find(".buffer");

        if (v === undefined || isNaN(v)) {
            return this.buffer;
        }

        if (buffer.length === 0) {
            return false;
        }

        v = parseInt(v);

        if (v > 100) {
            v = 100;
        }

        if (v < 0) {
            v = 0;
        }

        if (o.vertical === true) {
            buffer.css("height", v + "%");
        } else {
            buffer.css("width", v + "%");
        }

        Utils.exec(o.onChangeBuffer, [v, slider]);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('slider', Slider);