/*!
 * Metro UI CSS v4.0.0 (https://metroui.org.ua)
 * Copyright 2017 Sergey Pimenov
 * Licensed under MIT
 */

(function( factory ) {
    if ( typeof define === 'function' && define.amd ) {
        define([ 'jquery' ], factory );
    } else {
        factory( jQuery );
    }
}(function( jQuery ) { 
'use strict';

var $ = jQuery;

// Source: js/metro.js
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

// Source: js/utils/easing.js
$.easing['jswing'] = $.easing['swing'];

$.extend($.easing, {
    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
        //alert($.easing.default);
        return $.easing[$.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
        return c - $.easing.easeOutBounce(x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function (x, t, b, c, d) {
        if (t < d / 2) return $.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return $.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});

// Source: js/utils/extensions.js
Array.prototype.shuffle = function () {
    var currentIndex = this.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }

    return this;
};

Array.prototype.clone = function () {
    return this.slice(0);
};

Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

Number.prototype.format = function(n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */
// this is a temporary solution

var dateFormat = function () {

var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) {
                val = "0" + val;
            }
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length === 1 && Object.prototype.toString.call(date) === "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        //console.log(arguments);

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date();
        //if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) === "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        //console.log(locale);

        var locale = CORE_LOCALE || 'en-US';

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: coreLocales[locale].calendar.days[D],
                dddd: coreLocales[locale].calendar.days[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: coreLocales[locale].calendar.months[m],
                mmmm: coreLocales[locale].calendar.months[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    default: "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// For convenience...
Date.prototype.format = function (mask, utc) {
return dateFormat(this, mask, utc);
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
// Source: js/utils/hotkeys.js
var hotkeys = {

    specialKeys: {
        8: "backspace",
        9: "tab",
        10: "return",
        13: "return",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause",
        20: "capslock",
        27: "esc",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "insert",
        46: "del",
        59: ";",
        61: "=",
        96: "0",
        97: "1",
        98: "2",
        99: "3",
        100: "4",
        101: "5",
        102: "6",
        103: "7",
        104: "8",
        105: "9",
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scroll",
        173: "-",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
    },

    shiftNums: {
        "`": "~",
        "1": "!",
        "2": "@",
        "3": "#",
        "4": "$",
        "5": "%",
        "6": "^",
        "7": "&",
        "8": "*",
        "9": "(",
        "0": ")",
        "-": "_",
        "=": "+",
        ";": ": ",
        "'": "\"",
        ",": "<",
        ".": ">",
        "/": "?",
        "\\": "|"
    },

    // excludes: button, checkbox, file, hidden, image, password, radio, reset, search, submit, url
    textAcceptingInputTypes: [
        "text", "password", "number", "email", "url", "range", "date", "month", "week", "time", "datetime",
        "datetime-local", "search", "color", "tel"],

    // default input types not to bind to unless bound directly
    textInputTypes: /textarea|input|select/i,

    options: {
        filterInputAcceptingElements: METRO_HOTKEYS_FILTER_INPUT_ACCEPTING_ELEMENTS,
        filterTextInputs: METRO_HOTKEYS_FILTER_TEXT_INPUTS,
        filterContentEditable: METRO_HOTKEYS_FILTER_CONTENT_EDITABLE
    },

    keyHandler: function(handleObj){
        if (typeof handleObj.data === "string") {
            handleObj.data = {
                keys: handleObj.data
            };
        }

        // Only care when a possible input has been specified
        if (!handleObj.data || !handleObj.data.keys || typeof handleObj.data.keys !== "string") {
            return;
        }

        var origHandler = handleObj.handler,
            keys = handleObj.data.keys.toLowerCase().split(" ");

        handleObj.handler = function(event) {
            //      Don't fire in text-accepting inputs that we didn't directly bind to
            if (this !== event.target &&
                (hotkeys.options.filterInputAcceptingElements && hotkeys.textInputTypes.test(event.target.nodeName) ||
                    (hotkeys.options.filterContentEditable && $(event.target).attr('contenteditable')) ||
                    (hotkeys.options.filterTextInputs && $.inArray(event.target.type, hotkeys.textAcceptingInputTypes) > -1))
            )
            {
                return;
            }

            var special = event.type !== "keypress" && hotkeys.specialKeys[event.which],
                character = String.fromCharCode(event.which).toLowerCase(),
                modif = "",
                possible = {};

            $.each(["alt", "ctrl", "shift"], function(index, specialKey) {

                if (event[specialKey + 'Key'] && special !== specialKey) {
                    modif += specialKey + '+';
                }
            });

            // metaKey is triggered off ctrlKey erronously
            if (event.metaKey && !event.ctrlKey && special !== "meta") {
                modif += "meta+";
            }

            if (event.metaKey && special !== "meta" && modif.indexOf("alt+ctrl+shift+") > -1) {
                modif = modif.replace("alt+ctrl+shift+", "hyper+");
            }

            if (special) {
                possible[modif + special] = true;
            }
            else {
                possible[modif + character] = true;
                possible[modif + hotkeys.shiftNums[character]] = true;

                // "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
                if (modif === "shift+") {
                    possible[hotkeys.shiftNums[character]] = true;
                }
            }

            for (var i = 0, l = keys.length; i < l; i++) {
                if (possible[keys[i]]) {
                    return origHandler.apply(this, arguments);
                }
            }
        };
    }
};

$.each(["keydown", "keyup", "keypress"], function() {
    $.event.special[this] = {
        add: hotkeys.keyHandler
    };
});

// Source: js/utils/locales.js
var Locales = {

    'en-US': {
        calendar: {
            months: [
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ],
            days: [
                "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
                "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa",
                "Sun", "Mon", "Tus", "Wen", "Thu", "Fri", "Sat"
            ],
            time: ["HOUR", "MIN", "SEC"]
        },
        buttons: {
            ok: "OK",
            cancel: "Cancel",
            done: "Done",
            today: "Today",
            now: "Now",
            clear: "Clear",
            help: "Help",
            yes: "Yes",
            no: "No",
            random: "Random"
        }
    },

    'uk-UA': {
        calendar: {
            months: [
                "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
                "Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"
            ],
            days: [
                "Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П’ятниця", "Субота",
                "Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб",
                "Нед", "Пон", "Вiв", "Сер", "Чет", "Пят", "Суб"
            ],
            time: ["ГОД", "ХВЛ", "СЕК"]
        },
        buttons: {
            ok: "ОК",
            cancel: "Відміна",
            done: "Готово",
            today: "Сьогодні",
            now: "Зараз",
            clear: "Очистити",
            help: "Допомога",
            yes: "Так",
            no: "Ні",
            random: "Випадково"
        }
    },

    'ru-RU': {
        calendar: {
            months: [
                "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
                "Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
            ],
            days: [
                "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота",
                "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб",
                "Вос", "Пон", "Вто", "Сре", "Чет", "Пят", "Суб"
            ],
            time: ["ЧАС", "МИН", "СЕК"]
        },
        buttons: {
            ok: "ОК",
            cancel: "Отмена",
            done: "Готово",
            today: "Сегодня",
            now: "Сейчас",
            clear: "Очистить",
            help: "Помощь",
            yes: "Да",
            no: "Нет",
            random: "Случайно"
        }
    },

    'de-DE': {
        calendar: {
            months: [
                "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember",
                "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
            ],
            days: [
                "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag",
                "Sn", "Mn", "Di", "Mi", "Do", "Fr", "Sa",
                "Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"
            ],
            time: ["UHR", "MIN", "SEK"]
        },
        buttons: {
            ok: "OK",
            cancel: "Abbrechen",
            done: "Fertig",
            today: "Heute",
            now: "Jetzt",
            clear: "Reinigen",
            help: "Hilfe",
            yes: "Ja",
            no: "Nein",
            random: "Zufällig"
        }
    }

};

$.Metro['locales'] = window.metroLocales = Locales;

// Source: js/utils/md5.js
var hexcase = 0;
/* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad = "";
/* base-64 pad character. "=" for strict RFC compliance   */

function hex_md5(s) {
    return rstr2hex(rstr_md5(str2rstr_utf8(s)));
}
function b64_md5(s) {
    return rstr2b64(rstr_md5(str2rstr_utf8(s)));
}
function any_md5(s, e) {
    return rstr2any(rstr_md5(str2rstr_utf8(s)), e);
}
function hex_hmac_md5(k, d) {
    return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
}
function b64_hmac_md5(k, d) {
    return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
}
function any_hmac_md5(k, d, e) {
    return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e);
}


/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s) {
    return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
 * Calculate the HMAC-MD5, of a key and some data (raw strings)
 */
function rstr_hmac_md5(key, data) {
    var bkey = rstr2binl(key);
    if (bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

    var ipad = new Array(16), opad = new Array(16);
    for (var i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
    return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input) {
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var output = "";
    var x;
    for (var i = 0; i < input.length; i++) {
        x = input.charCodeAt(i);
        output += hex_tab.charAt((x >>> 4) & 0x0F)
            + hex_tab.charAt(x & 0x0F);
    }
    return output;
}

/*
 * Convert a raw string to a base-64 string
 */
function rstr2b64(input) {
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var output = "";
    var len = input.length;
    for (var i = 0; i < len; i += 3) {
        var triplet = (input.charCodeAt(i) << 16)
            | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0)
            | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > input.length * 8) output += b64pad;
            else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
        }
    }
    return output;
}

/*
 * Convert a raw string to an arbitrary string encoding
 */
function rstr2any(input, encoding) {
    var divisor = encoding.length;
    var i, j, q, x, quotient;

    /* Convert to an array of 16-bit big-endian values, forming the dividend */
    var dividend = new Array(Math.ceil(input.length / 2));
    for (i = 0; i < dividend.length; i++) {
        dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
    }

    /*
     * Repeatedly perform a long division. The binary array forms the dividend,
     * the length of the encoding is the divisor. Once computed, the quotient
     * forms the dividend for the next step. All remainders are stored for later
     * use.
     */
    var full_length = Math.ceil(input.length * 8 /
        (Math.log(encoding.length) / Math.log(2)));
    var remainders = new Array(full_length);
    for (j = 0; j < full_length; j++) {
        quotient = [];
        x = 0;
        for (i = 0; i < dividend.length; i++) {
            x = (x << 16) + dividend[i];
            q = Math.floor(x / divisor);
            x -= q * divisor;
            if (quotient.length > 0 || q > 0)
                quotient[quotient.length] = q;
        }
        remainders[j] = x;
        dividend = quotient;
    }

    /* Convert the remainders to the output string */
    var output = "";
    for (i = remainders.length - 1; i >= 0; i--)
        output += encoding.charAt(remainders[i]);

    return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input) {
    var output = "";
    var i = -1;
    var x, y;

    while (++i < input.length) {
        /* Decode utf-16 surrogate pairs */
        x = input.charCodeAt(i);
        y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
            x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
            i++;
        }

        /* Encode output as utf-8 */
        if (x <= 0x7F)
            output += String.fromCharCode(x);
        else if (x <= 0x7FF)
            output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                0x80 | ( x & 0x3F));
        else if (x <= 0xFFFF)
            output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                0x80 | ((x >>> 6 ) & 0x3F),
                0x80 | ( x & 0x3F));
        else if (x <= 0x1FFFFF)
            output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                0x80 | ((x >>> 12) & 0x3F),
                0x80 | ((x >>> 6 ) & 0x3F),
                0x80 | ( x & 0x3F));
    }
    return output;
}

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input) {
    var i;
    var output = new Array(input.length >> 2);
    for (i = 0; i < output.length; i++)
        output[i] = 0;
    for (i = 0; i < input.length * 8; i += 8)
        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
    return output;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input) {
    var output = "";
    for (var i = 0; i < input.length * 32; i += 8)
        output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
    return output;
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;

    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;

    for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;

        a = md5_ff(a, b, c, d, x[i], 7, -680876936);
        d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
        b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

        a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = md5_gg(b, c, d, a, x[i], 20, -373897302);
        a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

        a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
        d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = md5_hh(d, a, b, c, x[i], 11, -358537222);
        c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

        a = md5_ii(a, b, c, d, x[i], 6, -198630844);
        d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
    }
    return [a, b, c, d];
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t) {
    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
}
function md5_ff(a, b, c, d, x, s, t) {
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t) {
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t) {
    return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t) {
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
}


// window.md5 = {
//     hex: function(val){
//         return hex_md5(val);
//     },
//
//     b64: function(val){
//         return b64_md5(val);
//     },
//
//     any: function(s, e){
//         return any_md5(s, e);
//     },
//
//     hex_hmac: function(k, d){
//         return hex_hmac_md5(k, d);
//     },
//
//     b64_hmac: function(k, d){
//         return b64_hmac_md5(k, d);
//     },
//
//     any_hmac: function(k, d, e){
//         return any_hmac_md5(k, d, e);
//     }
// };

//$.Metro['md5'] = hex_md5;
// Source: js/utils/mousewheel.js
var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
    toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
        ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
    slice  = Array.prototype.slice,
    nullLowestDeltaTimeout, lowestDelta;

if ( $.event.fixHooks ) {
    for ( var i = toFix.length; i; ) {
        $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    version: '3.1.12',

    setup: function() {
        if ( this.addEventListener ) {
            for ( var i = toBind.length; i; ) {
                this.addEventListener( toBind[--i], mousewheel_handler, false );
            }
        } else {
            this.onmousewheel = mousewheel_handler;
        }
        // Store the line height and page height for this particular element

        $.data(this, 'mousewheel-line-height', $.event.special.mousewheel.getLineHeight(this));
        $.data(this, 'mousewheel-page-height', $.event.special.mousewheel.getPageHeight(this));
    },

    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i = toBind.length; i; ) {
                this.removeEventListener( toBind[--i], mousewheel_handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
        // Clean up the data we added to the element
        $.removeData(this, 'mousewheel-line-height');
        $.removeData(this, 'mousewheel-page-height');
    },

    getLineHeight: function(elem) {
        var $elem = $(elem),
            $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
        if (!$parent.length) {
            $parent = $('body');
        }
        return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
    },

    getPageHeight: function(elem) {
        return $(elem).height();
    },

    settings: {
        adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
        normalizeOffset: true  // calls getBoundingClientRect for each event
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
    },

    unmousewheel: function(fn) {
        return this.unbind('mousewheel', fn);
    }
});


function mousewheel_handler(event) {
    var orgEvent   = event || window.event,
        args       = slice.call(arguments, 1),
        delta      = 0,
        deltaX     = 0,
        deltaY     = 0,
        absDelta   = 0,
        offsetX    = 0,
        offsetY    = 0;
    event = $.event.fix(orgEvent);
    event.type = 'mousewheel';

    // Old school scrollwheel delta
    if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
    if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
    if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
    if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

    // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
    if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaX = deltaY * -1;
        deltaY = 0;
    }

    // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
    delta = deltaY === 0 ? deltaX : deltaY;

    // New school wheel delta (wheel event)
    if ( 'deltaY' in orgEvent ) {
        deltaY = orgEvent.deltaY * -1;
        delta  = deltaY;
    }
    if ( 'deltaX' in orgEvent ) {
        deltaX = orgEvent.deltaX;
        if ( deltaY === 0 ) { delta  = deltaX * -1; }
    }

    // No change actually happened, no reason to go any further
    if ( deltaY === 0 && deltaX === 0 ) { return; }

    // Need to convert lines and pages to pixels if we aren't already in pixels
    // There are three delta modes:
    //   * deltaMode 0 is by pixels, nothing to do
    //   * deltaMode 1 is by lines
    //   * deltaMode 2 is by pages

    if ( orgEvent.deltaMode === 1 ) {
        var lineHeight = $.data(this, 'mousewheel-line-height');
        delta  *= lineHeight;
        deltaY *= lineHeight;
        deltaX *= lineHeight;
    } else if ( orgEvent.deltaMode === 2 ) {
        var pageHeight = $.data(this, 'mousewheel-page-height');
        delta  *= pageHeight;
        deltaY *= pageHeight;
        deltaX *= pageHeight;
    }

    // Store lowest absolute delta to normalize the delta values
    absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

    if ( !lowestDelta || absDelta < lowestDelta ) {
        lowestDelta = absDelta;

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            lowestDelta /= 40;
        }
    }

    // Adjust older deltas if necessary
    if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
        // Divide all the things by 40!
        delta  /= 40;
        deltaX /= 40;
        deltaY /= 40;
    }

    // Get a whole, normalized value for the deltas
    delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
    deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
    deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

    // Normalise offsetX and offsetY properties
    if ( $.event.special.mousewheel.settings.normalizeOffset && this.getBoundingClientRect ) {
        var boundingRect = this.getBoundingClientRect();
        offsetX = event.clientX - boundingRect.left;
        offsetY = event.clientY - boundingRect.top;
    }

    // Add information to the event object
    event.deltaX = deltaX;
    event.deltaY = deltaY;
    event.deltaFactor = lowestDelta;
    event.offsetX = offsetX;
    event.offsetY = offsetY;
    // Go ahead and set deltaMode to 0 since we converted to pixels
    // Although this is a little odd since we overwrite the deltaX/Y
    // properties with normalized deltas.
    event.deltaMode = 0;

    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);

    // Clearout lowestDelta after sometime to better
    // handle multiple device types that give different
    // a different lowestDelta
    // Ex: trackpad = 3 and mouse wheel = 120
    if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
    nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

    return ($.event.dispatch || $.event.handle).apply(this, args);
}

