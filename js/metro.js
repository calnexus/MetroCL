if (typeof jQuery === 'undefined') {
    throw new Error('Metro\'s JavaScript requires jQuery');
}

if (window.METRO_DEBUG === undefined) {window.METRO_DEBUG = true;}
if (window.METRO_CALENDAR_WEEK_START === undefined) {window.METRO_CALENDAR_WEEK_START = 1;}
if (window.METRO_LOCALE === undefined) {window.METRO_LOCALE = 'en-US';}
if (window.METRO_ANIMATION_DURATION === undefined) {window.METRO_ANIMATION_DURATION = 200;}
if (window.METRO_TIMEOUT === undefined) {window.METRO_TIMEOUT = 2000;}

if ( typeof Object.create !== 'function' ) {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

var Metro = {

    hotkeys: [],

    init: function(){
        var widgets = $("[data-role]");
        Metro.initHotkeys(widgets);
        Metro.initWidgets(widgets);
        var observer, observerOptions, observerCallback;
        observerOptions = {
            'childList': true,
            'subtree': true
        };
        observerCallback = function(mutations){
            mutations.map(function(record){
                if (record.addedNodes) {
                    /*jshint loopfunc: true */
                    var obj, widgets, plugins;
                    for(var i = 0, l = record.addedNodes.length; i < l; i++) {
                        obj = $(record.addedNodes[i]);
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
        observer.observe(document, observerOptions);

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
                return false;
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
                    }
                } catch (e) {
                    if (window.METRO_DEBUG !== undefined) {
                        console.log(e.message, e.stack);
                    }
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
    }
};

$.Metro = window.metro = Metro;
