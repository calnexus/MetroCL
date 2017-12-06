var Animation = {

    duration: METRO_ANIMATION_DURATION,
    func: "swing",

    slideUp: function(current, next, duration, func){
        var h = current.parent().outerHeight(true);
        if (duration === undefined) {duration = this.duration;}
        if (func === undefined) {func = this.func;}
        current.css("z-index", 1).animate({
            top: -h
        }, duration, func);

        next.css({
            top: h,
            zIndex: 2
        }).animate({
            top: 0
        }, duration, func);
    },

    slideDown: function(current, next, duration, func){
        var h = current.parent().outerHeight(true);
        if (duration === undefined) {duration = this.duration;}
        if (func === undefined) {func = this.func;}
        current.css("z-index", 1).animate({
            top: h
        }, duration, func);

        next.css({
            top: -h,
            zIndex: 2
        }).animate({
            top: 0
        }, duration, func);
    },

    slideLeft: function(current, next, duration, func){
        var w = current.parent().outerWidth(true);
        if (duration === undefined) {duration = this.duration;}
        if (func === undefined) {func = this.func;}
        current.css("z-index", 1).animate({
            left: -w
        }, duration, func);

        next.css({
            left: w,
            zIndex: 2
        }).animate({
            left: 0
        }, duration, func);
    },

    slideRight: function(current, next, duration, func){
        var w = current.parent().outerWidth(true);
        if (duration === undefined) {duration = this.duration;}
        if (func === undefined) {func = this.func;}
        current.css("z-index", 1).animate({
            left: w
        }, duration, func);

        next.css({
            left: -w,
            zIndex: 2
        }).animate({
            left: 0
        }, duration, func);
    },

    fade: function(current, next, duration){
        if (duration === undefined) {duration = this.duration;}
        current.animate({
            opacity: 0
        }, duration);
        next.animate({
            opacity: 1
        }, duration);
    }

};

Metro['animation'] = Animation;