function nullLowestDelta() {
    lowestDelta = null;
}

function shouldAdjustOldDeltas(orgEvent, absDelta) {
    // If this is an older event and the delta is divisable by 120,
    // then we are assuming that the browser is treating this as an
    // older mouse wheel event and that we should divide the deltas
    // by 40 to try and get a more usable deltaFactor.
    // Side note, this actually impacts the reported scroll distance
    // in older browsers and can cause scrolling to be slower than native.
    // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
    return $.event.special.mousewheel.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
}
// Source: js/utils/scroll-events.js
var special = jQuery.event.special,
    uid1 = 'D' + (+new Date()),
    uid2 = 'D' + (+new Date() + 1);

special.scrollstart = {
    setup: function() {

        var timer,
            handler =  function(evt) {

                var _self = this,
                    _args = arguments;

                if (timer) {
                    clearTimeout(timer);
                } else {
                    evt.type = 'scrollstart';
                    jQuery.event.dispatch.apply(_self, _args);
                }

                timer = setTimeout( function(){
                    timer = null;
                }, special.scrollstop.latency);

            };

        jQuery(this).bind('scroll', handler).data(uid1, handler);

    },
    teardown: function(){
        jQuery(this).unbind( 'scroll', jQuery(this).data(uid1) );
    }
};

special.scrollstop = {
    latency: 300,
    setup: function() {

        var timer,
            handler = function(evt) {

                var _self = this,
                    _args = arguments;

                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout( function(){

                    timer = null;
                    evt.type = 'scrollstop';
                    jQuery.event.dispatch.apply(_self, _args);

                }, special.scrollstop.latency);

            };

        jQuery(this).bind('scroll', handler).data(uid2, handler);

    },
    teardown: function() {
        jQuery(this).unbind( 'scroll', jQuery(this).data(uid2) );
    }
};
// Source: js/utils/storage.js
var Storage = {
    key: "METRO:APP",

    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );

        return this;
    },

    nvl: function(data, other){
        return data === undefined || data === null ? other : data;
    },

    setKey: function(key){
        this.key = key;
    },

    getKey: function(){
        return this.key;
    },

    setItem: function(key, value){
        window.localStorage.setItem(this.key + ":" + key, JSON.stringify(value));
    },

    getItem: function(key, default_value, reviver){
        var result, value;

        value = this.nvl(window.localStorage.getItem(this.key + ":" + key), default_value);

        try {
            result = JSON.parse(value, reviver);
        } catch (e) {
            result = null;
        }
        return result;
    },

    getItemPart: function(key, sub_key, default_value, reviver){
        var i;
        var val = this.getItem(key, default_value, reviver);

        sub_key = sub_key.split("->");
        for(i = 0; i < sub_key.length; i++) {
            val = val[sub_key[i]];
        }
        return val;
    },

    delItem: function(key){
        window.localStorage.removeItem(this.key + ":" + key)
    },

    size: function(unit){
        var divider;
        switch (unit) {
            case 'm':
            case 'M': {
                divider = 1024 * 1024;
                break;
            }
            case 'k':
            case 'K': {
                divider = 1024;
                break;
            }
            default: divider = 1;
        }
        return JSON.stringify(window.localStorage).length / divider;
    }
};

$.Metro['storage'] = Storage.init();
// Source: js/utils/tpl.js
var TemplateEngine = function(html, options) {
    var re = /<%(.+?)%>/g,
        reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
        code = 'with(obj) { var r=[];\n',
        cursor = 0,
        result,
        match;
    var add = function(line, js) {
        js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line !== '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    };
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, ' ');
    try { result = new Function('obj', code).apply(options, [options]); }
    catch(err) { console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n"); }
    return result;
};

$.Metro['template'] = TemplateEngine;

// Source: js/utils/utilities.js
var Utils = {
    isUrl: function (val) {
        return /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@\-\/]))?/.test(val);
    },

    isTag: function(val){
        return /<\/?[\w\s="/.':;#-\/\?]+>/gi.test(val);
    },

    isColor: function (val) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(val);
    },

    isEmbedObject: function(val){
        var embed = ["iframe", "object", "embed", "video"];
        var result = false;
        $.each(embed, function(){
            if (val.indexOf(this) !== -1) {
                result = true;
            }
        });
        return result;
    },

    isVideoUrl: function(val){
        return /youtu\.be|youtube|vimeo/gi.test(val);
    },

    embedObject: function(val){
        return "<div class='embed-container'>"+val+"</div>";
    },

    embedUrl: function(val){
        if (val.indexOf("youtu.be") !== -1) {
            val = "https://www.youtube.com/embed/" + val.split("/").pop();
        }
        return "<div class='embed-container'><iframe src='"+val+"'></iframe></div>";
    },

    secondsToTime: function(secs) {
        var hours = Math.floor(secs / (60 * 60));

        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);

        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);

        return {
            "h": hours,
            "m": minutes,
            "s": seconds
        };
    },

    hex2rgba: function(hex, alpha){
        var c;
        alpha = isNaN(alpha) ? 1 : alpha;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length=== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
        }
        throw new Error('Hex2rgba error. Bad Hex value');
    },

    random: function(from, to){
        return Math.floor(Math.random()*(to-from+1)+from);
    },

    isInt: function(n){
        return Number(n) === n && n % 1 === 0;
    },

    isFloat: function(n){
        return Number(n) === n && n % 1 !== 0;
    },

    uniqueId: function () {
var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },

    isTouchDevice: function() {
        return (('ontouchstart' in window)
        || (navigator.MaxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0));
    },


    secondsToFormattedString: function(time){
        var hours, minutes, seconds;

        hours = parseInt( time / 3600 ) % 24;
        minutes = parseInt( time / 60 ) % 60;
        seconds = time % 60;

        return (hours ? (hours) + ":" : "") + (minutes < 10 ? "0"+minutes : minutes) + ":" + (seconds < 10 ? "0"+seconds : seconds);
    },

    callback: function(f, args, context){
        return this.exec(f, args, context);
    },

    exec: function(f, args, context){
        if (f === undefined || f === null) {return false;}
        var func = this.isFunc(f);
        if (func === false) {
            func = new Function("a", f);
        }

        return func.apply(context, args);
    },

    isFunc: function(f){
        return this.isType(f, 'function');
    },

    isObject: function(o){
        return this.isType(o, 'object')
    },

    isType: function(o, t){
        if (o === undefined || o === null) {
            return false;
        }

        if (this.isTag(o) || this.isUrl(o)) {
            return false;
        }

        if (typeof o === t) {
            return o;
        }

        if (typeof window[o] === t) {
            return window[o];
        }

        if (typeof o === 'string' && o.indexOf(".") === -1) {
            return false;
        }

        var ns = o.split(".");
        var i, context = window;

        for(i = 0; i < ns.length; i++) {
            context = context[ns[i]];
        }

        return typeof context === t ? context : false;
    },

    isMetroObject: function(el, type){
        var $el = $(el), el_obj = $el.data(type);

        if ($el.length === 0) {
            console.log(type + ' ' + el + ' not found!');
            return false;
        }

        if (el_obj === undefined) {
            console.log('Element not contain role '+ type +'! Please add attribute data-role="'+type+'" to element ' + el);
            return false;
        }

        return true;
    },

    isJQueryObject: function(el){
        return (typeof jQuery === "function" && el instanceof jQuery);
    },

    addLocale: function(data){
        $.extend(Locales, data);
    },

    getLocaleNames: function(){
        var result = [];
        $.each(Locales, function(i){
            result.push(i);
        });

        return result;
    },

    elementInViewport: function(el) {
        if (this.isJQueryObject(el)) {
            el = el[0];
        }

        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    objectLength: function(obj){
        return Object.keys(obj).length;
    },

    percent: function(a, b, r){
        if (a === 0) {
            return 0;
        }
        var result = b * 100 / a;
        return r ? Math.round(result) : Math.round(result * 100) / 100;
    },

    camelCase: function(str){
        return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    },

    objectShift: function(obj){
        var min = 0;
        $.each(obj, function(i){
            if (min === 0) {
                min = i;
            } else {
                if (min > i) {
                    min = i;
                }
            }
        });
        delete obj[min];

        return obj;
    },

    objectDelete: function(obj, key){
        return obj[key] !== undefined ? obj : delete obj[key];
    },

    arrayDelete: function(arr, key){
        return arr.indexOf(key) > -1 ? arr.splice(arr.indexOf(key), 1) : arr;
    },

    nvl: function(data, other){
        return data === undefined || data === null ? other : data;
    },

    github: function(repo, callback){
        var that = this;
        $.ajax({
            url: 'https://api.github.com/repos/' + repo,
            dataType: 'jsonp'
        })
        .done(function(data){
            that.callback(callback, data.data);
        });
    },

    detectIE: function() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    },

    detectChrome: function(){
        return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    },

    md5: function(s){
        return hex_md5(s);
    },

    encodeURI: function(str){
        return encodeURI(str).replace(/%5B/g, '[').replace(/%5D/g, ']');
    },

    pageHeight: function(){
        var body = document.body,
            html = document.documentElement;

        return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
    },

    cleanPreCode: function(selector){
        var els = Array.prototype.slice.call(document.querySelectorAll(selector), 0);

        els.forEach(function(el, idx, arr){
            var txt = el.textContent
                .replace(/^[\r\n]+/, "")	// strip leading newline
                .replace(/\s+$/g, "");

            if (/^\S/gm.test(txt)) {
                el.textContent = txt;
                return;
            }

            var mat, str, re = /^[\t ]+/gm, len, min = 1e3;

            while (mat = re.exec(txt)) {
                len = mat[0].length;

                if (len < min) {
                    min = len;
                    str = mat[0];
                }
            }

            if (min === 1e3)
                return;

            el.textContent = txt.replace(new RegExp("^" + str, 'gm'), "");
        });
    },

    coords: function(el){
        if (this.isJQueryObject(el)) {
            el = el[0];
        }

        var box = el.getBoundingClientRect();

        return {
            top: box.top + window.pageYOffset,
            left: box.left + window.pageXOffset
        };
    },

    positionXY: function(e, t){
        switch (t) {
            case 'client': return this.clientXY(e); break;
            case 'screen': return this.screenXY(e); break;
            case 'page': return this.pageXY(e); break;
            default: return {left: o, top: 0}
        }
    },

    clientXY: function(event){
        return {
            x: this.isTouchDevice() ? event.changedTouches[0].clientX : event.clientX,
            y: this.isTouchDevice() ? event.changedTouches[0].clientY : event.clientY
        };
    },

    screenXY: function(event){
        return {
            x: this.isTouchDevice() ? event.changedTouches[0].screenX : event.screenX,
            y: this.isTouchDevice() ? event.changedTouches[0].screenY : event.screenY
        };
    },

    pageXY: function(event){
        return {
            x: this.isTouchDevice() ? event.changedTouches[0].pageX : event.pageX,
            y: this.isTouchDevice() ? event.changedTouches[0].pageY : event.pageY
        };
    },

    hiddenElementSize: function(el, inner){
        var clone = $(el).clone();
        clone.removeAttr("data-role").css({
            visibility: "hidden",
            position: "absolute",
            display: "block"
        });
        $("body").append(clone);
        var width = inner === true ? clone.innerWidth() : clone.outerWidth();
        var height = inner === true ? clone.innerHeight() : clone.outerHeight();
        clone.remove();
        return {
            width: width,
            height: height
        }
    },

    placeElement: function(el, place){

        var elementSize = Utils.hiddenElementSize(el);
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();

        if (place === 'center' || place === 'center-center') {
            return {
                left: ( windowWidth - elementSize.width ) / 2,
                top: ( windowHeight - elementSize.height ) / 2,
                right: "auto",
                bottom: "auto"
            };
        }
        if (place === 'top-left') {
            return {
                left: 0,
                top: 0,
                right: "auto",
                bottom: "auto"
            };
        }
        if (place === 'top-right') {
            return {
                right: 0,
                top: 0,
                left: "auto",
                bottom: "auto"
            };
        }
        if (place === 'top-center') {
            return {
                left: ( windowWidth - elementSize.width ) / 2,
                top: 0,
                right: "auto",
                bottom: "auto"
            };
        }
        if (place === 'bottom-right') {
            return {
                right: 0,
                bottom: 0,
                top: "auto",
                left: "auto"
            };
        }
        if (place === 'bottom-left') {
            return {
                left: 0,
                bottom: 0,
                top: "auto",
                right: "auto"
            };
        }
        if (place === 'bottom-center') {
            return {
                left: ( windowWidth - elementSize.width ) / 2,
                bottom: 0,
                top: "auto",
                right: "auto"
            };
        }
        if (place === 'left-center') {
            return {
                top: ( windowHeight - elementSize.height ) / 2,
                left: 0,
                right: "auto",
                bottom: "auto"
            };
        }
        if (place === 'right-center') {
            return {
                top: ( windowHeight - elementSize.height ) / 2,
                right: 0,
                left: "auto",
                bottom: "auto"
            };
        }

        return {
            top: "auto",
            right: "auto",
            left: "auto",
            bottom: "auto"
        };
    },

    getStyle: function(el, pseudo){
        if (Utils.isJQueryObject(el) === true) {
            el  = el[0];
        }
        return window.getComputedStyle(el, pseudo);
    },

    getStyleOne: function(el, property){
        return this.getStyle(el).getPropertyValue(property);
    },

    computedRgbToHex: function(rgb){
        var a = rgb.replace(/[^\d,]/g, '').split(',');
        var result = "#";
        $.each(a, function(){
            var h = parseInt(this).toString(16);
            result += h.length === 1 ? "0" + h : h;
        });
        return result;
    },

    updateURIParameter: function(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    },

    getURIParameter: function(url, name){
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    isDate: function(val){
        return (new Date(val) !== "Invalid Date" && !isNaN(new Date(val)));
    }
};

