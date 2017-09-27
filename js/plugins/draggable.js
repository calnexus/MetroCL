var Draggable = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.drag = false;
        this.move = false;
        this.backup = {
            cursor: 'default',
            zIndex: '0'
        };

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCreate);

        return this;
    },

    eventStart: isTouch ? 'touchstart.metro' : 'mousedown.metro',
    eventStop: isTouch ? 'touchend.metro' : 'mouseup.metro',
    eventMove: isTouch ? 'touchmove.metro' : 'mousemove.metro',

    options: {
        dragElement: 'self',
        dragArea: "parent",
        onDragStart: function(){},
        onDragStop: function(){},
        onDragMove: function(){},
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

    _create: function(){
        var that = this, element = this.element, o = this.options;
        var dragArea;
        var offset, position, shift, coords;
        var dragElement  = o.dragElement !== 'self' ? element.find(o.dragElement) : element;

        dragElement[0].ondragstart = function(){return false;};

        dragElement.on(Draggable.eventStart, function(e){

            if (isTouch === false && e.which !== 1) {
                return ;
            }

            that.drag = true;

            that.backup.cursor = element.css("cursor");
            that.backup.zIndex = element.css("z-index");

            element.addClass("draggable");

            if (o.dragArea === 'document' || o.dragArea === 'window') {
                o.dragArea = "body";
            }

            if (o.dragArea === 'parent') {
                dragArea = element.parent();
            } else {
                dragArea = $(o.dragArea);
            }

            offset = {
                left: dragArea.offset().left,
                top:  dragArea.offset().top
            };

            position = {
                x: Utils.pageXY(e).left,
                y: Utils.pageXY(e).top
            };

            var drg_h = element.outerHeight(),
                drg_w = element.outerWidth(),
                pos_y = element.offset().top + drg_h - Utils.pageXY(e).top,
                pos_x = element.offset().left + drg_w - Utils.pageXY(e).left;

            Utils.exec(o.onDragStart, [this, position]);

            $(document).on(Draggable.eventMove, function(e){
                var pageX, pageY;

                if (that.drag === false) {
                    return ;
                }
                that.move = true;

                pageX = Utils.pageXY(e).left - offset.left;
                pageY = Utils.pageXY(e).top - offset.top;

                var t = (pageY > 0) ? (pageY + pos_y - drg_h) : (0);
                var l = (pageX > 0) ? (pageX + pos_x - drg_w) : (0);
                var t_delta = dragArea.innerHeight() + dragArea.scrollTop() - element.outerHeight();
                var l_delta = dragArea.innerWidth() + dragArea.scrollLeft() - element.outerWidth();

                if(t >= 0 && t <= t_delta) {
                    element.offset({top: t + offset.top});
                }
                if(l >= 0 && l <= l_delta) {
                    element.offset({left: l + offset.left});
                }

                position = {
                    x: l,
                    y: t
                };

                Utils.exec(o.onDragMove, [this, position]);

                return false;
            });
        });

        dragElement.on(Draggable.eventStop, function(e){
            element.css({
                cursor: that.backup.cursor,
                zIndex: that.backup.zIndex
            }).removeClass("draggable");
            that.drag = false;
            that.move = false;
            position = {
                x: Utils.pageXY(e).left,
                y: Utils.pageXY(e).top
            };
            $(document).off(Draggable.eventMove);
            Utils.exec(o.onDragStop, [this, position]);
        });
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('draggable', Draggable);