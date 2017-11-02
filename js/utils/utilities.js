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

    isDate: function(val){
        return (new Date(val) !== "Invalid Date" && !isNaN(new Date(val)));
    },

    isInt: function(n){
        return Number(n) === n && n % 1 === 0;
    },

    isFloat: function(n){
        return Number(n) === n && n % 1 !== 0;
    },

    isTouchDevice: function() {
        return (('ontouchstart' in window)
            || (navigator.MaxTouchPoints > 0)
            || (navigator.msMaxTouchPoints > 0));
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

        if (typeof o === 'string' && o.indexOf(" ") !== -1) {
            return false;
        }

        if (typeof o === 'string' && o.indexOf("(") !== -1) {
            return false;
        }

        if (typeof o === 'string' && o.indexOf("[") !== -1) {
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

    uniqueId: function () {
        "use strict";
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
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

    isOutsider: function(el) {
        el = this.isJQueryObject(el) ? el : $(el);
        var rect;
        var clone = el.clone();

        clone.removeAttr("data-role").css({
            visibility: "hidden",
            position: "absolute",
            display: "block"
        });
        el.parent().append(clone);

        rect = clone[0].getBoundingClientRect();
        clone.remove();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    inViewport: function(el){
        if (typeof jQuery === "function" && el instanceof jQuery) {
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
            that.callback(callback, [data.data]);
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

        els.forEach(function(el){
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

    hiddenElementSize: function(el, includeMargin){
        var clone = $(el).clone();
        clone.removeAttr("data-role").css({
            visibility: "hidden",
            position: "absolute",
            display: "block"
        });
        $("body").append(clone);

        if (includeMargin === undefined) {
            includeMargin = false;
        }

        var width = clone.outerWidth(includeMargin);
        var height = clone.outerHeight(includeMargin);
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

    getInlineStyles: function(el){
        var styles = {};
        if (this.isJQueryObject(el)) {
            el = el[0];
        }
        for (var i = 0, l = el.style.length; i < l; i++) {
            var s = el.style[i];
            styles[s] = el.style[s];
        }

        return styles;
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

    dateToString: function(val){
        var y = val.getFullYear();
        var m = val.getMonth() + 1;
        var d = val.getDate();

        return (m < 10 ? '0'+m:m)+ "/" + (d<10?'0'+d:d)+"/"+y;
    },

    getLocales: function(){
        return Object.keys(Metro.locales);
    },

    addLocale: function(locale){
        Metro.locales = $.extend( {}, Metro.locales, locale );
    },

    strToArray: function(str, delimiter){
        return str.split(delimiter).map(function(s){
            return s.trim();
        })
    }
};

$.Metro['utils'] = Metro['utils'] = Utils;