$.Metro['utils'] = window.metroUtils = Utils;
// Source: js/plugins/accordion.js
var Accordion = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onAccordionCreate, [this.element]);

        return this;
    },
    options: {
        duration: METRO_ANIMATION_DURATION,
        oneFrame: true,
        showActive: true,
        activeFrameClass: "",
        activeHeadingClass: "",
        activeContentClass: "",
        onFrameOpen: Metro.noop,
        onFrameBeforeOpen: Metro.noop_true,
        onFrameClose: Metro.noop,
        onFrameBeforeClose: Metro.noop_true,
        onAccordionCreate: Metro.noop
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
        var frames = element.children(".frame");
        var active = element.children(".frame.active");
        var frame_to_open;

        if (active.length === 0) {
            frame_to_open = frames[0];
        } else {
            frame_to_open = active[0];
        }

        this._hideAll();

        if (o.showActive === true || o.oneFrame === true) {
            this._openFrame(frame_to_open);
        }

        element.on("click", ".heading", function(){
            var heading = $(this);
            var frame = heading.parent();

            if (heading.closest(".accordion")[0] !== element[0]) {
                return false;
            }

            if (frame.hasClass("active")) {
                if (active.length === 1 && o.oneFrame) {
                } else {
                    that._closeFrame(frame);
                }
            } else {
                that._openFrame(frame);
            }

            element.trigger("open", {frame: frame});
        });
    },

    _openFrame: function(f){
        var that = this, element = this.element, o = this.options;
        var frames = element.children(".frame");
        var frame = $(f);

        if (Utils.exec(o.onFrameBeforeOpen, frame[0]) === false) {
            return false;
        }

        if (o.oneFrame === true) {
            this._closeAll();
        }

        frame.addClass("active " + o.activeFrameClass);
        frame.children(".heading").addClass(o.activeHeadingClass);
        frame.children(".content").addClass(o.activeContentClass).slideDown(o.duration);

        Utils.callback(o.onFrameOpen, frame[0]);
    },

    _closeFrame: function(f){
        var that = this, element = this.element, o = this.options;
        var frame = $(f);

        if (Utils.exec(o.onFrameBeforeOpen, frame[0]) === false) {
            return ;
        }

        frame.removeClass("active " + o.activeFrameClass);
        frame.children(".heading").removeClass(o.activeHeadingClass);
        frame.children(".content").removeClass(o.activeContentClass).slideUp(o.duration);

        Utils.callback(o.onFrameClose, frame[0]);
    },

    _closeAll: function(){
        var that = this, element = this.element, o = this.options;
        var frames = element.children(".frame");

        $.each(frames, function(){
            that._closeFrame(this);
        });
    },

    _hideAll: function(){
        var that = this, element = this.element, o = this.options;
        var frames = element.children(".frame");

        $.each(frames, function(){
            $(this).children(".content").hide(0);
        });
    },

    _openAll: function(){
        var that = this, element = this.element, o = this.options;
        var frames = element.children(".frame");

        $.each(frames, function(){
            that._openFrame(this);
        });
    },

    changeAttribute: function(attributeName){
    }
};

Metro.plugin('accordion', Accordion);
// Source: js/plugins/activity.js
var Activity = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onActivityCreate, [this.element]);

        return this;
    },

    options: {
        type: "ring",
        style: "light",
        size: 64,
        radius: 20,
        onActivityCreate: Metro.noop
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
        var i, wrap;

        element
            .html('')
            .addClass(o.style + "-style")
            .addClass("activity-" + o.type);

        function _metro(){
            for(i = 0; i < 5 ; i++) {
                $("<div/>").addClass('circle').appendTo(element);
            }
        }

        function _square(){
            for(i = 0; i < 4 ; i++) {
                $("<div/>").addClass('square').appendTo(element);
            }
        }

        function _cycle(){
            $("<div/>").addClass('cycle').appendTo(element);
        }

        function _ring(){
            for(i = 0; i < 5 ; i++) {
                wrap = $("<div/>").addClass('wrap').appendTo(element);
                $("<div/>").addClass('circle').appendTo(wrap);
            }
        }

        function _simple(){
            $('<svg class="circular"><circle class="path" cx="'+o.size/2+'" cy="'+o.size/2+'" r="'+o.radius+'" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg>').appendTo(element);
        }

        switch (o.type) {
            case 'metro': _metro(); break;
            case 'square': _square(); break;
            case 'cycle': _cycle(); break;
            case 'simple': _simple(); break;
            default: _ring();
        }
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('activity', Activity);
// Source: js/plugins/checkbox.js
var Checkbox = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCheckboxCreate, [this.element]);

        return this;
    },
    options: {
        caption: "",
        captionPosition: "right",
        disabled: false,
        onCheckboxCreate: Metro.noop
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
        var prev = element.prev();
        var parent = element.parent();
        var container = $("<label>").addClass("checkbox " + element[0].className);
        var check = $("<span>").addClass("check");
        var caption = $("<span>").addClass("caption").html(o.caption);

        element.appendTo(container);

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        check.appendTo(container);

        if (o.captionPosition === 'left') {
            caption.insertBefore(check);
        } else {
            caption.insertAfter(check);
        }

        element[0].className = '';

        if (o.disabled === true && element.is(':disabled')) {
            this.disable();
        } else {
            this.enable();
        }
    },

    disable: function(){
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        this.element.data("disabled", false);
        this.element.parent().removeClass("disabled");
    },

    toggleState: function(){
        if (this.element.data("disabled") === false) {
            this.disable();
        } else {
            this.enable();
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'disabled': this.toggleState(); break;
        }
    }
};

Metro.plugin('checkbox', Checkbox);
// Source: js/plugins/clock.js
var Clock = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this._clockInterval = null;
        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onClockCreate, [this.element]);

        return this;
    },

    options: {
        showTime: true,
        showDate: true,
        timeFormat: '24',
        dateFormat: 'american',
        divider: "&nbsp;&nbsp;",
        onClockCreate: Metro.noop
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
        var that = this;

        this._tick();
        this._clockInterval = setInterval(function(){
            that._tick();
        }, 500);
    },

    _addLeadingZero: function(i){
        if (i<10){i="0" + i;}
        return i;
    },

    _tick: function(){
        var that = this, element = this.element, o = this.options;
        var timestamp = new Date();
        var time = timestamp.getTime();
        var result = "";
        var h = timestamp.getHours(),
            i = timestamp.getMinutes(),
            s = timestamp.getSeconds(),
            d = timestamp.getDate(),
            m = timestamp.getMonth() + 1,
            y = timestamp.getFullYear(),
            a = '';

        if (o.timeFormat === '12') {
            a = " AM";
            if (h > 11) { a = " PM"; }
            if (h > 12) { h = h - 12; }
            if (h === 0) { h = 12; }
        }

        h = this._addLeadingZero(h);
        i = this._addLeadingZero(i);
        s = this._addLeadingZero(s);
        m = this._addLeadingZero(m);
        d = this._addLeadingZero(d);

        if (o.showDate) {
            if (o.dateFormat === 'american') {
                result += "<span class='date-month'>" + m + "</span>";
                result += "<span class='date-divider'>-</span>";
                result += "<span class='date-day'>" + d + "</span>";
                result += "<span class='date-divider'>-</span>";
                result += "<span class='date-year'>" + y + "</span>";
            } else {
                result += "<span class='date-day'>" + d + "</span>";
                result += "<span class='date-divider'>-</span>";
                result += "<span class='date-month'>" + m + "</span>";
                result += "<span class='date-divider'>-</span>";
                result += "<span class='date-year'>" + y + "</span>";
            }
            result += o.divider;
        }

        if (o.showTime) {
            result += "<span class='clock-hour'>" + h + "</span>";
            result += "<span class='clock-divider'>:</span>";
            result += "<span class='clock-minute'>" + i + "</span>";
            result += "<span class='clock-divider'>:</span>";
            result += "<span class='clock-second'>" + s + "</span>";
        }

        element.html(result);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('clock', Clock);
// Source: js/plugins/collapse.js
var Collapse = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.toggle = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCollapseCreate, [this.element]);

        return this;
    },

    options: {
        toggleElement: false,
        duration: METRO_ANIMATION_DURATION,
        onExpand: Metro.noop,
        onCollapse: Metro.noop,
        onCollapseCreate: Metro.noop
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
        var toggle;

        toggle = o.toggleElement !== false ? $(o.toggleElement) : element.siblings('.collapse-toggle').length > 0 ? element.siblings('.collapse-toggle') : element.siblings('a:nth-child(1)');

        toggle.on('click', function(e){
            if (element.css('display') === 'block' && !element.hasClass('keep-open')) {
                that._close(element);
            } else {
                that._open(element);
            }
            e.preventDefault();
            e.stopPropagation();
        });

        this.toggle = toggle;
    },

    _close: function(el){

        if (Utils.isJQueryObject(el) === false) {
            el = $(el);
        }

        var dropdown  = el.data("collapse");
        var options = dropdown.options;

        el.slideUp(options.duration, function(){
            el.trigger("onCollapse", null, el);
            el.data("collapsed", true);
            el.addClass("collapsed");
            Utils.exec(options.onCollapse, [el]);
        });
    },

    _open: function(el){
        if (Utils.isJQueryObject(el) === false) {
            el = $(el);
        }

        var dropdown  = el.data("collapse");
        var options = dropdown.options;

        el.slideDown(options.duration, function(){
            el.trigger("onExpand", null, el);
            el.data("collapsed", false);
            el.removeClass("collapsed");
            Utils.exec(options.onExpand, [el]);
        });
    },

    collapse: function(){
        this._close(this.element);
    },

    expand: function(){
        this._open(this.element);
    },

    isCollapsed: function(){
        return this.element.data("collapsed");
    },

    toggleState: function(){
        var element = this.element;
        if (element.attr("collapsed") === true || element.data("collapsed") === true) {
            this.expand();
        } else {
            this.collapse();
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "collapsed":
            case "data-collapsed": this.toggleState(); break;
        }
    }
};

