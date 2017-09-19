var Notify = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._create();

        return this;
    },
    options: {
    },

    _create: function(){
    }
};

$.Metro['notify'] = Notify;