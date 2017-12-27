if (typeof jQuery === 'undefined') {
    throw new Error('Metro\'s JavaScript requires jQuery');
}

window.canObserveMutation = 'MutationObserver' in window;

if (window.canObserveMutation === false) {
    throw new Error('Metro 4 requires MutationObserver. Your browser does not support MutationObserver. Please use polyfill, example: //cdn.jsdelivr.net/g/mutationobserver/ or other.');
}

window.METRO_META_INIT = $("meta[name='metro4:init']").attr("content");
window.METRO_META_LOCALE = $("meta[name='metro4:locale']").attr("content");
window.METRO_META_WEEK_START = $("meta[name='metro4:week_start']").attr("content");
window.METRO_META_ANIMATION_DURATION = $("meta[name='metro4:animation_duration']").attr("content");
window.METRO_META_CALLBACK_TIMEOUT = $("meta[name='metro4:callback_timeout']").attr("content");
window.METRO_META_TIMEOUT = $("meta[name='metro4:timeout']").attr("content");

if (window.METRO_INIT === undefined) {
    window.METRO_INIT = METRO_META_INIT !== undefined ? $.parseJSON(METRO_META_INIT) : true;
}
if (window.METRO_DEBUG === undefined) {window.METRO_DEBUG = true;}
if (window.METRO_CALENDAR_WEEK_START === undefined) {
    window.METRO_CALENDAR_WEEK_START = METRO_META_WEEK_START !== undefined ? parseInt(METRO_META_WEEK_START) : 1;
}
if (window.METRO_LOCALE === undefined) {
    window.METRO_LOCALE = METRO_META_LOCALE !== undefined ? METRO_META_LOCALE : 'en-US';
}
if (window.METRO_ANIMATION_DURATION === undefined) {
    window.METRO_ANIMATION_DURATION = METRO_META_ANIMATION_DURATION !== undefined ? parseInt(METRO_META_ANIMATION_DURATION) : 300;
}
if (window.METRO_CALLBACK_TIMEOUT === undefined) {
    window.METRO_CALLBACK_TIMEOUT = METRO_META_CALLBACK_TIMEOUT !== undefined ? parseInt(METRO_META_CALLBACK_TIMEOUT) : 500;
}
if (window.METRO_TIMEOUT === undefined) {
    window.METRO_TIMEOUT = METRO_META_TIMEOUT !== undefined ? parseInt(METRO_META_TIMEOUT) : 2000;
}
if (window.METRO_HOTKEYS_FILTER_CONTENT_EDITABLE === undefined) {window.METRO_HOTKEYS_FILTER_CONTENT_EDITABLE = true;}
if (window.METRO_HOTKEYS_FILTER_INPUT_ACCEPTING_ELEMENTS === undefined) {window.METRO_HOTKEYS_FILTER_INPUT_ACCEPTING_ELEMENTS = true;}
if (window.METRO_HOTKEYS_FILTER_TEXT_INPUTS === undefined) {window.METRO_HOTKEYS_FILTER_TEXT_INPUTS = true;}
if (window.METRO_HOTKEYS_BUBBLE_UP === undefined) {window.METRO_HOTKEYS_BUBBLE_UP = false;}
if (window.METRO_THROWS === undefined) {window.METRO_THROWS = true;}