Metro.plugin('collapse', Collapse);
// Source: js/plugins/countdown.js
var Countdown = {
    init: function( options, elem ) {
        var that = this;
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.timepoint = (new Date()).getTime();
        this.breakpoint = null;
        this.blinkInterval = null;
        this.tickInterval = null;

        this.zeroDaysFired = false;
        this.zeroHoursFired = false;
        this.zeroMinutesFired = false;
        this.zeroSecondsFired = false;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onCountdownCreate, [this.element]);

        if (this.options.start === true) {
            this.start();
        }

        return this;
    },

    options: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        date: null,
        start: true,
        daysLabel: "days",
        hoursLabel: "hours",
        minutesLabel: "mins",
        secondsLabel: "secs",
        clsCountdown: "",
        clsZero: "",
        clsAlarm: "",
        clsDays: "",
        clsHours: "",
        clsMinutes: "",
        clsSeconds: "",
        onCountdownCreate: Metro.noop,
        onAlarm: Metro.noop,
        onTick: Metro.noop,
        onZero: Metro.noop
    },

    _setOptionsFromDOM: function(){
        var element = this.element, o = this.options;

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
        var parts = ["days", "hours", "minutes", "seconds"];
        var dm = 24*60*60*1000, hm = 60*60*1000, mm = 60*1000, sm = 1000;
        var delta_days, delta_hours, delta_minutes;

        element.addClass("countdown").addClass(o.clsCountdown);

        if (o.date !== null && Utils.isDate(o.date) !== false) {
            this.timepoint = (new Date(o.date)).getTime();
        }

        this.breakpoint = this.timepoint;

        if (parseInt(o.days) > 0) {
            this.breakpoint += parseInt(o.days) * dm;
        }
        if (parseInt(o.hours) > 0) {
            this.breakpoint += parseInt(o.hours) * hm;
        }
        if (parseInt(o.minutes) > 0) {
            this.breakpoint += parseInt(o.minutes) * mm;
        }
        if (parseInt(o.seconds) > 0) {
            this.breakpoint += parseInt(o.seconds) * sm;
        }

        delta_days = Math.round((that.breakpoint - that.timepoint) / dm);
        delta_hours = Math.round((that.breakpoint - that.timepoint) / hm);
        delta_minutes = Math.round((that.breakpoint - that.timepoint) / mm);

        $.each(parts, function(){
            if (this === "days" && delta_days === 0) {
                return ;
            }

            if (this === "hours" && delta_days === 0 && delta_hours === 0) {
                return ;
            }

            if (this === "minutes" && delta_days === 0 && delta_hours === 0 && delta_minutes === 0) {
                return ;
            }

            if (this === "seconds") {
            }

            var part = $("<div>").addClass("part " + this).attr("data-label", o[this+'Label']).appendTo(element);

            if (this === "days") {part.addClass(o.clsDays);}
            if (this === "hours") {part.addClass(o.clsHours);}
            if (this === "minutes") {part.addClass(o.clsMinutes);}
            if (this === "seconds") {part.addClass(o.clsSeconds);}

            $("<div>").addClass("digit").appendTo(part);
            $("<div>").addClass("digit").appendTo(part);

            if (this === "days" && delta_days >= 100) {

                for(var i = 0; i < String(delta_days/100).length; i++) {
                    $("<div>").addClass("digit").appendTo(part);
                }

            }
        });

        element.find(".digit").html("0");
    },

    blink: function(){
        this.element.toggleClass("blink");
    },

    tick: function(){
        var that = this, element = this.element, o = this.options;
        var dm = 24*60*60, hm = 60*60, mm = 60, sm = 1;
        var left, now = (new Date()).getTime();
        var d, h, m, s;

        left = Math.floor((this.breakpoint - now)/1000);

        if (left <= 0) {
            this.stop();
            if (o.clsZero !== "") {
                element.find(".part").removeClass(o.clsZero);
            }
            element.addClass(o.clsAlarm);
            Utils.exec(o.onAlarm, [now, element]);
            return ;
        }

        d = Math.floor(left / dm);
        left -= d * dm;
        this.draw("days", d);

        if (d === 0) {
            if (o.clsDays !== "") {
                element.find(".days").removeClass(o.clsDays);
            }
            if (this.zeroDaysFired === false) {
                this.zeroDaysFired = true;
                element.find(".days").addClass(o.clsZero);
                Utils.exec(o.onZero, ["days", element]);
            }
        }

        h = Math.floor(left / hm);
        left -= h*hm;
        this.draw("hours", h);

        if (d === 0 && h === 0) {
            if (o.clsHours !== "") {
                element.find(".hours").removeClass(o.clsHours);
            }
            if (this.zeroHoursFired === false) {
                this.zeroHoursFired = true;
                element.find(".hours").addClass(o.clsZero);
                Utils.exec(o.onZero, ["hours", element]);
            }
        }

        m = Math.floor(left / mm);
        left -= m*mm;
        this.draw("minutes", m);

        if (d === 0 && h === 0 && m === 0) {
            if (o.clsMinutes !== "") {
                element.find(".minutes").removeClass(o.clsMinutes);
            }
            if (this.zeroMinutesFired === false) {
                this.zeroMinutesFired = true;
                element.find(".minutes").addClass(o.clsZero);
                Utils.exec(o.onZero, ["minutes", element]);
            }
        }

        s = Math.floor(left / sm);
        this.draw("seconds", s);

        if (d === 0 && h === 0 && m === 0 && s === 0) {
            if (o.clsSeconds !== "") {
                element.find(".seconds").removeClass(o.clsSeconds);
            }
            if (this.zeroSecondsFired === false) {
                this.zeroSecondsFired = true;
                element.find(".seconds").addClass(o.clsZero);
                Utils.exec(o.onZero, ["seconds", element]);
            }
        }

        Utils.exec(o.onTick, [{days:d, hours:h, minutes:m, seconds:s}, element]);
    },

    draw: function(part, value){
        var that = this, element = this.element, o = this.options;
        var digit_value;
        var len = String(value).length;

        var digits = element.find("."+part+" .digit").html("0");
        var digits_length = digits.length;

        for(var i = 0; i < len; i++){
            digit_value = Math.floor( value / Math.pow(10, i) ) % 10;
            element.find("." + part + " .digit:eq("+ (digits_length - 1) +")").html(digit_value);
            digits_length--;
        }
    },

    start: function(){
        var that = this;

        this.element.data("paused", false);

        this.tick();
        this.blinkInterval = setInterval(function(){that.blink();}, 500);
        this.tickInterval = setInterval(function(){that.tick();}, 1000);
    },

    stop: function(){
        var that = this, element = this.element, o = this.options;
        element.find(".digit").html("0");
        clearInterval(this.blinkInterval);
        clearInterval(this.tickInterval);
    },

    pause: function(){
        this.element.data("paused", true);
        clearInterval(this.blinkInterval);
        clearInterval(this.tickInterval);
    },

    togglePlay: function(){
        if (this.element.attr("data-pause") === true) {
            this.pause();
        } else {
            this.start();
        }
    },

    isPaused: function(){
        return this.element.data("paused");
    },

    getTimepoint: function(asDate){
        return asDate === true ? new Date(this.timepoint) : this.timepoint;
    },

    getBreakpoint: function(asDate){
        return asDate === true ? new Date(this.breakpoint) : this.breakpoint;
    },

    getLeft: function(){
        var dm = 24*60*60*1000, hm = 60*60*1000, mm = 60*1000, sm = 1000;
        var now = (new Date()).getTime();
        var left_seconds = Math.floor(this.breakpoint - now);
        return {
            days: Math.round(left_seconds / dm),
            hours: Math.round(left_seconds / hm),
            minutes: Math.round(left_seconds / mm),
            seconds: Math.round(left_seconds / sm)
        };
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "data-pause": this.togglePlay(); break;
        }
    }
};

Metro.plugin('countdown', Countdown);
// Source: js/plugins/dialog.js
var Dialog = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.interval = null;
        this.overlay = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onDialogCreate, [this.element]);

        return this;
    },

    options: {
        title: "",
        content: "",
        actions: {},
        actionsAlign: "right",
        defaultAction: true,
        overlay: true,
        overlayColor: '#000000',
        overlayAlpha: .5,
        overlayClickClose: false,
        width: '480',
        height: 'auto',
        closeAction: true,
        clsDialog: "",
        clsTitle: "",
        clsContent: "",
        clsAction: "",
        clsDefaultAction: "",
        autoHide: 0,
        removeOnClose: false,
        show: false,
        onShow: Metro.noop,
        onHide: Metro.noop,
        onOpen: Metro.noop,
        onClose: Metro.noop,
        onDialogCreate: Metro.noop
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
        var body = $("body");
        var overlay;

        element.addClass("dialog");

        if (element.attr("id") === undefined) {
            element.attr("id", Utils.uniqueId());
        }

        if (o.title !== "") {
            this.setTitle(o.title);
        }

        if (o.content !== "") {
            this.setContent(o.content);
        }

        if (o.defaultAction === true || (o.actions !== false && typeof o.actions === 'object' && Utils.objectLength(o.actions) > 0)) {
            var buttons = element.find(".dialog-actions");
            var button;

            if (buttons.length === 0) {
                buttons = $("<div>").addClass("dialog-actions").addClass("text-"+o.actionsAlign).appendTo(element);
            }

            if (o.defaultAction === true && (Utils.objectLength(o.actions) === 0 && element.find(".dialog-actions > *").length === 0)) {
                button = $("<button>").addClass("button js-dialog-close").addClass(o.clsDefaultAction).html("OK");
                button.appendTo(buttons);
            }

            $.each(o.actions, function(){
                var item = this;
                button = $("<button>").addClass("button").addClass(item.cls).html(item.caption);
                if (item.onclick !== undefined) button.on("click", function(){
                    Utils.exec(item.onclick, [element]);
                });
                button.appendTo(buttons);
            });
        }

        if (o.overlay === true) {
            overlay  = this._overlay();
            this.overlay = overlay;
        }

        if (o.closeAction === true) {
            element.on("click", ".js-dialog-close", function(){
                that.close();
            });
        }

        element.css({
            width: o.width,
            height: o.height,
            visibility: "hidden",
            top: '100%',
            left: Utils.placeElement(element, "center").left
        });

        element.addClass(o.clsDialog);
        element.find(".dialog-title").addClass(o.clsTitle);
        element.find(".dialog-content").addClass(o.clsContent);
        element.find(".dialog-actions").addClass(o.clsAction);

        element.appendTo(body);

        if (o.show) {
            this.open();
        }
    },

    _overlay: function(){
        var that = this, element = this.element, o = this.options;

        var overlay = $("<div>");
        overlay.addClass("overlay");

        if (o.overlayColor === 'transparent') {
            overlay.addClass("transparent");
        } else {
            overlay.css({
                background: Utils.hex2rgba(o.overlayColor, o.overlayAlpha)
            });
        }

        return overlay;
    },

    hide: function(callback){
        var element = this.element, o = this.options;
        var timeout = 0;
        if (o.onHide !== Metro.noop) {
            timeout = 300;
            Utils.exec(o.onHide, [element]);
        }
        setTimeout(function(){
            element.css({
                visibility: "hidden"
            });
            Utils.callback(callback);
        }, timeout);
    },

    show: function(callback){
        var element = this.element, o = this.options;
        this.setPosition();
        element.css({
            visibility: "visible"
        });
        Utils.callback(callback);
        Utils.exec(o.onShow, [element]);
    },

    setPosition: function(){
        var element = this.element;
        element.css(Utils.placeElement(element, "center"));
    },

    setContent: function(c){
        var that = this, element = this.element, o = this.options;
        var content = element.find(".dialog-content");
        if (content.length === 0) {
            content = $("<div>").addClass("dialog-content");
            content.appendTo(element);
        }

        if (!Utils.isJQueryObject(c) && Utils.isFunc(c)) {
            c = Utils.exec(c);
        }

        if (Utils.isJQueryObject(c)) {
            c.appendTo(content);
        } else {
            content.html(c);
        }
    },

    setTitle: function(t){
        var that = this, element = this.element, o = this.options;
        var title = element.find(".dialog-title");
        if (title.length === 0) {
            title = $("<div>").addClass("dialog-title");
            title.appendTo(element);
        }
        title.html(t);
    },

    close: function(){
        var that = this, element = this.element, o = this.options;

        $('body').find('.overlay').remove();

        this.hide(function(){
            element.data("open", false);
            Utils.exec(o.onClose, [element]);
        });
    },

    open: function(){
        var that = this, element = this.element, o = this.options;

        if (o.overlay === true) {
            this.overlay.appendTo($("body"));
            if (o.overlayClickClose === true) {
                this.overlay.on("click", function(){
                    that.close();
                });
            }
        }

        this.show(function(){
            Utils.exec(o.onOpen, [element]);
            element.data("open", true);
            if (parseInt(o.autoHide) > 0) {
                setTimeout(function(){
                    that.close();
                }, parseInt(o.autoHide));
            }
        });
    },

    toggle: function(){
        var element = this.element;
        if (element.data('open')) {
            this.close();
        } else {
            this.open();
        }
    },

    isOpen: function(){
        return this.element.data('open') === true;
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('dialog', Dialog);

Metro['dialog'] = {

    isDialog: function(el){
        return Utils.isMetroObject(el, "dialog");
    },

    open: function(el, content, title){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        if (title !== undefined) {
            dialog.setTitle(title);
        }
        if (content !== undefined) {
            dialog.setContent(content);
        }
        dialog.open();
    },

    close: function(el){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        dialog.close();
    },

    toggle: function(el){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        dialog.toggle();
    },

    isOpen: function(){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        return dialog.isOpen();
    },

    remove: function(el){
        if (!this.isDialog(el)) {
            return false;
        }
        var dialog = $(el).data("dialog");
        dialog.options.removeOnClose = true;
        dialog.close();
    },

    create: function(options){
        var dlg;

        dlg = $("<div>").appendTo($("body"));

        var dlg_options = $.extend({}, {
            show: true,
            closeAction: true,
            removeOnClose: true
        }, (options !== undefined ? options : {}));

        return dlg.dialog(dlg_options);
    }
};
// Source: js/plugins/draggable.js
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

        Utils.exec(this.options.onDraggableCreate, [this.element]);

        return this;
    },

    options: {
        dragElement: 'self',
        dragArea: "parent",
        onCanDrag: Metro.noop_true,
        onDragStart: Metro.noop,
        onDragStop: Metro.noop,
        onDragMove: Metro.noop,
        onDraggableCreate: Metro.noop
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

        this.on();
        dragElement[0].ondragstart = function(){return false;};

        dragElement.on(Metro.eventStart, function(e){

            if (element.data("canDrag") === false || Utils.exec(o.onCanDrag, [element]) !== true) {
                return ;
            }

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

            position = Utils.pageXY(e);

            var drg_h = element.outerHeight(),
                drg_w = element.outerWidth(),
                pos_y = element.offset().top + drg_h - Utils.pageXY(e).y,
                pos_x = element.offset().left + drg_w - Utils.pageXY(e).x;

            Utils.exec(o.onDragStart, [element, position]);

            $(document).on(Metro.eventMove, function(e){
                var pageX, pageY;

                if (that.drag === false) {
                    return ;
                }
                that.move = true;

                pageX = Utils.pageXY(e).x - offset.left;
                pageY = Utils.pageXY(e).y - offset.top;

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

                Utils.exec(o.onDragMove, [element, position]);

                return false;
            });
        });

        dragElement.on(Metro.eventStop, function(e){
            element.css({
                cursor: that.backup.cursor,
                zIndex: that.backup.zIndex
            }).removeClass("draggable");
            that.drag = false;
            that.move = false;
            position = Utils.pageXY(e);
            $(document).off(Metro.eventMove);
            //console.log(o.onDragStop);
            Utils.exec(o.onDragStop, [element, position]);
        });
    },

    off: function(){
        this.element.data("canDrag", false);
    },

    on: function(){
        this.element.data("canDrag", true);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('draggable', Draggable);
// Source: js/plugins/dropdown.js
var Dropdown = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this._toggle = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onDropdownCreate, [this.element]);

        return this;
    },

    options: {
        effect: 'slide',
        toggleElement: false,
        noClose: false,
        duration: METRO_ANIMATION_DURATION,
        onDrop: Metro.noop,
        onUp: Metro.noop,
        onDropdownCreate: Metro.noop
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
        var toggle, parent = element.parent();

        toggle = o.toggleElement !== false ? $(o.toggleElement) : element.siblings('.dropdown-toggle').length > 0 ? element.siblings('.dropdown-toggle') : element.siblings('a:nth-child(1)');

        toggle.on('click', function(e){
            parent.siblings(parent[0].tagName).removeClass("active-container");
            $(".active-container").removeClass("active-container");

            if (element.css('display') === 'block' && !element.hasClass('keep-open')) {
                that._close(element);
            } else {
                $('[data-role=dropdown]').each(function(i, el){
                    if (!element.parents('[data-role=dropdown]').is(el) && !$(el).hasClass('keep-open') && $(el).css('display') === 'block') {
                        that._close(el);
                    }
                });
                if (element.hasClass('horizontal')) {
                    element.css({
                        'visibility': 'hidden',
                        'display': 'block'
                    });
                    var item_length = $(element.children('li')[0]).outerWidth();
                    //var item_length2 = $(menu.children('li')[0]).width();
                    element.css({
                        'visibility': 'visible',
                        'display': 'none'
                    });
                    var menu_width = element.children('li').length * item_length + (element.children('li').length - 1);
                    element.css('width', menu_width);
                }
                that._open(element);
                parent.addClass("active-container");
            }
            e.preventDefault();
            e.stopPropagation();
        });

        this._toggle = toggle;

        if (o.noClose === true) {
            element.on('click', function (e) {
                //e.preventDefault();
                e.stopPropagation();
            });
        }

        $(element).find('li.disabled a').on('click', function(e){
            e.preventDefault();
        });
    },

    _close: function(el){

        if (Utils.isJQueryObject(el) === false) {
            el = $(el);
        }

        var dropdown  = el.data("dropdown");
        var toggle = dropdown._toggle;
        var options = dropdown.options;

        el.slideUp(options.duration, function(){
            el.trigger("onClose", null, el);
            toggle.removeClass('active-toggle').removeClass("active-control");

            Utils.exec(options.onUp, [el]);
        });
    },

    _open: function(el){
        if (Utils.isJQueryObject(el) === false) {
            el = $(el);
        }

        var dropdown  = el.data("dropdown");
        var toggle = dropdown._toggle;
        var options = dropdown.options;

        el.slideDown(options.duration, function(){
            el.trigger("onOpen", null, el);
            toggle.addClass('active-toggle').addClass("active-control");

            Utils.exec(options.onDrop, [el]);
        });
    },

    close: function(){
        this._close(this.element);
    },

    open: function(){
        this._open(this.element);
    },

    changeAttribute: function(attributeName){

    }
};

