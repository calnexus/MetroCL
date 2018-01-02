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
        var id = Utils.uniqueId();

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

        var interval = 0;

        $.each(this.rules, function(){
            interval++;
        });

        this._start();
        setInterval(function(){
            that._start();
        }, interval * 1000);
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
                var cells_on = rule["on"][side_name];
                var cells_off = rule["on"][side_name];

                $.each(cells_on, function(){
                    var cell_index = this - 1;
                    var cell = $(element.find(side_class + " .cube-cell").get(cell_index));

                    that._on(cell, i);
                });

                $.each(cells_off, function(){
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
        }, o.flashInterval * t);
    },

    _off: function(cell, t){
        var that = this, element = this.element, o = this.options;

        setTimeout(function(){
            cell.addClass("light");
        }, o.flashInterval * t);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('cube', Cube);