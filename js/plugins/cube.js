var Cube = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.id = null;
        this.rules = null;
        this.interval = false;
        this.running = false;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        rules: null,
        color: null,
        flashColor: null,
        flashInterval: 1000,
        numbers: false,
        offBefore: true,
        attenuation: .3,
        stopOnBlur: false,
        cells: 4,
        margin: 8,
        runDefault: false,

        clsCube: "",
        clsCell: "",
        clsSide: "",
        clsSideLeft: "",
        clsSideRight: "",
        clsSideTop: "",

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
        this._createEvents();

        Utils.exec(o.onCubeCreate, [element]);
    },

    _createCube: function(){
        var that = this, element = this.element, o = this.options;
        var sides = ['left-side', 'right-side', 'top-side'];
        var id = "cube-"+(new Date()).getTime();
        var cells_count = Math.pow(o.cells, 2);

        element.addClass("cube").addClass(o.clsCube);

        if (element.attr('id') === undefined) {
            element.attr('id', id);
        }

        this.id = element.attr('id');

        this._createCssForFlashColor();
        this._createCssForCellSize();

        $.each(sides, function(){
            var side, cell, clsSide = this, i;

            side = $("<div>").addClass("side " + clsSide).addClass(o.clsSide).appendTo(element);

            if (clsSide === 'left-side') {side.addClass(o.clsSideLeft);}
            if (clsSide === 'right-side') {side.addClass(o.clsSideRight);}
            if (clsSide === 'top-side') {side.addClass(o.clsSideTop);}

            for(i = 0; i < cells_count; i++) {
                cell = $("<div>").addClass("cube-cell").addClass("cell-id-"+i).addClass(o.clsCell).appendTo(side);
                if (o.numbers === true) {
                    cell.html(i + 1);
                }
            }
        });

        var interval = 0;

        $.each(this.rules, function(){
            interval++;
        });

        this._start();
        this.interval = setInterval(function(){
            if (that.rules !== null) {
                that._start();
            } else {
                if (o.runDefault === true) that._startDefault();
            }
        }, interval * 1000);
    },

    _createCssForCellSize: function(){
        var that = this, element = this.element, o = this.options;
        var sheet = Metro.sheet;
        var cell_size = Math.ceil((160 - o.margin * o.cells * 2) / o.cells);

        Utils.addCssRule(sheet, "#"+element.attr('id')+" .side .cube-cell", "width: "+cell_size+"px!important; height: "+cell_size+"px!important; margin: " + o.margin + "px!important;");
    },

    _createCssForFlashColor: function(){
        var that = this, element = this.element, o = this.options;
        var sheet = Metro.sheet;
        var rule1;
        var rule2;
        var rules1 = [];
        var rules2 = [];
        var i;

        if (o.flashColor === null) {
            return ;
        }

        rule1 = "0 0 10px " + Utils.hexColorToRgbA(o.flashColor, 1);
        rule2 = "0 0 10px " + Utils.hexColorToRgbA(o.flashColor, o.attenuation);

        for(i = 0; i < 3; i++) {
            rules1.push(rule1);
            rules2.push(rule2);
        }

        Utils.addCssRule(sheet, "@keyframes pulsar-cell-"+element.attr('id'), "0%, 100% { " + "box-shadow: " + rules1.join(",") + "} 50% { " + "box-shadow: " + rules2.join(",") + " }");
        Utils.addCssRule(sheet, "#"+element.attr('id')+" .side .cube-cell.light", "animation: pulsar-cell-" + element.attr('id') + " 2.5s 0s ease-out infinite; " + "background-color: " + o.flashColor + "!important; border-color: " + o.flashColor+"!important;");
    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;

        $(window).on(Metro.events.blur, function(){
            if (o.stopOnBlur === true && that.running === true) {
                that._stop();
            }
        });

        $(window).on(Metro.events.focus, function(){
            if (o.stopOnBlur === true && that.running === false) {
                that._start();
            }
        });
    },

    _startDefault: function(){
        var that = this, element = this.element, o = this.options;
        var sides = ['left-side', 'right-side', 'top-side'];

        $.each(sides, function(){
            var side_class = "." + this;
            var cells_on = [Utils.random(0, Math.pow(o.cells, 2) - 1), Utils.random(0, Math.pow(o.cells, 2) - 1), Utils.random(0, Math.pow(o.cells, 2) - 1)];
            $.each(cells_on, function(index, cell_index){
                var cell = element.find(side_class + " .cell-id-"+cell_index);
                that._on(cell, index);
                that._off(cell, index * 5);
            });
        });
    },

    _start: function(){
        var that = this, element = this.element, o = this.options;
        var sides = ['left-side', 'right-side', 'top-side'];

        this.running = true;

        if (o.offBefore === true) element.find(".cube-cell").removeClass("light");

        $.each(this.rules, function(index, rule){

            that._tick(index);

            $.each(sides, function(){
                var side_class = "."+this;
                var side_name = this;
                var cells_on = rule["on"] !== undefined && rule["on"][side_name] !== undefined ? rule["on"][side_name] : false;
                var cells_off = rule["off"] !== undefined && rule["off"][side_name] !== undefined ? rule["off"][side_name] : false;

                if (cells_on !== false) $.each(cells_on, function(){
                    var cell_index = this - 1;
                    var cell = element.find(side_class + " .cell-id-"+cell_index);
                    // var cell = $(element.find(side_class + " .cube-cell").get(cell_index));

                    that._on(cell, index);
                });

                if (cells_off !== false) $.each(cells_off, function(){
                    var cell_index = this - 1;
                    var cell = element.find(side_class + " .cell-id-"+cell_index);
                    // var cell = $(element.find(side_class + " .cube-cell").get(cell_index));

                    that._off(cell, index);
                });
            });
        });
    },

    _stop: function(){
        this.running = false;
        clearInterval(this.interval);
    },

    _tick: function(index){
        var that = this, element = this.element, o = this.options;

        setTimeout(function(){
            Utils.exec(o.onTick, [index, element]);
        }, o.flashInterval * index);
    },

    _on: function(cell, t){
        var that = this, element = this.element, o = this.options;

        setTimeout(function(){
            cell.addClass("light");
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