$(document).on('click', function(e){
    $('[data-role*=dropdown]').each(function(){
        var el = $(this);

        if (el.css('display')==='block' && el.hasClass('keep-open') === false) {
            var dropdown = el.data('dropdown');
            dropdown.close();
        }
    });
});

Metro.plugin('dropdown', Dropdown);
// Source: js/plugins/file.js
var File = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onFileCreate, [this.element]);

        return this;
    },
    options: {
        caption: "Choose file",
        disabled: false,
        onSelect: Metro.noop,
        onFileCreate: Metro.noop
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
        var prev = element.prev();
        var parent = element.parent();
        var container = $("<div>").addClass("file " + element[0].className);
        var caption = $("<span>").addClass("caption");
        var button;

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);
        caption.insertBefore(element);

        element.on('change', function(){
            var val = $(this).val();
            if (val !== '') {
                val = val.replace(/.+[\\\/]/, "");
                caption.html(val);
                caption.attr('title', val);
                Utils.exec(o.onSelect, [val, element])
            }
        });

        button = $("<button>").addClass("button").attr("tabindex", -1).attr("type", "button").html(o.caption);
        button.appendTo(container);

        button.on('click', function(){
            element.trigger("click");
        });

        if (element.attr('dir') === 'rtl' ) {
            container.addClass("rtl");
        }

        element[0].className = '';

        if (o.disabled === true || element.is(":disabled")) {
            this.disable();
        } else {
            this.enable();
        }
    },

    disable: function(){
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        this.element.data("disabled", false);
        this.element.parent().removeClass("disabled");
    },

    toggleState: function(){
        if (this.element.data("disabled") === false) {
            this.disable();
        } else {
            this.enable();
        }
    },

    toggleDir: function(){
        if (this.element.attr("dir") === 'rtl') {
            this.element.parent().addClass("rtl");
        } else {
            this.element.parent().removeClass("rtl");
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'disabled': this.toggleState(); break;
            case 'dir': this.toggleDir(); break;
        }
    }
};

Metro.plugin('file', File);
// Source: js/plugins/gravatar.js
var Gravatar = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onGravatarCreate, [this.element]);

        return this;
    },
    options: {
        email: "",
        size: 80,
        default: "404",
        onGravatarCreate: Metro.noop
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
        var image = element[0].tagName === 'IMG' ? element : $("<img>").appendTo(element);

        this.get();
    },

    getImage: function(email, size, def, is_jquery_object){
        var image = $("<img>");
        image.attr("src", this.getImageSrc(email, size));
        return is_jquery_object === true ? image : image[0];
    },

    getImageSrc: function(email, size, def){
        if (email === undefined || email.trim() === '') {
            return "";
        }

        size = size || 80;
        def = Utils.encodeURI(def) || '404';

        return "//www.gravatar.com/avatar/" + Utils.md5((email.toLowerCase()).trim()) + '?size=' + size + '&d=' + def;
    },

    get: function(){
        var that = this, element = this.element, o = this.options;
        var img = element[0].tagName === 'IMG' ? element : element.find("img");
        if (img.length === 0) {
            return;
        }
        img.attr("src", this.getImageSrc(o.email, o.size, o.default));
        return this;
    },

    resize: function(new_size){
        this.options.size = new_size !== undefined ? new_size : this.element.attr("data-size");
        console.log(this.options.size);
        this.get();
    },

    email: function(new_email){
        this.options.email = new_email !== undefined ? new_email : this.element.attr("data-email");
        this.get();
    },

    changeAttribute: function(attributeName){
        console.log(attributeName);
        switch (attributeName) {
            case 'data-size': this.resize(); break;
            case 'data-email': this.email(); break;
        }
    }
};

Metro.plugin('gravatar', Gravatar);
// Source: js/plugins/hint.js
var Hint = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.hint = null;
        this.interval = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onHintCreate, [this.element]);

        return this;
    },

    options: {
        hintHide: 5000,
        clsHint: "",
        hintText: "",
        hintPosition: "top",
        hintOffset: 4,
        onHintCreate: Metro.noop,
        onHintShow: Metro.noop,
        onHintHide: Metro.noop
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

        element.on(Metro.eventEnter, function(){
            that.createHint();
            if (o.hintHide > 0) {
                that.interval = setTimeout(function(){
                    that.removeHint();
                }, o.hintHide);
            }
        });

        element.on(Metro.eventLeave, function(){
            that.removeHint();
        });
    },

    createHint: function(){
        var that = this, elem = this.elem, element = this.element, o = this.options;
        var hint = $("<div>").addClass("hint").addClass(o.clsHint).html(o.hintText);
        var hint_size = Utils.hiddenElementSize(hint);

        $(".hint").remove();

        if (elem.tagName === 'TD' || elem.tagName === 'TH') {
            var wrp = $("<div/>").css("display", "inline-block").html(element.html());
            element.html(wrp);
            element = wrp;
        }

        if (o.hintPosition === 'top') {
            hint.addClass('top');
            hint.css({
                top: element.offset().top - $(window).scrollTop() - hint_size.height - o.hintOffset,
                left: element.offset().left + element.outerWidth()/2 - hint_size.width/2  - $(window).scrollLeft()
            });
        } else if (o.hintPosition === 'right') {
            hint.addClass('right');
            hint.css({
                top: element.offset().top + element.outerHeight()/2 - hint_size.height/2 - $(window).scrollTop(),
                left: element.offset().left + element.outerWidth() - $(window).scrollLeft() + o.hintOffset
            });
        } else if (o.hintPosition === 'left') {
            hint.addClass('left');
            hint.css({
                top: element.offset().top + element.outerHeight()/2 - hint_size.height/2 - $(window).scrollTop(),
                left: element.offset().left - hint_size.width - $(window).scrollLeft() - o.hintOffset
            });
        } else {
            hint.addClass('bottom');
            hint.css({
                top: element.offset().top - $(window).scrollTop() + element.outerHeight() + o.hintOffset,
                left: element.offset().left + element.outerWidth()/2 - hint_size.width/2  - $(window).scrollLeft()
            });
        }

        hint.appendTo($('body'));
        this.hint = hint;
        Utils.exec(o.onHintShow, [hint, element]);
    },

    removeHint: function(){
        var hint = this.hint;
        var element = this.element;
        var options = this.options;
        var timeout = options.onHintHide === Metro.noop ? 0 : 300;

        if (hint !== null) {
            Utils.exec(options.onHintHide, [hint, element]);
            clearInterval(this.interval);
            setTimeout(function(){
                hint.hide(0, function(){
                    hint.remove();
                });
            }, timeout);
        }
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('hint', Hint);
// Source: js/plugins/input.js
var Input = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onInputCreate, [this.element]);

        return this;
    },
    options: {
        clearButton: true,
        revealButton: true,
        clearButtonIcon: "<span class='mif-cross'></span>",
        revealButtonIcon: "<span class='mif-eye'></span>",
        disabled: false,
        onInputCreate: Metro.noop
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
        var prev = element.prev();
        var parent = element.parent();
        var container = $("<div>").addClass("input " + element[0].className);
        var buttons = $("<div>").addClass("button-group");
        var clearButton, revealButton;

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);
        buttons.appendTo(container);

        if (o.clearButton !== false) {
            clearButton = $("<button>").addClass("button").attr("tabindex", -1).attr("type", "button").html(o.clearButtonIcon);
            clearButton.on("click", function(){
                element.val("").trigger('change').trigger('keyup').focus();
            });
            clearButton.appendTo(buttons);
        }
        if (element.attr('type') === 'password' && o.revealButton !== false) {
            revealButton = $("<button>").addClass("button").attr("tabindex", -1).attr("type", "button").html(o.revealButtonIcon);
            revealButton
                .on('mousedown', function(){element.attr('type', 'text');})
                .on('mouseup', function(){element.attr('type', 'password').focus();});
            revealButton.appendTo(buttons);
        }

        if (element.attr('dir') === 'rtl' ) {
            container.addClass("rtl");
        }

        element[0].className = '';

        element.on("blur", function(){container.removeClass("focused");});
        element.on("focus", function(){container.addClass("focused");});

        if (o.disabled === true || element.is(":disabled")) {
            this.disable();
        } else {
            this.enable();
        }
    },

    disable: function(){
        //this.element.attr("disabled", true);
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        //this.element.attr("disabled", false);
        this.element.data("disabled", false);
        this.element.parent().removeClass("disabled");
    },

    toggleState: function(){
        if (this.element.data("disabled") === false) {
            this.disable();
        } else {
            this.enable();
        }
    },

    toggleValid: function(){
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'disabled': this.toggleState(); break;
            case 'data-valid': this.toggleValid(); break;
        }
    }
};

Metro.plugin('input', Input);
// Source: js/plugins/notify.js
var Notify = {

    options: {
        container: null,
        width: 220,
        timeout: METRO_TIMEOUT,
        duration: METRO_ANIMATION_DURATION,
        distance: "100vh",
        animation: "swing"
    },

    notifies: [],

    setup: function(options){
        var body = $("body"), container;
        this.options = $.extend({}, this.options, options);

        if (this.options.container === null) {
            container = $("<div>").addClass("notify-container");
            body.prepend(container);
            this.options.container = container;
        }

        return this;
    },

    reset: function(){
        var reset_options = {
            width: 220,
            timeout: METRO_TIMEOUT,
            duration: METRO_ANIMATION_DURATION,
            distance: "100vh",
            animation: "swing"
        };
        this.options = $.extend({}, this.options, reset_options);
    },

    create: function(message, title, options){
        var notify, that = this, o = this.options;
        var m, t;

        if (message === undefined || message.trim() === '') {
            return false;
        }

        notify = $("<div>").addClass("notify");
        notify.css({
            width: o.width
        });

        if (title) {
            t = $("<div>").addClass("notify-title").html(title);
            notify.prepend(t);
        }
        m = $("<div>").addClass("notify-message").html(message);
        m.appendTo(notify);

        // Set options
        /*
        * keepOpen, cls, width, callback
        * */
        if (options !== undefined) {
            if (options.cls !== undefined) {
                notify.addClass(options.cls);
            }
            if (options.width !== undefined) {
                notify.css({
                    width: options.width
                });
            }
        }

        notify.on("click", function(){
            that.kill($(this));
        });

        // Show
        notify.hide(function(){
            notify.appendTo(o.container);

            notify.css({
                marginTop: o.distance
            }).fadeIn(100, function(){
                notify.animate({
                    marginTop: ".25rem"
                }, o.duration, o.animation, function(){
                    if (options !== undefined && options.keepOpen === true) {
                    } else {
                        setTimeout(function(){
                            that.kill(notify, (options !== undefined && options.onClose !== undefined ? options.onClose : undefined));
                        }, o.timeout);
                    }
                    if (options !== undefined && options.onShow !== undefined) Utils.callback(options.onShow);
                });
            });
        });
    },

    kill: function(notify, callback){
        notify.fadeOut('slow', function(){
            notify.remove();
            Utils.callback(callback);
        });
    },

    killAll: function(){
        var that = this;
        var notifies = $(".notify");
        $.each(notifies, function(){
            that.kill($(this));
        });
    }
};

