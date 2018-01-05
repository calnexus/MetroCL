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
        showAxis: false,
        axisStyle: "arrow", //line
        cellClick: false,

        clsCube: "",
        clsCell: "",
        clsSide: "",
        clsSideLeft: "",
        clsSideRight: "",
        clsSideTop: "",
        clsAxis: "",
        clsAxisX: "",
        clsAxisY: "",
        clsAxisZ: "",

        default: Metro.noop,
        onTick: Metro.noop,
        onCubeCreate: Metro.noop
    },

    _setOptionsFromDOM: function(){
        var that = this, element = this.element, o = this.options;

        $.each(element.data(), function(key, value){
            if (key in o) {
                try {
                    o[key] = JSON.parse(value);
                } catch (e) {
                    o[key] = value;
                }
            }
        });
    },

    _create: function(){
        var that = this, element = this.element, o = this.options;

        this._parseRules(o.rules);

        this._createCube();
        this._createEvents();

        Utils.exec(o.onCubeCreate, [element]);
    },

    _parseRules: function(rules){

        if (rules === undefined || rules === null) {
            return false;
        }

        if (Utils.isObject(rules)) {
            this.rules = Utils.isObject(rules);
            return true;
        } else {
            try {
                this.rules = JSON.parse(rules);
                return true;
            } catch (err) {
                console.log("Unknown rules format for cell flashing!");
                return false;
            }
        }
    },

    _createCube: function(){
        var that = this, element = this.element, o = this.options;
        var sides = ['left', 'right', 'top'];
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

            side = $("<div>").addClass("side " + clsSide+"-side").addClass(o.clsSide).appendTo(element);

            if (clsSide === 'left') {side.addClass(o.clsSideLeft);}
            if (clsSide === 'right') {side.addClass(o.clsSideRight);}
            if (clsSide === 'top') {side.addClass(o.clsSideTop);}

            for(i = 0; i < cells_count; i++) {
                cell = $("<div>").addClass("cube-cell").addClass("cell-id-"+i).addClass(o.clsCell).appendTo(side);
                if (o.numbers === true) {
                    cell.html(i + 1);
                }
            }
        });

        var axis = ['x', 'y', 'z'];
        $.each(axis, function(){
            var axis_name = this;
            var ax = $("<div>").addClass("axis " + o.axisStyle).addClass("axis-"+axis_name).addClass(o.clsAxis);
            if (axis_name === "x") ax.addClass(o.clsAxisX);
            if (axis_name === "y") ax.addClass(o.clsAxisY);
            if (axis_name === "z") ax.addClass(o.clsAxisZ);
            ax.appendTo(element);
        });

        if (o.showAxis === false) {
            element.find(".axis").hide();
        }

        this._run();
    },

    _run: function(){
        var that = this, element = this.element, o = this.options;
        var interval = 0;

        clearInterval(this.interval);
        element.find(".cube-cell").removeClass("light");

        $.each(this.rules, function(){
            interval++;
        });

        if (this.rules !== null) {
            this._start();
        } else {
            if (o.runDefault === true) {
                if (o.default !== Metro.noop) {
                    Utils.exec(o.default, [element]);
                } else {
                    that._startDefault();
                }
            }
        }

        this.interval = setInterval(function(){
            if (that.rules !== null) {
                that._start();
            } else {
                if (o.runDefault === true) {
                    if (o.default !== Metro.noop) {
                        Utils.exec(o.default, [element]);
                    } else {
                        that._startDefault();
                    }
                }
            }
        }, interval * o.flashInterval);
    },

    _createCssForCellSize: function(){
        var that = this, element = this.element, o = this.options;
        var sheet = Metro.sheet;
        var width;
        var cell_size;

        if (o.margin === 8 && o.cells === 4) {
            return ;
        }

        width = parseInt(Utils.getStyleOne(element, 'width'));
        cell_size = Math.ceil((width / 2 - o.margin * o.cells * 2) / o.cells);
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

        element.on(Metro.events.click, ".cube-cell", function(){
            if (o.cellClick === true) {
                var cell = $(this);
                cell.addClass("light");
                that._off(cell, 1);
            }
        });
    },

    _startDefault: function(){
        var that = this, element = this.element, o = this.options;
        var sides = ['left', 'right', 'top'];

        $.each(sides, function(){
            var side_class = "." + this+"-side";
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
        var sides = ['left', 'right', 'top'];

        this.running = true;

        if (o.offBefore === true) element.find(".cube-cell").removeClass("light");

        $.each(this.rules, function(index, rule){

            that._tick(index);

            $.each(sides, function(){
                var side_class = "."+this+"-side";
                var side_name = this;
                var cells_on = rule["on"] !== undefined && rule["on"][side_name] !== undefined ? rule["on"][side_name] : false;
                var cells_off = rule["off"] !== undefined && rule["off"][side_name] !== undefined ? rule["off"][side_name] : false;

                if (cells_on !== false) $.each(cells_on, function(){
                    var cell_index = this - 1;
                    var cell = element.find(side_class + " .cell-id-"+cell_index);

                    that._on(cell, index);
                });

                if (cells_off !== false) $.each(cells_off, function(){
                    var cell_index = this - 1;
                    var cell = element.find(side_class + " .cell-id-"+cell_index);

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

    changeRules: function(){
        var that = this, element = this.element, o = this.options;
        var rules = element.attr("data-rules");
        if (this._parseRules(rules) !== true) {
            return ;
        }
        o.rules = rules;
        this._run();
    },

    changeAxisVisibility: function(){
        var that = this, element = this.element, o = this.options;
        var visibility = JSON.parse(element.attr("data-show-axis")) === true;
        var func = visibility ? "show" : "hide";
        element.find(".axis")[func]();
    },

    changeAxisStyle: function(){
        var that = this, element = this.element, o = this.options;
        var style = element.attr("data-axis-style");

        element.find(".axis").removeClass("arrow line no-style").addClass(style);
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "data-rules": this.changeRules(); break;
            case "data-show-axis": this.changeAxisVisibility(); break;
            case "data-axis-style": this.changeAxisStyle(); break;
        }
    }
};

Metro.plugin('cube', Cube);