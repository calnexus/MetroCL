if (typeof jQuery === 'undefined') {
    throw new Error('Metro\'s JavaScript requires jQuery');
}

window.canObserveMutation = 'MutationObserver' in window;

if (window.canObserveMutation === false) {
    throw new Error('Metro 4 requires MutationObserver. Your browser is not support MutationObserver. Please use polyfill, example: //cdn.jsdelivr.net/g/mutationobserver/ or other.');
}

if (window.METRO_DEBUG === undefined) {window.METRO_DEBUG = true;}
if (window.METRO_CALENDAR_WEEK_START === undefined) {window.METRO_CALENDAR_WEEK_START = 1;}
if (window.METRO_LOCALE === undefined) {window.METRO_LOCALE = 'en-US';}
if (window.METRO_ANIMATION_DURATION === undefined) {window.METRO_ANIMATION_DURATION = 300;}
if (window.METRO_CALLBACK_TIMEOUT === undefined) {window.METRO_CALLBACK_TIMEOUT = 500;}
if (window.METRO_TIMEOUT === undefined) {window.METRO_TIMEOUT = 2000;}
if (window.METRO_HOTKEYS_FILTER_CONTENT_EDITABLE === undefined) {window.METRO_HOTKEYS_FILTER_CONTENT_EDITABLE = true;}
if (window.METRO_HOTKEYS_FILTER_INPUT_ACCEPTING_ELEMENTS === undefined) {window.METRO_HOTKEYS_FILTER_INPUT_ACCEPTING_ELEMENTS = true;}
if (window.METRO_HOTKEYS_FILTER_TEXT_INPUTS === undefined) {window.METRO_HOTKEYS_FILTER_TEXT_INPUTS = true;}
if (window.METRO_HOTKEYS_BUBBLE_UP === undefined) {window.METRO_HOTKEYS_BUBBLE_UP = false;}

if ( typeof Object.create !== 'function' ) {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

var isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

var Metro = {

    eventStart: isTouch ? 'touchstart.metro' : 'mousedown.metro',
    eventStop: isTouch ? 'touchend.metro' : 'mouseup.metro',
    eventMove: isTouch ? 'touchmove.metro' : 'mousemove.metro',
    eventEnter: isTouch ? 'touchstart.metro' : 'mouseenter.metro',
    eventLeave: isTouch ? 'touchend.metro' : 'mouseleave.metro',

    hotkeys: [],

    init: function(){
        var widgets = $("[data-role]");
        var hotkeys = $("[data-hotkey]");
        var body = $("body")[0];
        Metro.initHotkeys(hotkeys);
        Metro.initWidgets(widgets);
        var observer, observerOptions, observerCallback;
        observerOptions = {
            'childList': true,
            'subtree': true,
            'attributes': true
        };
        observerCallback = function(mutations){
            mutations.map(function(mutation){

                if (mutation.type === 'attributes') {
                    var element = $(mutation.target);
                    if (element.data('metroComponent') !== undefined) {
                        var plug = element.data(element.data('metroComponent'));
                        plug.changeAttribute(mutation.attributeName);
                    }
                }

                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    var i, obj, widgets = {}, plugins = {};

                    for(i = 0; i < mutation.addedNodes.length; i++) {

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

                }
            });
        };
        observer = new MutationObserver(observerCallback);
        observer.observe(body, observerOptions);

        return this;
    },

    initHotkeys: function(hotkeys){
        $.each(hotkeys, function(){
            var element = $(this);
            var hotkey = element.data('hotkey') ? element.data('hotkey').toLowerCase() : false;

            if (hotkey === false) {
                return;
            }

            //if ($.Metro.hotkeys.indexOf(hotkey) > -1) {
            //    return;
            //}
            if (element.data('hotKeyBonded') === true ) {
                return;
            }

            $.Metro.hotkeys.push(hotkey);

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

    // Пример использования:
    // превращаем myObject в плагин
    // $.plugin('myobj', myObject);

    // и используем, как обычно
    // $('#elem').myobj({name: "John"});
    // var inst = $('#elem').data('myobj');
    // inst.myMethod('I am a method');

    plugin: function(name, object){
        $.fn[name] = function( options ) {
            return this.each(function() {
                if ( ! $.data( this, name ) ) {
                    $.data( this, name, Object.create(object).init(
                        options, this )
                    );
                }
            });
        };
    },

    noop: function(){},
    noop_true: function(){return true;},
    noop_false: function(){return false;}
};

$.Metro = window['Metro'] = Metro;