$.Metro['notify'] = Notify.setup();
// Source: js/plugins/progress.js
var Progress = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.value = 0;
        this.buffer = 0;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onProgressCreate, [this.element]);

        return this;
    },

    options: {
        value: 0,
        buffer: 0,
        type: "bar",
        small: false,
        clsBack: "",
        clsBar: "",
        clsBuffer: "",
        onValueChange: Metro.noop,
        onBufferChange: Metro.noop,
        onComplete: Metro.noop,
        onBuffered: Metro.noop,
        onProgressCreate: Metro.noop
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

        element
            .html("")
            .addClass("progress");

        function _progress(){
            $("<div>").addClass("bar").appendTo(element);
        }

        function _buffer(){
            $("<div>").addClass("bar").appendTo(element);
            $("<div>").addClass("buffer").appendTo(element);
        }

        function _load(){
            element.addClass("with-load");
            $("<div>").addClass("bar").appendTo(element);
            $("<div>").addClass("buffer").appendTo(element);
            $("<div>").addClass("load").appendTo(element);
        }

        function _line(){
            element.addClass("line");
        }

        switch (o.type) {
            case "buffer": _buffer(); break;
            case "load": _load(); break;
            case "line": _line(); break;
            default: _progress();
        }

        if (o.small === true) {
            element.addClass("small");
        }

        element.addClass(o.clsBack);
        element.find(".bar").addClass(o.clsBar);
        element.find(".buffer").addClass(o.clsBuffer);

        this.val(o.value);
        this.buff(o.buffer);
    },

    val: function(v){
        var that = this, element = this.element, o = this.options;

        if (v === undefined) {
            return that.value;
        }

        var bar  = element.find(".bar");

        if (bar.length === 0) {
            return false;
        }

        this.value = parseInt(v, 10);

        bar.css("width", this.value + "%");

        element.trigger("valuechange", [this.value]);

        Utils.exec(o.onValueChange, [this.value, element]);

        if (this.value === 100) {
            Utils.exec(o.onComplete, [this.value, element]);
        }
    },

    buff: function(v){
        var that = this, element = this.element, o = this.options;

        if (v === undefined) {
            return that.buffer;
        }

        var bar  = element.find(".buffer");

        if (bar.length === 0) {
            return false;
        }

        this.buffer = parseInt(v, 10);

        bar.css("width", this.buffer + "%");

        element.trigger("bufferchange", [this.buffer]);

        Utils.exec(o.onBufferChange, [this.buffer, element]);

        if (this.buffer === 100) {
            Utils.exec(o.onBuffered, [this.buffer, element]);
        }
    },

    changeValue: function(){
        this.val(this.element.attr('data-value'));
    },

    changeBuffer: function(){
        this.buff(this.element.attr('data-buffer'));
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'data-value': this.changeValue(); break;
            case 'data-buffer': this.changeBuffer(); break;
        }
    }
};

Metro.plugin('progress', Progress);
// Source: js/plugins/radio.js
var Radio = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onRadioCreate, [this.element]);

        return this;
    },
    options: {
        caption: "",
        captionPosition: "right",
        disabled: false,
        onRadioCreate: Metro.noop
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
        var prev = element.prev();
        var parent = element.parent();
        var container = $("<label>").addClass("radio " + element[0].className);
        var check = $("<span>").addClass("check");
        var caption = $("<span>").addClass("caption").html(o.caption);

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);
        check.appendTo(container);

        if (o.captionPosition === 'left') {
            caption.insertBefore(check);
        } else {
            caption.insertAfter(check);
        }

        element[0].className = '';

        if (o.disabled === true && element.is(':disabled')) {
            this.disable();
        } else {
            this.enable();
        }
    },

    disable: function(){
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        this.element.data("disabled", false);
        this.element.parent().removeClass("disabled");
    },

    toggleState: function(){
        if (this.element.data("disabled") === false) {
            this.disable();
        } else {
            this.enable();
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'disabled': this.toggleState(); break;
        }
    }
};

Metro.plugin('radio', Radio);
// Source: js/plugins/resizable.js
var Resizable = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onResizableCreate, [this.element]);

        return this;
    },
    options: {
        resizeElement: ".resize-element",
        onResizeStart: Metro.noop,
        onResizeStop: Metro.noop,
        onResize: Metro.noop,
        onResizableCreate: Metro.noop
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

        element.on();

        element.on(Metro.eventStart, o.resizeElement, function(e){

            if (element.data("canResize") === false) {
                return ;
            }

            var startXY = Utils.clientXY(e);
            var startWidth = parseInt(element.outerWidth());
            var startHeight = parseInt(element.outerHeight());
            var size = {width: startWidth, height: startHeight};

            Utils.exec(o.onResizeStart, [element, size]);

            $(document).on(Metro.eventMove, function(e){
                var moveXY = Utils.clientXY(e);
                var size = {
                    width: startWidth + moveXY.x - startXY.x,
                    height: startHeight + moveXY.y - startXY.y
                };
                element.css(size);
                Utils.exec(o.onResize, [element, size]);
            });
        });

        element.on(Metro.eventStop, o.resizeElement, function(){
            $(document).off(Metro.eventMove);

            var size = {
                width: parseInt(element.outerWidth()),
                height: parseInt(element.outerHeight())
            };
            Utils.exec(o.onResizeStop, [element, size]);
        });
    },

    off: function(){
        this.element.data("canResize", false);
    },

    on: function(){
        this.element.data("canResize", true);
    },

    changeAttribute: function(attributeName){
    }
};

Metro.plugin('resizable', Resizable);
// Source: js/plugins/ripple.js
var Ripple = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onRippleCreate, [this.element]);

        return this;
    },
    options: {
        rippleColor: "#fff",
        rippleAlpha: .4,
        rippleTarget: "default",
        onRippleCreate: Metro.noop
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

        var target = o.rippleTarget === 'default' ? null : o.rippleTarget;

        element.on("click", target, function(e){

            var el = $(this);

            if (el.css('position') === 'static') {
                el.css('position', 'relative');
            }

            el.css({
                overflow: 'hidden'
            });

            $(".ripple").remove();

            var size = Math.max(el.outerWidth(), el.outerHeight());

            // Add the element
            var ripple = $("<span class='ripple'></span>").css({
                width: size,
                height: size
            });

            el.prepend(ripple);

            // Get the center of the element
            var x = e.pageX - el.offset().left - ripple.width()/2;
            var y = e.pageY - el.offset().top - ripple.height()/2;

            // Add the ripples CSS and start the animation
            ripple.css({
                background: Utils.hex2rgba(o.rippleColor, o.rippleAlpha),
                width: size,
                height: size,
                top: y + 'px',
                left: x + 'px'
            }).addClass("rippleEffect");
            setTimeout(function(){
                $(".ripple").remove();
            }, 400);
        });
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('ripple', Ripple);
// Source: js/plugins/select.js
var Select = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onSelectCreate, [this.element]);

        return this;
    },
    options: {
        dropHeight: 200,
        disabled: false,
        onChange: Metro.noop,
        onSelectCreate: Metro.noop
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

        var prev = element.prev();
        var parent = element.parent();
        var container = $("<div>").addClass("select " + element[0].className);
        var multiple = element.prop("multiple");
        var select_id = Utils.uniqueId();

        container.attr("id", select_id).addClass("dropdown-toggle");

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);

        if (multiple === false) {
            var input = $("<input data-role='input'>").attr("type", "text").attr("name", "__" + element.attr("name") + "__").prop("readonly", true);
            var list = $("<ul>").addClass("d-menu").css({
                "max-height": o.dropHeight
            });
            $.each(element.children(), function(){
                var opt = this, option = $(this);
                var l, a;

                l = $("<li>").data('value', opt.value).appendTo(list);
                a = $("<a>").html(opt.text).appendTo(l).addClass(opt.className);

                if (option.is(":selected")) {
                    input.val(opt.value).trigger("change");
                }

                a.appendTo(l);
                l.appendTo(list);
            });
            list.on("click", "li", function(){
                var val = $(this).data('value');
                var list_obj = list.data('dropdown');
                input.val(val).trigger("change");
                element.val(val);
                element.trigger("change");
                list_obj.close();
                Utils.exec(o.onChange, [val]);
                //console.log(element.val());
            });
            container.on("click", function(e){
                e.preventDefault();
                e.stopPropagation();
            });

            input.on("blur", function(){container.removeClass("focused");});
            input.on("focus", function(){container.addClass("focused");});

            container.append(input);
            container.append(list);
            list.dropdown({
                toggleElement: "#"+select_id
            });
        }

        if (o.disabled === true || element.is(':disabled')) {
            this.disable();
        } else {
            this.enable();
        }
    },

    disable: function(){
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        this.element.data("disabled", false);
        this.element.parent().removeClass("disabled");
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('select', Select);
// Source: js/plugins/streamer.js
var Streamer = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.data = null;

        this._setOptionsFromDOM();
        this._create();

        return this;
    },

    options: {
        changeUri: true,
        encodeLink: true,
        closed: false,
        chromeNotice: false,
        startFrom: null,
        slideToStart: true,
        startSlideSleep: 1000,
        source: null,
        data: null,
        eventClick: "select",
        streamSelect: false,
        onStreamClick: Metro.noop,
        onStreamSelect: Metro.noop,
        onEventClick: Metro.noop,
        onEventSelect: Metro.noop,
        onStreamerCreate: Metro.noop
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

        element.addClass("streamer");

        if (element.attr("id") === undefined) {
            element.attr("id", Utils.uniqueId());
        }

        if (o.source === null && o.data === null) {
            return false;
        }

        if (o.source !== null) {
            $.get(o.source, function(data){
                that.data = data;
                that.build();
            });
        } else {
            this.data = o.data;
            this.build();
        }

        if (o.chromeNotice === true && Utils.detectChrome() === true && Utils.isTouchDevice() === false) {
            $("<p>").addClass("text-small text-muted").html("*) In Chrome browser please press and hold Shift and turn the mouse wheel.").insertAfter(element);
        }

        if (Utils.isTouchDevice() !== true) {
            $(element).on("mousewheel", ".events-area", function(e) {
                var acrollable = $(this);

                if (e.deltaY === undefined || e.deltaFactor === undefined) {
                    return ;
                }

                if (e.deltaFactor > 1) {
                    var scroll = acrollable.scrollLeft() - ( e.deltaY * 30 );
                    acrollable.scrollLeft(scroll);
                    e.preventDefault();
                }
            });
        }
    },

    build: function(){
        var that = this, element = this.element, o = this.options, data = this.data;
        var streams = $("<div>").addClass("streams").appendTo(element);
        var events_area = $("<div>").addClass("events-area").appendTo(element);
        var timeline = $("<ul>").addClass("streamer-timeline").appendTo(events_area);
        var streamer_events = $("<div>").addClass("streamer-events").appendTo(events_area);
        var event_group_main = $("<div>").addClass("event-group").appendTo(streamer_events);
        var StreamerIDS = Utils.getURIParameter(null, "StreamerIDS");

        if (StreamerIDS !== null && o.encodeLink === true) {
            StreamerIDS = atob(StreamerIDS);
        }

        var StreamerIDS_i = StreamerIDS ? StreamerIDS.split("|")[0] : null;
        var StreamerIDS_a = StreamerIDS ? StreamerIDS.split("|")[1].split(",") : [];

        if (data.actions !== undefined) {
            var actions = $("<div>").addClass("streamer-actions").appendTo(streams);
            $.each(data.actions, function(){
                var item = this;
                var button = $("<button>").addClass("streamer-action").addClass(item.cls).html(item.html);
                if (item.onclick !== undefined) button.on("click", function(){
                    Utils.exec(item.onclick, [element]);
                });
                button.appendTo(actions);
            });
        }

        // Create timeline

        if (data.timeline === undefined) {
            data.timeline = {
                start: "09:00",
                stop: "18:00",
                step: 20
            }
        }

        var start = new Date(), stop = new Date();
        var start_time_array = data.timeline.start ? data.timeline.start.split(":") : [9,0];
        var stop_time_array = data.timeline.stop ? data.timeline.stop.split(":") : [18,0];
        var step = data.timeline.step ? parseInt(data.timeline.step) * 60 : 1200;

        start.setHours(start_time_array[0]);
        start.setMinutes(start_time_array[1]);
        start.setSeconds(0);

        stop.setHours(stop_time_array[0]);
        stop.setMinutes(stop_time_array[1]);
        stop.setSeconds(0);

        for (var i = start.getTime()/1000; i <= stop.getTime()/1000; i += step) {
            var t = new Date(i * 1000);
            var h = t.getHours(), m = t.getMinutes();
            var v = (h < 10 ? "0"+h : h) + ":" + (m < 10 ? "0"+m : m);

            $("<li>").data("time", v).addClass("js-time-point-" + v.replace(":", "-")).html("<em>"+v+"</em>").appendTo(timeline);
        }

        // -- End timeline creator

        if (data.streams !== undefined) {
            $.each(data.streams, function(stream_index){
                var stream_item = this;
                var stream = $("<div>").addClass("stream").addClass(this.cls).appendTo(streams);
                stream
                    .addClass(stream_item.cls)
                    .data("one", false)
                    .data("data", stream_item.data);

                $("<div>").addClass("stream-title").html(stream_item.title).appendTo(stream);
                $("<div>").addClass("stream-secondary").html(stream_item.secondary).appendTo(stream);
                $(stream_item.icon).addClass("stream-icon").appendTo(stream);

                var bg = Utils.computedRgbToHex(Utils.getStyleOne(stream, "background-color"));
                var fg = Utils.computedRgbToHex(Utils.getStyleOne(stream, "color"));

                var stream_events = $("<div>").addClass("stream-events")
                    .data("background-color", bg)
                    .data("text-color", fg)
                    .appendTo(event_group_main);

                if (stream_item.events !== undefined) {
                    $.each(stream_item.events, function(event_index){
                        var event_item = this;
                        var sid = stream_index+":"+event_index;
                        var event = $("<div>")
                            .data("origin", event_item)
                            .data("sid", sid)
                            .data("data", event_item.data)
                            .data("time", event_item.time)
                            .addClass("stream-event")
                            .addClass("size-"+event_item.size+"x")
                            .addClass("shift-"+event_item.shift+"x")
                            .addClass(event_item.cls)
                            .appendTo(stream_events);
                        var slide = $("<div>").addClass("stream-event-slide").appendTo(event);
                        var slide_logo = $("<div>").addClass("slide-logo").appendTo(slide);
                        var slide_data = $("<div>").addClass("slide-data").appendTo(slide);

                        $("<img>").addClass("icon").attr("src", event_item.icon).appendTo(slide_logo);
                        $("<span>").addClass("time").css({
                            backgroundColor: bg,
                            color: fg
                        }).html(event_item.time).appendTo(slide_logo);

                        $("<div>").addClass("title").html(event_item.title).appendTo(slide_data);
                        $("<div>").addClass("subtitle").html(event_item.subtitle).appendTo(slide_data);
                        $("<div>").addClass("desc").html(event_item.desc).appendTo(slide_data);

                        if (o.closed === false && (element.attr("id") === StreamerIDS_i && StreamerIDS_a.indexOf(sid) !== -1) || event_item.selected === true || parseInt(event_item.selected) === 1) {
                            event.addClass("selected");
                        }

                        if (o.closed === true || event_item.closed === true || parseInt(event_item.closed) === 1) {
                            $(event_item.closeIcon).addClass("closed-icon").appendTo(slide);
                            event
                                .data("closed", true)
                                .data("target", event_item.target);
                        }
                    });
                }
            });
        }

        if (data.global !== undefined) {
            $.each(['before', 'after'], function(){
                var global_item = this;
                if (data.global[global_item] !== undefined) {
                    $.each(data.global[global_item], function(){
                        var event_item = this;
                        var group = $("<div>").addClass("event-group").addClass("size-"+event_item.size+"x");
                        var events = $("<div>").addClass("stream-events global-stream").appendTo(group);
                        var event = $("<div>").addClass("stream-event").appendTo(events);
                        event
                            .addClass(event_item.cls)
                            .data("time", event_item.time)
                            .data("origin", event_item)
                            .data("data", event_item.data);

                        $("<div>").addClass("event-title").html(event_item.title).appendTo(event);
                        $("<div>").addClass("event-subtitle").html(event_item.subtitle).appendTo(event);
                        $("<div>").addClass("event-html").html(event_item.html).appendTo(event);

                        if (global_item === 'before') {
                            group.insertBefore(event_group_main);
                        } else {
                            group.insertAfter(element.find(".event-group:last-child"));
                        }
                    });
                }
            });
        }

        element.on("click", ".stream-event", function(e){
            var event = $(this);
            if (o.closed === false && event.data("closed") !== true && o.eventClick === 'select') {
                event.toggleClass("selected");
                if (o.changeUri === true) {
                    that.changeURI();
                }
                Utils.exec(o.onEventSelect, [event, event.hasClass("selected")]);
            } else {
                Utils.exec(o.onEventClick, [event]);

                if (o.closed === true || event.data("closed") === true) {
                    var target = event.data("target");
                    if (target) {
                        window.location.href = target;
                    }
                }
            }
        });

        element.on("click", ".stream", function(e){
            var stream = $(this);
            var index = stream.index();

            if (o.streamSelect === false) {
                return;
            }

            if (element.data("stream") === index) {
                element.find(".stream-event").removeClass("disabled");
                element.data("stream", -1);
            } else {
                element.data("stream", index);
                element.find(".stream-event").addClass("disabled");
                that.enableStream(stream);
                Utils.exec(o.onStreamSelect, [stream]);
            }

            Utils.exec(o.onStreamClick, [stream]);
        });

        element.data("stream", -1);

        if (o.startFrom !== null && o.slideToStart === true) {
            setTimeout(function(){
                that.slideTo(o.startFrom);
            }, o.startSlideSleep);
        }

        Utils.exec(o.onStreamerCreate, [element]);
    },

    slideTo: function(time){
        console.log(time);
        var that = this, element = this.element, o = this.options, data = this.data;
        var target;
        if (time === undefined) {
            target = $(element.find(".streamer-timeline li")[0]);
        } else {
            target = $(element.find(".streamer-timeline .js-time-point-" + time.replace(":", "-"))[0]);
        }

        element.find(".events-area").animate({
            scrollLeft: target[0].offsetLeft - element.find(".streams .stream").outerWidth()
        }, METRO_ANIMATION_DURATION);
    },

    enableStream: function(stream){
        var that = this, element = this.element, o = this.options, data = this.data;
        var index = stream.index();
        stream.removeClass("disabled").data("streamDisabled", false);
        element.find(".stream-events").eq(index).find(".stream-event").removeClass("disabled");
    },

    disableStream: function(stream){
        var that = this, element = this.element, o = this.options, data = this.data;
        var index = stream.index();
        stream.addClass("disabled").data("streamDisabled", true);
        element.find(".stream-events").eq(index).find(".stream-event").addClass("disabled");
    },

    toggleStream: function(stream){
        if (stream.data("streamDisabled") === true) {
            this.enableStream(stream);
        } else {
            this.disableStream(stream);
        }
    },

    getLink: function(){
        var that = this, element = this.element, o = this.options, data = this.data;
        var events = element.find(".stream-event");
        var a = [];
        var link;
        var origin = window.location.href;

        $.each(events, function(){
            var event = $(this);
            if (event.data("sid") === undefined || !event.hasClass("selected")) {
                return;
            }

            a.push(event.data("sid"));
        });

        link = element.attr("id") + "|" + a.join(",");

        if (o.encodeLink === true) {
            link = btoa(link);
        }

        return Utils.updateURIParameter(origin, "StreamerIDS", link);
    },

    getTimes: function(){
        var that = this, element = this.element, o = this.options, data = this.data;
        var times = element.find(".streamer-timeline > li");
        var result = [];
        $.each(times, function(){
            result.push($(this).data("time"));
        });
        return result;
    },

    getEvents: function(event_type, include_global){
        var that = this, element = this.element, o = this.options, data = this.data;
        var items, events = [];

        switch (event_type) {
            case "selected": items = element.find(".stream-event.selected"); break;
            case "non-selected": items = element.find(".stream-event:not(.selected)"); break;
            default: items = element.find(".stream-event");
        }

        $.each(items, function(){
            var item = $(this);
            var origin;

            if (include_global !== true && item.parent().hasClass("global-stream")) return ;

            origin = item.data("origin");

            events.push(origin);
        });

        return events;
    },

    changeURI: function(){
        var that = this, element = this.element, o = this.options, data = this.data;
        var link = this.getLink();
        history.pushState({}, document.title, link);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('streamer', Streamer);
// Source: js/plugins/switch.js
var Switch = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onSwitchCreate, [this.element]);

        return this;
    },
    options: {
        caption: "",
        captionPosition: "right",
        disabled: false,
        onSwitchCreate: Metro.noop
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
        var prev = element.prev();
        var parent = element.parent();
        var container = $("<label>").addClass("switch " + element[0].className);
        var check = $("<span>").addClass("check");
        var caption = $("<span>").addClass("caption").html(o.caption);

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);
        check.appendTo(container);

        if (o.captionPosition === 'left') {
            caption.insertBefore(check);
        } else {
            caption.insertAfter(check);
        }

        element[0].className = '';

        if (o.disabled === true && element.is(':disabled')) {
            this.disable();
        } else {
            this.enable();
        }
    },

    disable: function(){
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        this.element.data("disabled", false);
        this.element.parent().removeClass("disabled");
    },

    toggleState: function(){
        if (this.element.data("disabled") === false) {
            this.disable();
        } else {
            this.enable();
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'disabled': this.toggleState(); break;
        }
    }
};

