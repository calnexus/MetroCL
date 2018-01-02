var Cube = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.id = null;
        this.rules = null;
        this.interval = false;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        rules: null,
        color: null,
        flashColor: null,
        flashInterval: 1000,
        cells: 4,
        numbers: false,
        offBefore: true,
        onTick: Metro.noop,
        onCubeCreate: Metro.noop
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

        if (Utils.isObject(o.rules)) {
            this.rules = Utils.isObject(o.rules);
        } else {
            try {
                this.rules = $.parseJSON(o.rules);
            } catch (err) {
                console.log("Unknown rules format for cell flashing!");
            }
        }

        this._createCube();

        Utils.exec(o.onCubeCreate, [element]);
    },

    _createCube: function(){
        var that = this, element = this.element, o = this.options;
        var sides = ['left-side', 'right-side', 'top-side'];
        var id = "cube-"+(new Date()).getTime();

        element.addClass("cube");
        if (element.attr('id') === undefined) {
            element.attr('id', id);
        }

        this.id = element.attr('id');

        $.each(sides, function(){
            var side, cell, clsSide = this, i;
            side = $("<div>").addClass("side " + clsSide).appendTo(element);
            for(i = 0; i < Math.pow(o.cells, 2); i++) {
                cell = $("<div>").addClass("cube-cell").appendTo(side);
                if (o.numbers === true) {
                    cell.html(i + 1);
                }
            }
        });

        if (o.flashColor !== null) {
            var sheet = Metro.sheet;
            var rule1 = "0 0 10px " + Utils.hexColorToRgbA(o.flashColor, 1);
            var rule2 = "0 0 10px " + Utils.hexColorToRgbA(o.flashColor, .5);
            var rules1 = [];
            var rules2 = [];
            var i;
            for(i = 0; i < 3; i++) {
                rules1.push(rule1);
                rules2.push(rule2);
            }

            Utils.addCssRule(sheet, "@keyframes pulsar-cell-"+element.attr('id'), "0%, 100% { " + "box-shadow: " + rules1.join(",") + "} 50% { " + "box-shadow: " + rules2.join(",") + " }");
            Utils.addCssRule(sheet, "#"+element.attr('id')+" .side .cube-cell.light", "animation: pulsar-cell-" + element.attr('id') + " 2.5s 0s ease-out infinite; " + "background-color: " + o.flashColor + "; border-color: " + o.flashColor+";");
        }

        var interval = 0;

        $.each(this.rules, function(){
            interval++;
        });

        this._start();
        this.interval = setInterval(function(){
            that._start();
        }, interval * 1000);
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        $(window).on(Metro.events.blur, function(){

        });

        $(window).on(Metro.events.focus, function(){

        });
    },

    _start: function(){
        var that = this, element = this.element, o = this.options;
        var sides = ['left-side', 'right-side', 'top-side'];
        var i = 0;

        if (o.offBefore === true) element.find(".cube-cell").removeClass("light");

        $.each(this.rules, function(index, rule){
            $.each(sides, function(){
                var side_class = "."+this;
                var side_name = this;
                var cells_on = rule["on"] !== undefined && rule["on"][side_name] !== undefined ? rule["on"][side_name] : false;
                var cells_off = rule["off"] !== undefined && rule["off"][side_name] !== undefined ? rule["off"][side_name] : false;

                if (cells_on !== false) $.each(cells_on, function(){
                    var cell_index = this - 1;
                    var cell = $(element.find(side_class + " .cube-cell").get(cell_index));

                    that._on(cell, i);
                });

                if (cells_off !== false) $.each(cells_off, function(){
                    var cell_index = this - 1;
                    var cell = $(element.find(side_class + " .cube-cell").get(cell_index));

                    that._off(cell, i);
                });
            });
            i++;
        });
    },

    _on: function(cell, t){
        var that = this, element = this.element, o = this.options;

        setTimeout(function(){
            cell.addClass("light");
            Utils.exec(o.onTick, [cell, element]);
        }, o.flashInterval * t);
    },

    _off: function(cell, t){
        var that = this, element = this.element, o = this.options;

        setTimeout(function(){
            cell.removeClass("light");
        }, o.flashInterval * t);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('cube', Cube);