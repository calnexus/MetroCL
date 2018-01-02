var Cube = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        cells: 4,
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

        this._createCube();

        Utils.exec(o.onCubeCreate, [element]);
    },

    _createCube: function(){
        var that = this, element = this.element, o = this.options;
        var sides = ['left-side', 'right-side', 'top-side'];

        element.addClass("cube");

        $.each(sides, function(){
            var side, cell, clsSide = this, i;
            side = $("<div>").addClass("side " + clsSide).appendTo(element);
            for(i = 0; i < Math.pow(o.cells, 2); i++) {
                cell = $("<div>").addClass("cube-cell").appendTo(side);
            }
        });

        setInterval(function(){
            var cells = element.find(".cube-cell");
            var cell_index = Utils.random(0, cells.length-1);
            var cell = $(cells.get(cell_index)).addClass("light");
            console.log(cell_index);
            setTimeout(function(){
                that._offCell(cell);
            }, 10000)
        }, 1000);
    },

    _offCell: function(cell){
        cell.removeClass("light");
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('cube', Cube);