Metro.plugin('switch', Switch);
// Source: js/plugins/tabs.js
var Tabs = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this._targets = [];

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onTabsCreate, [this.element]);

        return this;
    },

    options: {
        onTab: Metro.noop,
        onTabsCreate: Metro.noop
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
        var prev = element.prev();
        var parent = element.parent();
        var container = $("<div>").addClass("tabs-wrapper " + element[0].className);
        var expandButton, expandTitle;

        element[0].className = "";

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }

        element.appendTo(container);

        element.data('expanded', false);

        expandTitle = $("<div>").addClass("expand-title"); container.prepend(expandTitle);
        expandButton = $("<span>").addClass("expand-button").html("<span></span>"); container.append(expandButton);

        container.on("click", ".expand-button, .expand-title", function(){
            if (element.data('expanded') === false) {
                element.addClass("expand");
                element.data('expanded', true);
            } else {
                element.removeClass("expand");
                element.data('expanded', false);
            }
        });

        element.on("click", "a", function(e){
            var link = $(this);
            var tab = link.parent("li");

            if (element.data('expanded') === true) {
                element.removeClass("expand");
                element.data('expanded', false);
            }
            that._open(tab);
            e.preventDefault();
        });

        this._open();
    },

    _collectTargets: function(){
        var that = this, element = this.element;
        var tabs = element.find("li");

        $.each(tabs, function(){
            var target = $(this).find("a").attr("href");
            if (target && target !== "#") {
                that._targets.push(target);
            }
        });
    },

    _open: function(tab){
        var that = this, element = this.element, o = this.options;
        var tabs = element.find("li");
        var expandTitle = element.siblings(".expand-title");

        if (tabs.length === 0) {
            return;
        }

        this._collectTargets();

        if (tab === undefined) {
            tab = $(tabs[0]);
        }

        var target = tab.find("a").attr("href");

        if (target === undefined) {
            return;
        }

        tabs.removeClass("active");
        if (tab.parent().hasClass("d-menu")) {
            tab.parent().parent().addClass("active");
        } else {
            tab.addClass("active");
        }

        $.each(this._targets, function(){
            $(this).hide();
        });

        if (target !== "#") {
            $(target).show();
        }

        expandTitle.html(tab.find("a").html());

        Utils.exec(o.onTab, [tab]);
    },

    changeAttribute: function(attributeName){

    }
};

Metro.plugin('tabs', Tabs);
// Source: js/plugins/textarea.js
var Textarea = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onTextareaCreate, [this.element]);

        return this;
    },
    options: {
        clearButton: true,
        clearButtonIcon: "<span class='mif-cross'></span>",
        autoSize: false,
        disabled: false,
        onTextareaCreate: Metro.noop
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
        var prev = element.prev();
        var parent = element.parent();
        var container = $("<div>").addClass("textarea " + element[0].className);
        var clearButton;

        if (prev.length === 0) {
            parent.prepend(container);
        } else {
            container.insertAfter(prev);
        }


        if (o.clearButton !== false) {
            clearButton = $("<button>").addClass("button clear-button").attr("tabindex", -1).attr("type", "button").html(o.clearButtonIcon);
            clearButton.on("click", function(){
                element.val("").trigger('change').trigger('keyup').focus();
            });
            clearButton.appendTo(container);
        }

        element.appendTo(container);

        var resize = function(){
            setTimeout(function(){
                element[0].style.cssText = 'height:auto;';
                element[0].style.cssText = 'height:' + element[0].scrollHeight + 'px';
            }, 0);
        };

        if (o.autoSize) {

            container.addClass("autosize");

            setTimeout(function(){
                resize();
            }, 0);

            element.on('keyup', resize);
            element.on('keydown', resize);
            element.on('change', resize);
            element.on('focus', resize);
            element.on('cut', resize);
            element.on('paste', resize);
            element.on('drop', resize);
        }

        element[0].className = '';

        element.on("blur", function(){container.removeClass("focused");});
        element.on("focus", function(){container.addClass("focused");});

        if (o.disabled === true || element.is(':disabled')) {
            this.disable();
        } else {
            this.enable();
        }
    },

    disable: function(){
        this.element.data("disabled", true);
        this.element.parent().addClass("disabled");
    },

    enable: function(){
        this.element.data("disabled", false);
        this.element.parent().removeClass("disabled");
    },

    toggleState: function(){
        if (this.element.data("disabled") === false) {
            this.disable();
        } else {
            this.enable();
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case 'disabled': this.toggleState(); break;
        }
    }
};

Metro.plugin('textarea', Textarea);
// Source: js/plugins/toast.js
var Toast = {
    create: function(message, callback, timeout, cls){
        var toast = $("<div>").addClass("toast").html(message).appendTo($("body")).hide();
        var width = toast.outerWidth();
        timeout = timeout || METRO_TIMEOUT;

        toast.css({
            'left': '50%',
            'margin-left': -(width / 2)
        }).addClass(cls).fadeIn(METRO_ANIMATION_DURATION);

        setTimeout(function(){
            toast.fadeOut(METRO_ANIMATION_DURATION, function(){
                toast.remove();
                Utils.callback(callback);
            });
        }, timeout);
    }
};

