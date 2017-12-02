var Popover = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.popover = null;
        this.size = {
            width: 0,
            height: 0
        };

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        popoverText: "",
        popoverHide: 3000,
        popoverOffset: 10,
        popoverTrigger: METRO_POPOVER_MODE.HOVER,
        popoverPosition: METRO_POSITION.TOP,
        hideOnLeave: true,
        clsPopover: "",
        onPopoverShow: Metro.noop,
        onPopoverHide: Metro.noop
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

        this._createEvents();

    },

    _createEvents: function(){
        var that = this, element = this.element, o = this.options;
        var event;

        switch (o.popoverTrigger) {
            case METRO_POPOVER_MODE.CLICK: event = Metro.eventClick; break;
            case METRO_POPOVER_MODE.FOCUS: event = Metro.eventFocus; break;
            default: event = Metro.eventEnter;
        }

        element.on(event, function(){
            if (that.popover !== null) {
                return ;
            }
            that.createPopover();
            if (o.popoverHide > 0) {
                setTimeout(function(){
                    that.removePopover();
                }, o.popoverHide);
            }
        });

        if (o.hideOnLeave === true) {
            element.on(Metro.eventLeave, function(){
                that.removePopover();
            });
        }

        $(window).on("scroll", function(){
            if (that.popover !== null) that.setPosition();
        });

    },

    setPosition: function(){
        var popover = this.popover, size = this.size, o = this.options, element = this.element;

        if (o.popoverPosition === METRO_POSITION.BOTTOM) {
            popover.addClass('bottom');
            popover.css({
                top: element.offset().top - $(window).scrollTop() + element.outerHeight() + o.popoverOffset,
                left: element.offset().left + element.outerWidth()/2 - size.width/2  - $(window).scrollLeft()
            });
        } else if (o.popoverPosition === METRO_POSITION.RIGHT) {
            popover.addClass('right');
            popover.css({
                top: element.offset().top + element.outerHeight()/2 - size.height/2 - $(window).scrollTop(),
                left: element.offset().left + element.outerWidth() - $(window).scrollLeft() + o.popoverOffset
            });
        } else if (o.popoverPosition === METRO_POSITION.LEFT) {
            popover.addClass('left');
            popover.css({
                top: element.offset().top + element.outerHeight()/2 - size.height/2 - $(window).scrollTop(),
                left: element.offset().left - size.width - $(window).scrollLeft() - o.popoverOffset
            });
        } else {
            popover.addClass('top');
            popover.css({
                top: element.offset().top - $(window).scrollTop() - size.height - o.popoverOffset,
                left: element.offset().left + element.outerWidth()/2 - size.width/2  - $(window).scrollLeft()
            });
        }
    },

    createPopover: function(){
        var that = this, elem = this.elem, element = this.element, o = this.options;
        var popover = $("<div>").addClass("popover neb").addClass(o.clsPopover).html(o.popoverText);
        var neb_pos;
        var id = Utils.uniqueId();

        popover.attr("id", id);

        switch (o.popoverPosition) {
            case METRO_POSITION.TOP: neb_pos = "neb-s"; break;
            case METRO_POSITION.BOTTOM: neb_pos = "neb-n"; break;
            case METRO_POSITION.RIGHT: neb_pos = "neb-w"; break;
            case METRO_POSITION.LEFT: neb_pos = "neb-e"; break;
        }

        popover.addClass(neb_pos);
        popover.on("click", function(){
            that.removePopover();
        });

        this.popover = popover;
        this.size = Utils.hiddenElementSize(popover);

        if (elem.tagName === 'TD' || elem.tagName === 'TH') {
            var wrp = $("<div/>").css("display", "inline-block").html(element.html());
            element.html(wrp);
            element = wrp;
        }

        this.setPosition();

        popover.appendTo($('body'));
        Utils.exec(o.onPopoverShow, [popover, element]);
    },

    removePopover: function(){
        var that = this;
        var timeout = this.options.onPopoverHide === Metro.noop ? 0 : 300;
        var popover = this.popover;
        if (popover !== null) {
            Utils.exec(this.options.onPopoverHide, [popover, this.element]);
            setTimeout(function(){
                popover.hide(0, function(){
                    popover.remove();
                    that.popover = null;
                });
            }, timeout);
        }
    },

    show: function(){
        var that = this, o = this.options;
        this.createPopover();
        if (o.popoverHide > 0) {
            setTimeout(function(){
                that.removePopover();
            }, o.popoverHide);
        }
    },

    hide: function(){
        this.removePopover();
    },

    changeText: function(){
        this.options.popoverText = this.element.attr("data-popover-text");
    },

    changePosition: function(){
        this.options.popoverPosition = this.element.attr("data-popover-position");
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "data-popover-text": this.changeText(); break;
        }
    }
};

Metro.plugin('popover', Popover);