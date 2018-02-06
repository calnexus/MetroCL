var Colors = {
    PALETTES: {
        ALL: "colorList",
        METRO: "colorListMetro",
        STANDARD: "colorListStandard"
    },

    colorListMetro: {
        lime: '#a4c400',
        green: '#60a917',
        emerald: '#008a00',
        blue: '#00AFF0',
        teal: '#00aba9',
        cyan: '#1ba1e2',
        cobalt: '#0050ef',
        indigo: '#6a00ff',
        violet: '#aa00ff',
        pink: '#dc4fad',
        magenta: '#d80073',
        crimson: '#a20025',
        red: '#CE352C',
        orange: '#fa6800',
        amber: '#f0a30a',
        yellow: '#fff000',
        brown: '#825a2c',
        olive: '#6d8764',
        steel: '#647687',
        mauve: '#76608a',
        taupe: '#87794e'
    },

    colorListStandard: {
        aliceBlue: "#f0f8ff",
        antiqueWhite: "#faebd7",
        aqua: "#00ffff",
        aquamarine: "#7fffd4",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        bisque: "#ffe4c4",
        black: "#000000",
        blanchedAlmond: "#ffebcd",
        blue: "#0000ff",
        blueViolet: "#8a2be2",
        brown: "#a52a2a",
        burlyWood: "#deb887",
        cadetBlue: "#5f9ea0",
        chartreuse: "#7fff00",
        chocolate: "#d2691e",
        coral: "#ff7f50",
        cornflowerBlue: "#6495ed",
        cornsilk: "#fff8dc",
        crimson: "#dc143c",
        cyan: "#00ffff",
        darkBlue: "#00008b",
        darkCyan: "#008b8b",
        darkGoldenRod: "#b8860b",
        darkGray: "#a9a9a9",
        darkGreen: "#006400",
        darkKhaki: "#bdb76b",
        darkMagenta: "#8b008b",
        darkOliveGreen: "#556b2f",
        darkOrange: "#ff8c00",
        darkOrchid: "#9932cc",
        darkRed: "#8b0000",
        darkSalmon: "#e9967a",
        darkSeaGreen: "#8fbc8f",
        darkSlateBlue: "#483d8b",
        darkSlateGray: "#2f4f4f",
        darkTurquoise: "#00ced1",
        darkViolet: "#9400d3",
        deepPink: "#ff1493",
        deepSkyBlue: "#00bfff",
        dimGray: "#696969",
        dodgerBlue: "#1e90ff",
        fireBrick: "#b22222",
        floralWhite: "#fffaf0",
        forestGreen: "#228b22",
        fuchsia: "#ff00ff",
        gainsboro: "#DCDCDC",
        ghostWhite: "#F8F8FF",
        gold: "#ffd700",
        goldenRod: "#daa520",
        gray: "#808080",
        green: "#008000",
        greenYellow: "#adff2f",
        honeyDew: "#f0fff0",
        hotPink: "#ff69b4",
        indianRed: "#cd5c5c",
        indigo: "#4b0082",
        ivory: "#fffff0",
        khaki: "#f0e68c",
        lavender: "#e6e6fa",
        lavenderBlush: "#fff0f5",
        lawnGreen: "#7cfc00",
        lemonChiffon: "#fffacd",
        lightBlue: "#add8e6",
        lightCoral: "#f08080",
        lightCyan: "#e0ffff",
        lightGoldenRodYellow: "#fafad2",
        lightGray: "#d3d3d3",
        lightGreen: "#90ee90",
        lightPink: "#ffb6c1",
        lightSalmon: "#ffa07a",
        lightSeaGreen: "#20b2aa",
        lightSkyBlue: "#87cefa",
        lightSlateGray: "#778899",
        lightSteelBlue: "#b0c4de",
        lightYellow: "#ffffe0",
        lime: "#00ff00",
        limeGreen: "#32dc32",
        linen: "#faf0e6",
        magenta: "#ff00ff",
        maroon: "#800000",
        mediumAquaMarine: "#66cdaa",
        mediumBlue: "#0000cd",
        mediumOrchid: "#ba55d3",
        mediumPurple: "#9370db",
        mediumSeaGreen: "#3cb371",
        mediumSlateBlue: "#7b68ee",
        mediumSpringGreen: "#00fa9a",
        mediumTurquoise: "#48d1cc",
        mediumVioletRed: "#c71585",
        midnightBlue: "#191970",
        mintCream: "#f5fffa",
        mistyRose: "#ffe4e1",
        moccasin: "#ffe4b5",
        navajoWhite: "#ffdead",
        navy: "#000080",
        oldLace: "#fdd5e6",
        olive: "#808000",
        oliveDrab: "#6b8e23",
        orange: "#ffa500",
        orangeRed: "#ff4500",
        orchid: "#da70d6",
        paleGoldenRod: "#eee8aa",
        paleGreen: "#98fb98",
        paleTurquoise: "#afeeee",
        paleVioletRed: "#db7093",
        papayaWhip: "#ffefd5",
        peachPuff: "#ffdab9",
        peru: "#cd853f",
        pink: "#ffc0cb",
        plum: "#dda0dd",
        powderBlue: "#b0e0e6",
        purple: "#800080",
        rebeccaPurple: "#663399",
        red: "#ff0000",
        rosyBrown: "#bc8f8f",
        royalBlue: "#4169e1",
        saddleBrown: "#8b4513",
        salmon: "#fa8072",
        sandyBrown: "#f4a460",
        seaGreen: "#2e8b57",
        seaShell: "#fff5ee",
        sienna: "#a0522d",
        silver: "#c0c0c0",
        slyBlue: "#87ceeb",
        slateBlue: "#6a5acd",
        slateGray: "#708090",
        snow: "#fffafa",
        springGreen: "#00ff7f",
        steelBlue: "#4682b4",
        tan: "#d2b48c",
        teal: "#008080",
        thistle: "#d8bfd8",
        tomato: "#ff6347",
        turquoise: "#40e0d0",
        violet: "#ee82ee",
        wheat: "#f5deb3",
        white: "#ffffff",
        whiteSmoke: "#f5f5f5",
        yellow: "#ffff00",
        yellowGreen: "#9acd32"
    },

    colorList: {},

    options: {
        distance: 5,
        angle: 30
    },

    init: function(){
        this.colorList = $.extend( {}, this.colorListStandard, this.colorListMetro );
        return this;
    },

    color: function(name, palette){
        palette = palette || this.PALETTES.ALL;
        return this[palette][name];
    },

    collection: function(palette){
        palette = palette || this.PALETTES.ALL;
        return Object.keys(this[palette]);
    },

    hex2rgb: function(hex){
        var regex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace( regex, function( m, r, g, b ) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
        return result ? {
            r: parseInt( result[1], 16 ),
            g: parseInt( result[2], 16 ),
            b: parseInt( result[3], 16 )
        } : null;
    },

    rgb2hex: function(rgb){
        return "#" +
            (( 1 << 24 ) + ( rgb.r << 16 ) + ( rgb.g << 8 ) + rgb.b )
                .toString( 16 ).slice( 1 );
    },

    rgb2hsv: function(rgb){
        var h, s, v;
        var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var delta = max - min;

        v = max;

        if (max === 0) {
            s = 0;
        } else {
            s = 1 - min / max;
        }

        if (max === min) {
            h = 0;
        } else if (max === r && g >= b) {
            h = 60 * ( (g - b) / delta );
        } else if (max === r && g < b) {
            h = 60 * ( (g - b) / delta) + 360
        } else if (max === g) {
            h = 60 * ( (b - r) / delta) + 120
        } else if (max === b) {
            h = 60 * ( (r - g) / delta) + 240
        } else {
            h = 0;
        }

        return {
            h: h, s: s, v: v
        }
    },

    hsv2rgb: function(hsv){
        var r, g, b;
        var h = hsv.h, s = hsv.s * 100, v = hsv.v * 100;
        var Hi = Math.floor(h / 60);
        var Vmin = (100 - s) * v / 100;
        var alpha = (v - Vmin) * ( (h % 60) / 60 );
        var Vinc = Vmin + alpha;
        var Vdec = v - alpha;

        switch (Hi) {
            case 0: r = v; g = Vinc; b = Vmin; break;
            case 1: r = Vdec; g = v; b = Vmin; break;
            case 2: r = Vmin; g = v; b = Vinc; break;
            case 3: r = Vmin; g = Vdec; b = v; break;
            case 4: r = Vinc; g = Vmin; b = v; break;
            case 5: r = v; g = Vmin; b = Vdec; break;
        }

        return {
            r: Math.round(r * 255 / 100),
            g: Math.round(g * 255 / 100),
            b: Math.round(b * 255 / 100)
        }
    },

    hsv2hex: function(hsv){
        return this.rgb2hex(this.hsv2rgb(hsv));
    },

    hex2hsv: function(hex){
        return this.rgb2hsv(this.hex2rgb(hex));
    },

    rgb2cmyk: function(rgb){
        var cmyk = {};

        var r = rgb.r / 255;
        var g = rgb.g / 255;
        var b = rgb.b / 255;

        cmyk.k = Math.min( 1 - r, 1 - g, 1 - b );
        cmyk.c = ( 1 - r - cmyk.k ) / ( 1 - cmyk.k );
        cmyk.m = ( 1 - g - cmyk.k ) / ( 1 - cmyk.k );
        cmyk.y = ( 1 - b - cmyk.k ) / ( 1 - cmyk.k );

        cmyk.c = Math.round( cmyk.c * 100 );
        cmyk.m = Math.round( cmyk.m * 100 );
        cmyk.y = Math.round( cmyk.y * 100 );
        cmyk.k = Math.round( cmyk.k * 100 );

        return cmyk;
    },

    cmyk2rgb: function(cmyk){
        var rgb = {};

        var c = cmyk.c / 100;
        var m = cmyk.m / 100;
        var y = cmyk.y / 100;
        var k = cmyk.k / 100;

        rgb.r = 1 - Math.min( 1, c * ( 1 - k ) + k );
        rgb.g = 1 - Math.min( 1, m * ( 1 - k ) + k );
        rgb.b = 1 - Math.min( 1, y * ( 1 - k ) + k );

        rgb.r = Math.round( rgb.r * 255 );
        rgb.g = Math.round( rgb.g * 255 );
        rgb.b = Math.round( rgb.b * 255 );

        return rgb;
    },

    rgb2websafe: function(rgb){
        return {
            r: Math.round(rgb.r / 51) * 51,
            g: Math.round(rgb.g / 51) * 51,
            b: Math.round(rgb.b / 51) * 51
        }
    },

    hex2websafe: function(hex){
        return this.rgb2hex(this.rgb2websafe(this.hex2rgb(hex)));
    },

    hsv2websafe: function(hsv){
        return this.rgb2hsv(this.rgb2websafe(this.hsv2rgb(hsv)));
    },

    websafe: function(color){
        if (this.isHEX(color)) return this.hex2websafe(color);
        if (this.isRGB(color)) return this.rgb2websafe(color);
        if (this.isHSV(color)) return this.hsv2websafe(color);

        return color;
    },



    darken: function(color, amount){
        if (amount === undefined) {
            amount = 10;
        }
        return this.lighten(color, -1 * Math.abs(amount));
    },

    lighten: function(color, amount){
        var col, type, res;

        if (amount === undefined) {
            amount = 10;
        }

        if (this.isRGB(color)) {
            col = this.rgb2hex(color);
            type = "rgb";
        } else if (this.isHSV(color)) {
            col = this.hsv2hex(color);
            type = "hsv";
        } else {
            col = color;
            type = "hex";
        }

        col = col.slice(1);

        var num = parseInt(col, 16);
        var r = (num >> 16) + amount;

        if (r > 255) r = 255;
        else if  (r < 0) r = 0;

        var b = ((num >> 8) & 0x00FF) + amount;

        if (b > 255) b = 255;
        else if  (b < 0) b = 0;

        var g = (num & 0x0000FF) + amount;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        res = "#" + (g | (b << 8) | (r << 16)).toString(16);

        switch (type) {
            case "rgb": return this.hex2rgb(res);
            case "hsv": return this.hex2hsv(res);
            default: return res;
        }
    },

    isDark: function(hex){
        var rgb = this.hex2rgb(hex);
        var YIQ = (
            ( rgb.r * 299 ) +
            ( rgb.g * 587 ) +
            ( rgb.b * 114 )
        ) / 1000;
        return ( YIQ >= 128 )
    },

    isLight: function(hex){
        return !this.isDark(hex);
    },

    isHSV: function(val){
        return Utils.isObject(val) && "h" in val && "s" in val && "v" in val;
    },

    isRGB: function(val){
        return Utils.isObject(val) && "r" in val && "g" in val && "b" in val;
    },

    isHEX: function(val){
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(val);
    },

    hueShift: function(h, s){
        h+=s;
        while (h >= 360.0) h -= 360.0;
        while (h < 0.0) h += 360.0;
        return h;
    },

    getScheme: function(color, name, format, options){
        this.options = $.extend( {}, this.options, options );

        var that = this;
        var i;
        var scheme = [];
        var hsv;

        if (this.isRGB(color)) {
            hsv = this.rgb2hsv(color);
        } else if (this.isHEX(color)) {
            hsv = this.hex2hsv(color);
        } else {
            hsv = color;
        }

        if (this.isHSV(hsv) === false) {
            console.log("The value is a not supported color format!");
            return false;
        }

        function convert(source, format) {
            var result = [];
            switch (format) {
                case "hex": result = source.map(function(v){return Colors.hsv2hex(v);}); break;
                case "rgb": result = source.map(function(v){return Colors.hsv2rgb(v);}); break;
                default:
            }

            return result;
        }

        function clamp( num, min, max ){
            return Math.max( min, Math.min( num, max ));
        }

        var c, h = hsv.h, s = hsv.s, v = hsv.v;
        var o = this.options;

        switch (name) {
            case "monochromatic":
            case "mono":
                s = hsv.s - .8;  if (s < 0) s += 1;
                scheme.push({h: h, s: s, v: v});

                s = hsv.s - .4;  if (s < 0) s += 1;
                scheme.push({h: h, s: s, v: v});

                scheme.push(hsv);

                v = hsv.v - .3; if (v < 0) v += 1;
                scheme.push({h: h, s: s, v: v});

                v = hsv.v - .6; if (v < 0) v += 1;
                scheme.push({h: h, s: s, v: v});
                break;

            case 'complementary':
            case 'complement':
            case 'comp':
                scheme.push(hsv);

                h = this.hueShift(hsv.h, 180.0);
                scheme.push({h: h, s: s, v: v});
                break;

            case 'double-complementary':
            case 'double-complement':
            case 'double':
                scheme.push(hsv);

                h = this.hueShift(hsv.h, 180.0);
                scheme.push({h: h, s: s, v: v});

                h = this.hueShift(h, -30.0);
                scheme.push({h: h, s: s, v: v});

                h = this.hueShift(h, 180.0);
                scheme.push({h: h, s: s, v: v});

                break;

            case 'analogous':
            case 'analog':

                h = this.hueShift(h, o.angle);
                scheme.push({h: h, s: s, v: v});

                scheme.push(hsv);

                h = this.hueShift(hsv.h, 0.0 - o.angle);
                scheme.push({h: h, s: s, v: v});

                break;

            case 'triadic':
            case 'triad':
                scheme.push(hsv);
                for ( i = 1; i < 3; i++ ) {
                    h = this.hueShift(h, 120.0);
                    scheme.push({h: h, s: s, v: v});
                }
                break;

            case 'tetradic':
            case 'tetra':
                scheme.push(hsv);

                h = this.hueShift(hsv.h, 180.0);
                scheme.push({h: h, s: s, v: v});

                h = this.hueShift(hsv.h, 240.0);
                scheme.push({h: h, s: s, v: v});

                h = this.hueShift(h, 180.0);
                scheme.push({h: h, s: s, v: v});

                break;

            case 'square':
                scheme.push(hsv);
                for ( i = 1; i < 4; i++ ) {
                    h = this.hueShift(h, 90.0);
                    scheme.push({h: h, s: s, v: v});
                }
                break;

            case 'split-complementary':
            case 'split-complement':
            case 'split':
                h = this.hueShift(h, 180.0 - o.angle);
                scheme.push({h: h, s: s, v: v});

                scheme.push(hsv);

                h = this.hueShift(hsv.h, 180.0 + o.angle);
                scheme.push({h: h, s: s, v: v});
                break;

            default: console.log("Unknown scheme name");
        }

        return convert(scheme, format);
    }
};

Metro['colors'] = Colors.init();