$.Metro['toast'] = Toast;
// Source: js/plugins/validator.js
var Validator = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this._onsubmit = null;
        this._action = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onValidatorCreate, [this.element]);

        return this;
    },
    options: {
        submitTimeout: 200,
        interactiveCheck: false,
        onBeforeSubmit: Metro.noop_true,
        onSubmit: Metro.noop,
        onError: Metro.noop,
        onValid: Metro.noop,
        onValidatorCreate: Metro.noop
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

    is_control: function(el){
        return el.parent().hasClass("input") || el.parent().hasClass("select") || el.parent().hasClass("textarea")
    },

    _create: function(){
        var that = this, element = this.element, o = this.options;
        var inputs = element.find("[data-validate]");

        this._action = element[0].action;

        element
            .attr("novalidate", 'novalidate')
            .attr("action", "javascript:");

        $.each(inputs, function(){
            var input = $(this);
            var funcs = input.data("validate");
            var required = funcs.indexOf("required") > -1;
            if (required) {
                if (that.is_control(input)) {
                    input.parent().addClass("required");
                } else {
                    input.addClass("required");
                }
            }
            if (o.interactiveCheck === true) {
                input.on("propertychange change keyup input paste", function () {
                    that._check(this);
                });
            }
        });

        this._onsubmit = null;

        if (element[0].onsubmit !== null) {
            this._onsubmit = element[0].onsubmit;
            element[0].onsubmit = null;
        }

        element[0].onsubmit = function(){
            return that._submit();
        };
    },

    _check: function(el, result, events){
        var that = this, o = this.options;
        var this_result = true;
        var input = $(el);
        var control = this.is_control(input);
        var funcs = input.data('validate') !== undefined ? String(input.data('validate')).split(",").map(function(s){return s.trim();}) : [];

        if (input.is(":disabled")) return;

        if (control) {
            input.parent().removeClass("invalid valid");
        } else {
            input.removeClass("invalid valid");
        }

        $.each(funcs, function(){
            if (this_result === false) return;
            var rule = this.split("=");
            var f, a;

            f = rule[0]; rule.shift();
            a = rule.join("=");

            if (f === 'compare') {
                a = that.element[0].elements[a].value;
            }
            this_result = that._funcs[f](input.val(), a);
            if (result !== undefined) {
                result.val += this_result ? 0 : 1;
            }
        });

        if (this_result === false) {
            if (control) {
                input.parent().addClass("invalid")
            } else {
                input.addClass("invalid")
            }

            if (events === true) {
                Utils.exec(o.onError, [input, input.val()]);
            }

        } else {
            if (control) {
                input.parent().addClass("valid")
            } else {
                input.addClass("valid")
            }

            if (events === true) {
                Utils.exec(o.onValid, [input, input.val()]);
            }
        }
    },

    _submit: function(){
        var that = this, element = this.element, o = this.options;
        var inputs = element.find("[data-validate]");
        var submit = element.find(":submit").attr('disabled', 'disabled').addClass('disabled');
        var result = {
            val: 0
        };

        $.each(inputs, function(){
            that._check(this, result, true);
        });

        submit.removeAttr("disabled").removeClass("disabled");

        element[0].action = this._action;

        result.val += Utils.exec(o.onBeforeSubmit, [element]) === false ? 1 : 0;

        if (result.val === 0) {
            setTimeout(function(){
                Utils.exec(o.onSubmit, [element]);
                if (that._onsubmit !==  null) Utils.exec(that._onsubmit);
            }, o.submitTimeout);
        }

        return result.val === 0;
    },

    _funcs: {
        required: function(val){
            return val.trim() !== "";
        },
        length: function(val, len){
            if (len === undefined || isNaN(len) || len <= 0) {
                return false;
            }
            return val.trim().length === parseInt(len);
        },
        minlength: function(val, len){
            if (len === undefined || isNaN(len) || len <= 0) {
                return false;
            }
            return val.trim().length >= parseInt(len);
        },
        maxlength: function(val, len){
            if (len === undefined || isNaN(len) || len <= 0) {
                return false;
            }
            return val.trim().length <= parseInt(len);
        },
        min: function(val, min_value){
            if (min_value === undefined || isNaN(min_value)) {
                return false;
            }
            if (!this.number(val)) {
                return false;
            }
            if (isNaN(val)) {
                return false;
            }
            return Number(val) >= Number(min_value);
        },
        max: function(val, max_value){
            if (max_value === undefined || isNaN(max_value)) {
                return false;
            }
            if (!this.number(val)) {
                return false;
            }
            if (isNaN(val)) {
                return false;
            }
            return Number(val) <= Number(max_value);
        },
        email: function(val){
            return /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(val);
        },
        url: function(val){
            return /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(val);
        },
        date: function(val){
            return (new Date(val) !== "Invalid Date" && !isNaN(new Date(val)));
        },
        number: function(val){
            return !isNaN(val);
        },
        digits: function(val){
            return /^\d+$/.test(val);
        },
        hexcolor: function(val){
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(val);
        },
        pattern: function(val, pat){
            if (pat === undefined) {
                return false;
            }
            var reg = new RegExp(pat);
            return reg.test(val);
        },
        compare: function(val, val2){
            return val === val2;
        }
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
        }
    }
};

Metro.plugin('validator', Validator);
// Source: js/plugins/window.js
var Window = {
    init: function( options, elem ) {
        this.options = $.extend( {}, this.options, options );
        this.elem  = elem;
        this.element = $(elem);
        this.win = null;
        this.overlay = null;

        this._setOptionsFromDOM();
        this._create();

        Utils.exec(this.options.onWindowCreate, [this.win, this.element]);

        return this;
    },

    options: {
        width: "auto",
        height: "auto",
        btnClose: true,
        btnMin: true,
        btnMax: true,
        clsCaption: "",
        clsContent: "",
        clsWindow: "",
        draggable: true,
        dragElement: ".window-caption",
        dragArea: "parent",
        shadow: false,
        icon: "",
        title: "Window",
        content: "default",
        resizable: true,
        overlay: false,
        overlayColor: 'transparent',
        overlayAlpha: .5,
        modal: false,
        position: "absolute",
        checkEmbed: true,
        top: "auto",
        left: "auto",
        place: "auto",
        onDragStart: Metro.noop,
        onDragStop: Metro.noop,
        onDragMove: Metro.noop,
        onCaptionDblClick: Metro.noop,
        onCloseClick: Metro.noop,
        onMaxClick: Metro.noop,
        onMinClick: Metro.noop,
        onResizeStart: Metro.noop,
        onResizeStop: Metro.noop,
        onResize: Metro.noop,
        onWindowCreate: Metro.noop,
        onShow: Metro.noop,
        onWindowDestroy: Metro.noop,
        onCanClose: Metro.noop_true,
        onClose: Metro.noop
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
        var win, overlay;
        var prev = element.prev();
        var parent = element.parent();

        if (o.modal === true) {
            o.btnMax = false;
            o.btnMin = false;
            o.resizable = false;
        }

        if (o.content === "default") {
            o.content = element;
        }

        win = this._window(o);

        if (prev.length === 0) {
            parent.prepend(win);
        } else {
            win.insertAfter(prev);
        }
        if (o.overlay === true) {
            overlay = this._overlay();
            overlay.appendTo(win.parent());
            this.overlay = overlay;
        }

        Utils.exec(o.onShow, [win]);

        this.win = win;
    },

    _window: function(o){
        var that = this;
        var win, caption, content, icon, title, buttons, btnClose, btnMin, btnMax, resizer, status;

        win = $("<div>").addClass("window");
        win.css({
            width: o.width,
            height: o.height,
            position: o.position,
            top: o.top,
            left: o.left
        });

        if (o.modal === true) {
            win.addClass("modal");
        }

        caption = $("<div>").addClass("window-caption");
        content = $("<div>").addClass("window-content");

        win.append(caption);
        win.append(content);

        if (o.status === true) {
            status = $("<div>").addClass("window-status");
            win.append(status);
        }

        if (o.shadow === true) {
            win.addClass("win-shadow");
        }

        if (o.icon !== undefined) {
            icon = $("<span>").addClass("icon").html(o.icon);
            icon.appendTo(caption);
        }

        if (o.title !== undefined) {
            title = $("<span>").addClass("title").html(o.title);
            title.appendTo(caption);
        }

        if (o.content !== undefined && o.content !== 'original') {

            if (Utils.isUrl(o.content) && Utils.isVideoUrl(o.content)) {
                o.content = Utils.embedUrl(o.content);
            }

            if (!Utils.isJQueryObject(o.content) && Utils.isFunc(o.content)) {
                o.content = Utils.exec(o.content);
            }

            if (Utils.isJQueryObject(o.content)) {
                o.content.appendTo(content);
            } else {
                content.html(o.content);
            }
        }

        if (o.btnClose === true || o.btnMin === true || o.btnMax === true) {
            buttons = $("<div>").addClass("buttons");
            buttons.appendTo(caption);

            if (o.btnMax === true) {
                btnMax = $("<span>").addClass("btn-max");
                btnMax.appendTo(buttons);
            }

            if (o.btnMin === true) {
                btnMin = $("<span>").addClass("btn-min");
                btnMin.appendTo(buttons);
            }

            if (o.btnClose === true) {
                btnClose = $("<span>").addClass("btn-close");
                btnClose.appendTo(buttons);
            }
        }

        win.attr("id", o.id === undefined ? Utils.uniqueId() : o.id);

        if (o.resizable === true) {
            resizer = $("<span>").addClass("resize-element");
            resizer.appendTo(win);
            win.addClass("resizable");
        }

        win.on("dblclick", ".window-caption", function(e){
            that.maximized(e);
        });
        win.on("click", ".btn-max", function(e){
            that.maximized(e);
        });
        win.on("click", ".btn-min", function(e){
            that.minimized(e);
        });
        win.on("click", ".btn-close", function(e){
            that.close(e);
        });

        if (o.resizable === true) {
            win.resizable({
                resizeElement: ".resize-element",
                onResizeStart: o.onResizeStart,
                onResizeStop: o.onResizeStop,
                onResize: o.onResize
            });
        }

        if (o.draggable === true) {
            win.draggable({
                dragElement: o.dragElement,
                dragArea: o.dragArea,
                onDragStart: o.onDragStart,
                onDragStop: o.onDragStop,
                onDragMove: o.onDragMove
            })
        }


        if (o.place !== 'auto') {
            win.css(Utils.placeElement(win, o.place));
        }

        win.addClass(o.clsWindow);
        caption.addClass(o.clsCaption);
        content.addClass(o.clsContent);

        return win;
    },

    _overlay: function(){
        var that = this, win = this.win,  element = this.element, o = this.options;

        var overlay = $("<div>");
        overlay.addClass("overlay");

        if (o.overlayColor === 'transparent') {
            overlay.addClass("transparent");
        } else {
            overlay.css({
                background: Utils.hex2rgba(o.overlayColor, o.overlayAlpha)
            });
        }

        return overlay;
    },

    maximized: function(e){
        var that = this, win = this.win,  element = this.element, o = this.options;
        var target = $(e.currentTarget);
        win.toggleClass("maximized");
        if (target.hasClass("window-caption")) {
            Utils.exec(o.onCaptionDblClick, [win]);
        } else {
            Utils.exec(o.onMaxClick, [win]);
        }
    },

    minimized: function(e){
        var that = this, win = this.win,  element = this.element, o = this.options;
        win.toggleClass("minimized");
        Utils.exec(o.onMinClick, [win]);
    },

    close: function(e){
        var that = this, win = this.win,  element = this.element, o = this.options;

        if (Utils.exec(o.onCanClose, [win]) === false) {
            return false;
        }

        var timeout = 0;

        if (o.onClose !== Metro.noop) {
            timeout = 500;
        }

        Utils.exec(o.onClose, [win]);

        setTimeout(function(){
            if (o.modal === true) {
                win.siblings(".overlay").remove();
            }
            Utils.exec(o.onCloseClick(), [win]);
            Utils.exec(o.onWindowDestroy, [win]);
            win.remove();
        }, timeout);
    },

    toggleButtons: function(a) {
        var that = this, element = this.element, win = this.win, o = this.options;
        var btnClose = win.find(".btn-close");
        var btnMin = win.find(".btn-min");
        var btnMax = win.find(".btn-max");

        if (a === "data-btn-close") {
            btnClose.toggle();
        }
        if (a === "data-btn-min") {
            btnMin.toggle();
        }
        if (a === "data-btn-max") {
            btnMax.toggle();
        }
    },

    changeSize: function(a){
        var that = this, element = this.element, win = this.win, o = this.options;
        if (a === "data-width") {
            win.css("width", element.data("width"));
        }
        if (a === "data-height") {
            win.css("height", element.data("height"));
        }
    },

    changeClass: function(a){
        var that = this, element = this.element, win = this.win, o = this.options;
        if (a === "data-cls-caption") {
            win.find(".window-caption")[0].className = element.attr("data-cls-caption");
        }
        if (a === "data-cls-content") {
            win.find(".window-content")[0].className = element.attr("data-cls-content");
        }
    },

    toggleShadow: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var flag = JSON.parse(element.attr("data-shadow"));
        if (flag === true) {
            win.addClass("win-shadow");
        } else {
            win.removeClass("win-shadow");
        }
    },

    setContent: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var content = element.attr("data-content");
        var result;

        if (!Utils.isJQueryObject(content) && Utils.isFunc(content)) {
            result = Utils.exec(content);
        } else if (Utils.isJQueryObject(content)) {
            result = content.html();
        } else {
            result = content;
        }

        win.find(".window-content").html(result);
    },

    setTitle: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var title = element.attr("data-title");
        win.find(".window-caption .title").html(title);
    },

    setIcon: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var icon = element.attr("data-icon");
        win.find(".window-caption .icon").html(icon);
    },

    getIcon: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        return win.find(".window-caption .icon").html();
    },

    getTitle: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        return win.find(".window-caption .title").html();
    },

    toggleDraggable: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var flag = JSON.parse(element.attr("data-draggable"));
        var drag = win.data("draggable");
        if (flag === true) {
            drag.on();
        } else {
            drag.off();
        }
    },

    toggleResizable: function(){
        var that = this, element = this.element, win = this.win, o = this.options;
        var flag = JSON.parse(element.attr("data-resizable"));
        var resize = win.data("resizable");
        if (flag === true) {
            resize.on();
            win.find(".resize-element").removeClass("resize-element-disabled");
        } else {
            resize.off();
            win.find(".resize-element").addClass("resize-element-disabled");
        }
    },

    changeTopLeft: function(a){
        var that = this, element = this.element, win = this.win, o = this.options;
        var pos;
        if (a === "data-top") {
            pos = parseInt(element.attr("data-top"));
            if (!isNaN(pos)) {
                return ;
            }
            win.css("top", pos);
        }
        if (a === "data-left") {
            pos = parseInt(element.attr("data-left"));
            if (!isNaN(pos)) {
                return ;
            }
            win.css("left", pos);
        }
    },

    changePlace: function (a) {
        var that = this, element = this.element, win = this.win, o = this.options;
        var place = element.attr("data-place");
        Utils.placeElement(win, place);
    },

    changeAttribute: function(attributeName){
        switch (attributeName) {
            case "data-btn-close":
            case "data-btn-min":
            case "data-btn-max": this.toggleButtons(attributeName); break;
            case "data-width":
            case "data-height": this.changeSize(attributeName); break;
            case "data-cls-caption":
            case "data-cls-content": this.changeClass(attributeName); break;
            case "data-shadow": this.toggleShadow(); break;
            case "data-icon": this.setIcon(); break;
            case "data-title": this.setTitle(); break;
            case "data-content": this.setContent(); break;
            case "data-draggable": this.toggleDraggable(); break;
            case "data-resizable": this.toggleResizable(); break;
            case "data-top":
            case "data-left": this.changeTopLeft(attributeName); break;
            case "data-place": this.changePlace(attributeName); break;
        }
    }
};

Metro.plugin('window', Window);

 return Metro.init();

}));