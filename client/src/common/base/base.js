angular.module('base', [])

.factory('helpers', function() {
  var helpers = {};

  helpers.removeItem = function(array, input){
    if(typeof input === "number"){
      array.splice(input, 1);
    }
    else{
      array.splice(array.indexOf(input), 1);
    }
  };

  helpers.haveItem = function(array, input){
    var result = false;
    if(array && array.indexOf(input) >= 0){
      result = true;
    }
    return result;
  };

  helpers.deepExtend = function(destination, source) {
    if(!destination){
      destination = {};
    }

    var extend = function() {
      var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false,
        toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,
        push = Array.prototype.push,
        slice = Array.prototype.slice,
        trim = String.prototype.trim,
        indexOf = Array.prototype.indexOf,
        class2type = {
          "[object Boolean]": "boolean",
          "[object Number]": "number",
          "[object String]": "string",
          "[object Function]": "function",
          "[object Array]": "array",
          "[object Date]": "date",
          "[object RegExp]": "regexp",
          "[object Object]": "object"
        },
        jQuery = {
          isFunction: function (obj) {
            return jQuery.type(obj) === "function";
          },
          isArray: Array.isArray ||
            function (obj) {
              return jQuery.type(obj) === "array";
            },
          isWindow: function (obj) {
            return obj !== null && obj == obj.window;
          },
          isNumeric: function (obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
          },
          type: function (obj) {
            return obj === null ? String(obj) : class2type[toString.call(obj)] || "object";
          },
          isPlainObject: function (obj) {
            if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
              return false;
            }
            try {
              if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
              }
            } catch (e) {
              return false;
            }
            var key;
            for (key in obj) {}
            return key === undefined || hasOwn.call(obj, key);
          }
        };
      if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
      }
      if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {};
      }
      if (length === i) {
        target = this;
        --i;
      }
      for (i; i < length; i++) {
        if ((options = arguments[i]) !== null) {
          for (name in options) {
            src = target[name];
            copy = options[name];
            if (target === copy) {
              continue;
            }
            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && jQuery.isArray(src) ? src : [];
              } else {
                clone = src && jQuery.isPlainObject(src) ? src : {};
              }
              // WARNING: RECURSION
              target[name] = extend(deep, clone, copy);
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }
      return target;
    };

    // for (var property in source) {
    //   if (source[property] && source[property].constructor &&
    //    source[property].constructor === Object) {
    //     destination[property] = destination[property] || {};
    //     arguments.callee(destination[property], source[property]);
    //   } else {
    //     destination[property] = source[property];
    //   }
    // }

    extend(true, destination, source);

    return destination;
  };

  helpers.objectSize = function(obj) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };

  // Convert object to query string
  helpers.serializeParam = function(obj, prefix) {
    var str = [];
    for(var p in obj) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push(typeof v == "object" ?
        helpers.serializeParam(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
    return str.join("&");
  };

  // Get date from string
  helpers.getDate = function(input){
    var result = null;

    // Convert "2013-10-31 14:00:00" to "2013-10-31T14:00:00+08:00", for firefox & IE
    var getISOTimeString = function(str){
      if(str && str.length > 1){
        str = str.replace(" ", "T") + ("+08:00"); // Beijing time
      }
      return str;
    };

    // Get valide date only
    if(input && (!isNaN(new Date(input).getTime()))){
      result = new Date(input);
    }

    if(input && !isNaN(new Date(getISOTimeString(input)).getTime())){
      result = new Date(getISOTimeString(input));
    }

    return result;
  };

  // replace all matches
  helpers.replaceAll = function (str, find, replace) {
    var escapeRegExp = function(string) {
      return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };

    if(typeof replace !== "string"){
      replace = "";
    }

    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  };

  // Static compile template
  helpers.staticCompile = function(template, compileObj){
    var compiled = "" + template;

    for(var key in compileObj){
      compiled = helpers.replaceAll(compiled, "{{-" + key + "-}}", compileObj[key]);
    }

    return compiled;
  };

  helpers.addUrlPerfix = function(url){
    var result = "" + (url || "");

    if (url && url.length > 0 && result.indexOf('http://') !== 0 &&
      result.indexOf('https://') !== 0 &&
      result.indexOf('ftp://') !== 0) {
      result = 'http://' + result;
    }

    return result;
  };

  return helpers;
});