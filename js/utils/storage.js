var Storage = {
    key: "MyAppKey",

    setKey: function(key){
        this.key = key;
    },

    setItem: function(key, value){
        window.localStorage.setItem(this.key + ":" + key, JSON.stringify(value));
    },

    getItem: function(key, default_value, reviver){
        var result,
            value = window.localStorage.getItem(this.key + ":" + key) || (default_value || null);
        try {
            result = JSON.parse(value, reviver);
        } catch (e) {
            result = null;
        }
        return result;
    },

    getItemPart: function(key, sub_key, default_value, reviver){
        var val = this.getItem(key, default_value, reviver);
        return val !== null && typeof val === 'object' && val[sub_key] !== undefined ? val[sub_key] : null;
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

$.Metro['storage'] = window.metroStorage = Storage;