if ( typeof Object.create !== 'function' ) {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

window.METRO_POSITION = {
    TOP: "top",
    BOTTOM: "bottom",
    LEFT: "left",
    RIGHT: "right",
    TOP_RIGHT: "top-right",
    TOP_LEFT: "top-left",
    BOTTOM_LEFT: "bottom-left",
    BOTTOM_RIGHT: "bottom-right",
    LEFT_BOTTOM: "left-bottom",
    LEFT_TOP: "left-top",
    RIGHT_TOP: "right-top",
    RIGHT_BOTTOM: "right-bottom"
};

window.METRO_FULLSCREEN_MODE = {
    WINDOW: "window",
    DESKTOP: "desktop"
};

window.METRO_CONTROLS_POSITION = {
    INSIDE: "inside",
    OUTSIDE: "outside"
};

window.METRO_ASPECT_RATIO = {
    HD: "hd",
    SD: "sd",
    CINEMA: "cinema"
};

window.METRO_GROUP_MODE = {
    ONE: "one",
    MULTI: "multi"
};

window.METRO_POPOVER_MODE = {
    CLICK: "click",
    HOVER: "hover",
    FOCUS: "focus"
};

window.METRO_LISTVIEW_MODE = {
    LIST: "list",
    CONTENT: "content",
    ICONS: "icons",
    ICONS_MEDIUM: "icons-medium",
    ICONS_LARGE: "icons-large",
    TILES: "tiles",
    TABLE: "table"
};

window.METRO_STEPPER_VIEW = {
    SQUARE: "square",
    CYCLE: "cycle",
    DIAMOND: "diamond"
};

var isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

var Metro = {

    version: "4.0.0-alpha",
    isTouchable: isTouch,
    isFullscreenEnabled: document.fullscreenEnabled,

    eventClick: isTouch ? 'touchstart.metro' : 'click.metro',
    eventStart: isTouch ? 'touchstart.metro' : 'mousedown.metro',
    eventStop: isTouch ? 'touchend.metro' : 'mouseup.metro',
    eventMove: isTouch ? 'touchmove.metro' : 'mousemove.metro',
    eventEnter: isTouch ? 'touchstart.metro' : 'mouseenter.metro',
    eventLeave: isTouch ? 'touchend.metro' : 'mouseleave.metro',
    eventFocus: 'focus.metro',
    eventBlur: 'blur.metro',

    hotkeys: [],

    about: function(){
        console.log("Metro 4 Components Library - v"+this.version);
    },

    init: function(){
        var widgets = $("[data-role]");
        var hotkeys = $("[data-hotkey]");
        var html = $("html");

        if (isTouch === true) {
            html.addClass("metro-touch-device");
        } else {
            html.addClass("metro-no-touch-device");
        }

        var observer, observerCallback;
        var observerConfig = {
            childList: true,
            attributes: true,
            subtree: true
        };
        observerCallback = function(mutations){
            mutations.map(function(mutation){

                if (mutation.type === 'attributes') {
                    var element = $(mutation.target);
                    if (element.data('metroComponent') !== undefined) {
                        var plug = element.data(element.data('metroComponent'));
                        plug.changeAttribute(mutation.attributeName);
                    }
                } else

                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    var i, obj, widgets = {}, plugins = {};
                    var nodes = mutation.addedNodes;

                    for(i = 0; i < nodes.length; i++) {

                        var node = mutation.addedNodes[i];

                        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
                            return;
                        }
                        obj = $(mutation.addedNodes[i]);

                        plugins = obj.find("[data-role]");
                        if (obj.data('role') !== undefined) {
                            widgets = $.merge(plugins, obj);
                        } else {
                            widgets = plugins;
                        }
                        if (widgets.length) {
                            Metro.initWidgets(widgets);
                        }
                    }

                } else  {
                    //console.log(mutation);
                }
            });
        };
        observer = new MutationObserver(observerCallback);
        observer.observe(html[0], observerConfig);

        setTimeout(function(){
            Metro.initHotkeys(hotkeys);
            Metro.initWidgets(widgets);
        }, 0);

        return this;
    },

    initHotkeys: function(hotkeys){
        $.each(hotkeys, function(){
            var element = $(this);
            var hotkey = element.data('hotkey') ? element.data('hotkey').toLowerCase() : false;

            if (hotkey === false) {
                return;
            }

            if (element.data('hotKeyBonded') === true ) {
                return;
            }

            Metro.hotkeys.push(hotkey);

            $(document).on('keyup', null, hotkey, function(e){
                if (element === undefined) return;

                if (element[0].tagName === 'A' &&
                    element.attr('href') !== undefined &&
                    element.attr('href').trim() !== '' &&
                    element.attr('href').trim() !== '#') {
                    document.location.href = element.attr('href');
                } else {
                    element.click();
                }
                return METRO_HOTKEYS_BUBBLE_UP;
            });

            element.data('hotKeyBonded', true);
        });
    },

    initWidgets: function(widgets) {
        $.each(widgets, function () {
            var $this = $(this), w = this;
            var roles = $this.data('role').split(/\s*,\s*/);
            roles.map(function (func) {
                try {
                    if ($.fn[func] !== undefined && $this.data(func + '-initiated') !== true) {
                        $.fn[func].call($this);
                        $this.data(func + '-initiated', true);
                        $this.data('metroComponent', func);
                    }
                } catch (e) {
                    console.log(e.message, e.stack);
                }
            });
        });
    },

    plugin: function(name, object){
        $.fn[name] = function( options ) {
            return this.each(function() {
                $.data( this, name, Object.create(object).init(options, this ));
            });
        };
    },

    noop: function(){},
    noop_true: function(){return true;},
    noop_false: function(){return false;},

    requestFullScreen: function(element){
        if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else {
            element.requestFullscreen();
        }
    },

    exitFullScreen: function(){
        if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else {
            document.exitFullscreen();
        }
    },

    inFullScreen: function(){
        var fsm = (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        return fsm !== undefined;
    }
};

window['Metro'] = Metro;

