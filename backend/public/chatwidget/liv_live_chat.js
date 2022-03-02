/** File: Orisys ChatWidget.js
 *  A JavaScript library for writing XMPP clients.
 *
 *  This library uses either Bidirectional-streams Over Synchronous HTTP (BOSH)
 *  to emulate a persistent, stateful, two-way connection to an XMPP server or
 *  alternatively WebSockets.
 *
 *  More information on BOSH can be found in XEP 124.
 *  For more information on XMPP-over WebSocket see this RFC:
 *  http://tools.ietf.org/html/rfc7395
 */

/* All of the Strophe globals are defined in this special function below so
 * that references to the globals become closures.  This will ensure that
 * on page reload, these references will still be available to callbacks
 * that are still executing.
 */

/* jshint ignore:start */
(function (root, factory)
{
  if (typeof define === 'function' && define.amd)
  {
    //Allow using this built library as an AMD module
    //in another project. That other project will only
    //see this AMD call, not the internal modules in
    //the closure below.
    define([], factory);
  }
  else
  {
    //Browser globals case.
    var wrapper = factory();
    root.Strophe        = wrapper.Strophe;
    root.$build         = wrapper.$build;
    root.$iq            = wrapper.$iq;
    root.$msg           = wrapper.$msg;
    root.$pres          = wrapper.$pres;
    root.SHA1           = wrapper.SHA1;
    root.MD5            = wrapper.MD5;
    root.b64_hmac_sha1  = wrapper.b64_hmac_sha1;
    root.b64_sha1       = wrapper.b64_sha1;
    root.str_hmac_sha1  = wrapper.str_hmac_sha1;
    root.str_sha1       = wrapper.str_sha1;
  }
}(this, function ()
{
//almond, and your modules will be inlined here
/* jshint ignore:end */
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

  var requirejs, require, define;
  (function (undef)
  {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop)
    {
      return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName)
    {
      var nameParts, nameSegment, mapValue, foundMap, lastIndex,
        foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
        baseParts = baseName && baseName.split("/"),
        map = config.map,
        starMap = (map && map['*']) || {};

        //Adjust any relative paths.
      if (name)
      {
        name = name.split('/');
        lastIndex = name.length - 1;

        // If wanting node ID compatibility, strip .js from end
        // of IDs. Have to do this here, and not in nameToUrl
        // because node allows either .js or non .js to map
        // to same file.
        if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex]))
        {
          name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
        }

        // Starts with a '.' so need the baseName
        if (name[0].charAt(0) === '.' && baseParts)
        {
          //Convert baseName to array, and lop off the last part,
          //so that . matches that 'directory' and not name of the baseName's
          //module. For instance, baseName of 'one/two/three', maps to
          //'one/two/three.js', but we want the directory, 'one/two' for
          //this normalization.
          normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
          name = normalizedBaseParts.concat(name);
        }

        //start trimDots
        for (i = 0; i < name.length; i++)
        {
          part = name[i];
          if (part === '.')
          {
            name.splice(i, 1);
            i -= 1;
          } else if (part === '..')
          {
            // If at the start, or previous value is still ..,
            // keep them so that when converted to a path it may
            // still work when converted to a path, even though
            // as an ID it is less than ideal. In larger point
            // releases, may be better to just kick out an error.
            if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..')
            {
              continue;
            } else if (i > 0)
            {
              name.splice(i - 1, 2);
              i -= 2;
            }
          }
        }
        //end trimDots

        name = name.join('/');
      }

      //Apply map config if available.
      if ((baseParts || starMap) && map)
      {
        nameParts = name.split('/');

        for (i = nameParts.length; i > 0; i -= 1)
        {
          nameSegment = nameParts.slice(0, i).join("/");
          if (baseParts)
          {
            //Find the longest baseName segment match in the config.
            //So, do joins on the biggest to smallest lengths of baseParts.
            for (j = baseParts.length; j > 0; j -= 1)
            {
              mapValue = map[baseParts.slice(0, j).join('/')];

              //baseName segment has  config, find if it has one for
              //this name.
              if (mapValue)
              {
                mapValue = mapValue[nameSegment];
                if (mapValue)
                {
                  //Match, update name to the new value.
                  foundMap = mapValue;
                  foundI = i;
                  break;
                }
              }
            }
          }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("node_modules/almond/almond.js", function(){});

/*
    This program is distributed under the terms of the MIT license.
    Please see the LICENSE file for details.

    Copyright 2006-2008, OGG, LLC
*/
/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/* global define */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-polyfill',[], function () {
            return factory(root);
        });
    } else {
        // Browser globals
        return factory(root);
    }
}(this, function (root) {

/** Function: Function.prototype.bind
 *  Bind a function to an instance.
 *
 *  This Function object extension method creates a bound method similar
 *  to those in Python.  This means that the 'this' object will point
 *  to the instance you want.  See <MDC's bind() documentation at https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind>
 *  and <Bound Functions and Function Imports in JavaScript at http://benjamin.smedbergs.us/blog/2007-01-03/bound-functions-and-function-imports-in-javascript/>
 *  for a complete explanation.
 *
 *  This extension already exists in some browsers (namely, Firefox 3), but
 *  we provide it to support those that don't.
 *
 *  Parameters:
 *    (Object) obj - The object that will become 'this' in the bound function.
 *    (Object) argN - An option argument that will be prepended to the
 *      arguments given for the function call
 *
 *  Returns:
 *    The bound function.
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function (obj /*, arg1, arg2, ... */) {
        var func = this;
        var _slice = Array.prototype.slice;
        var _concat = Array.prototype.concat;
        var _args = _slice.call(arguments, 1);
        return function () {
            return func.apply(obj ? obj : this, _concat.call(_args, _slice.call(arguments, 0)));
        };
    };
}

/** Function: Array.isArray
 *  This is a polyfill for the ES5 Array.isArray method.
 */
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

/** Function: Array.prototype.indexOf
 *  Return the index of an object in an array.
 *
 *  This function is not supplied by some JavaScript implementations, so
 *  we provide it if it is missing.  This code is from:
 *  http://developer.mozilla.org/En/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
 *
 *  Parameters:
 *    (Object) elt - The object to look for.
 *    (Integer) from - The index from which to start looking. (optional).
 *
 *  Returns:
 *    The index of elt in the array or -1 if not found.
 */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += len;
        }

        for (; from < len; from++) {
            if (from in this && this[from] === elt) {
                return from;
            }
        }
        return -1;
    };
}

/** Function: Array.prototype.forEach
 *
 *  This function is not available in IE < 9
 *
 *  See <forEach on developer.mozilla.org at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach>
 */
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        var T, k;
        if (this === null) {
            throw new TypeError(' this is null or not defined');
        }
        // 1. Let O be the result of calling toObject() passing the
        // |this| value as the argument.
        var O = Object(this);
        // 2. Let lenValue be the result of calling the Get() internal
        // method of O with the argument "length".
        // 3. Let len be toUint32(lenValue).
        var len = O.length >>> 0;
        // 4. If isCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }
        // 5. If thisArg was supplied, let T be thisArg; else let
        // T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }
        // 6. Let k be 0
        k = 0;
        // 7. Repeat, while k < len
        while (k < len) {
            var kValue;
            // a. Let Pk be ToString(k).
            //        This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty
            //        internal method of O with argument Pk.
            //        This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {
                // i. Let kValue be the result of calling the Get internal
                // method of O with argument Pk.
                kValue = O[k];
                // ii. Call the Call internal method of callback with T as
                // the this value and argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com
var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
if (!root.btoa) {
    root.btoa = function (input) {
        /**
         * Encodes a string in base64
         * @param {String} input The string to encode in base64.
         */
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc2 = ((chr1 & 3) << 4);
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
        } while (i < input.length);
        return output;
    };
}

if (!root.atob) {
    root.atob = function (input) {
        /**
         * Decodes a base64 string.
         * @param {String} input The string to decode.
         */
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
        } while (i < input.length);
        return output;
    };
}
}));

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/* jshint undef: true, unused: true:, noarg: true, latedef: false */
/* global define */

/* Some functions and variables have been stripped for use with Strophe */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-sha1', [],function () {
            return factory();
        });
    } else {
        // Browser globals
        root.SHA1 = factory();
    }
}(this, function () {

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = new Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  var i, j, t, olda, oldb, oldc, oldd, olde;
  for (i = 0; i < x.length; i += 16)
  {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;
    olde = e;

    for (j = 0; j < 80; j++)
    {
      if (j < 16) { w[j] = x[i + j]; }
      else { w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1); }
      t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return [a, b, c, d, e];
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if (t < 20) { return (b & c) | ((~b) & d); }
  if (t < 40) { return b ^ c ^ d; }
  if (t < 60) { return (b & c) | (b & d) | (c & d); }
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if (bkey.length > 16) { bkey = core_sha1(bkey, key.length * 8); }

  var ipad = new Array(16), opad = new Array(16);
  for (var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * 8);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = [];
  var mask = 255;
  for (var i = 0; i < str.length * 8; i += 8)
  {
    bin[i>>5] |= (str.charCodeAt(i / 8) & mask) << (24 - i%32);
  }
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = 255;
  for (var i = 0; i < bin.length * 32; i += 8)
  {
    str += String.fromCharCode((bin[i>>5] >>> (24 - i%32)) & mask);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  var triplet, j;
  for (var i = 0; i < binarray.length * 4; i += 3)
  {
    triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16) |
              (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 ) |
               ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for (j = 0; j < 4; j++)
    {
      if (i * 8 + j * 6 > binarray.length * 32) { str += "="; }
      else { str += tab.charAt((triplet >> 6*(3-j)) & 0x3F); }
    }
  }
  return str;
}

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
return {
    b64_hmac_sha1:  function (key, data){ return binb2b64(core_hmac_sha1(key, data)); },
    b64_sha1:       function (s) { return binb2b64(core_sha1(str2binb(s),s.length * 8)); },
    binb2str:       binb2str,
    core_hmac_sha1: core_hmac_sha1,
    str_hmac_sha1:  function (key, data){ return binb2str(core_hmac_sha1(key, data)); },
    str_sha1:       function (s) { return binb2str(core_sha1(str2binb(s),s.length * 8)); },
};
}));

/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
/*
 * Everything that isn't used by Strophe has been stripped here!
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-md5',[], function () {
            return factory();
        });
    } else {
        // Browser globals
        root.MD5 = factory();
    }
}(this, function () {
    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    var safe_add = function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    var bit_rol = function (num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    };

    /*
     * Convert a string to an array of little-endian words
     */
    var str2binl = function (str) {
        var bin = [];
        for(var i = 0; i < str.length * 8; i += 8)
        {
            bin[i>>5] |= (str.charCodeAt(i / 8) & 255) << (i%32);
        }
        return bin;
    };

    /*
     * Convert an array of little-endian words to a string
     */
    var binl2str = function (bin) {
        var str = "";
        for(var i = 0; i < bin.length * 32; i += 8)
        {
            str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & 255);
        }
        return str;
    };

    /*
     * Convert an array of little-endian words to a hex string.
     */
    var binl2hex = function (binarray) {
        var hex_tab = "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++)
        {
            str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
                hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
        }
        return str;
    };

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    var md5_cmn = function (q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q),safe_add(x, t)), s),b);
    };

    var md5_ff = function (a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    };

    var md5_gg = function (a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    };

    var md5_hh = function (a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    };

    var md5_ii = function (a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    };

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length
     */
    var core_md5 = function (x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a =  1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d =  271733878;

        var olda, oldb, oldc, oldd;
        for (var i = 0; i < x.length; i += 16)
        {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
            d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
            d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
            d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
            d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
            d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
            c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
            d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
            c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
            d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
            c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
            d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
            c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
            d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
            d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
            d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
            d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
            d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
            d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
            d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
            d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    };

    var obj = {
        /*
         * These are the functions you'll usually want to call.
         * They take string arguments and return either hex or base-64 encoded
         * strings.
         */
        hexdigest: function (s) {
            return binl2hex(core_md5(str2binl(s), s.length * 8));
        },

        hash: function (s) {
            return binl2str(core_md5(str2binl(s), s.length * 8));
        }
    };
    return obj;
}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-utils',[], function () {
            return factory();
        });
    } else {
        // Browser globals
        root.stropheUtils = factory();
    }
}(this, function () {

    var utils = {

        utf16to8: function (str) {
            var i, c;
            var out = "";
            var len = str.length;
            for (i = 0; i < len; i++) {
                c = str.charCodeAt(i);
                if ((c >= 0x0000) && (c <= 0x007F)) {
                    out += str.charAt(i);
                } else if (c > 0x07FF) {
                    out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                    out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
                    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
                } else {
                    out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
                    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
                }
            }
            return out;
        },

        addCookies: function (cookies) {
            /* Parameters:
             *  (Object) cookies - either a map of cookie names
             *    to string values or to maps of cookie values.
             *
             * For example:
             * { "myCookie": "1234" }
             *
             * or:
             * { "myCookie": {
             *      "value": "1234",
             *      "domain": ".example.org",
             *      "path": "/",
             *      "expires": expirationDate
             *      }
             *  }
             *
             *  These values get passed to Strophe.Connection via
             *   options.cookies
             */
            var cookieName, cookieObj, isObj, cookieValue, expires, domain, path;
            for (cookieName in (cookies || {})) {
                expires = '';
                domain = '';
                path = '';
                cookieObj = cookies[cookieName];
                isObj = typeof cookieObj === "object";
                cookieValue = escape(unescape(isObj ? cookieObj.value : cookieObj));
                if (isObj) {
                    expires = cookieObj.expires ? ";expires="+cookieObj.expires : '';
                    domain = cookieObj.domain ? ";domain="+cookieObj.domain : '';
                    path = cookieObj.path ? ";path="+cookieObj.path : '';
                }
                document.cookie =
                    cookieName+'='+cookieValue + expires + domain + path;
            }
        }
    };
    return utils;
}));

/*
    This program is distributed under the terms of the MIT license.
    Please see the LICENSE file for details.

    Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/*global define, document, sessionStorage, setTimeout, clearTimeout, ActiveXObject, DOMParser, btoa, atob */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-core',[
            'strophe-sha1',
            'strophe-md5',
            'strophe-utils'
        ], function () {
            return factory.apply(this, arguments);
        });
    } else {
        // Browser globals
        var o = factory(root.SHA1, root.MD5, root.stropheUtils);
        root.Strophe =        o.Strophe;
        root.$build =         o.$build;
        root.$iq =            o.$iq;
        root.$msg =           o.$msg;
        root.$pres =          o.$pres;
        root.SHA1 =           o.SHA1;
        root.MD5 =            o.MD5;
        root.b64_hmac_sha1 =  o.SHA1.b64_hmac_sha1;
        root.b64_sha1 =       o.SHA1.b64_sha1;
        root.str_hmac_sha1 =  o.SHA1.str_hmac_sha1;
        root.str_sha1 =       o.SHA1.str_sha1;
    }
}(this, function (SHA1, MD5, utils) {

var Strophe;

/** Function: $build
 *  Create a Strophe.Builder.
 *  This is an alias for 'new Strophe.Builder(name, attrs)'.
 *
 *  Parameters:
 *    (String) name - The root element name.
 *    (Object) attrs - The attributes for the root element in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $build(name, attrs) { return new Strophe.Builder(name, attrs); }

/** Function: $msg
 *  Create a Strophe.Builder with a <message/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <message/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $msg(attrs) { return new Strophe.Builder("message", attrs); }

/** Function: $iq
 *  Create a Strophe.Builder with an <iq/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <iq/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $iq(attrs) { return new Strophe.Builder("iq", attrs); }

/** Function: $pres
 *  Create a Strophe.Builder with a <presence/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <presence/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $pres(attrs) { return new Strophe.Builder("presence", attrs); }

/** Class: Strophe
 *  An object container for all Strophe library functions.
 *
 *  This class is just a container for all the objects and constants
 *  used in the library.  It is not meant to be instantiated, but to
 *  provide a namespace for library objects, constants, and functions.
 */
Strophe = {
    /** Constant: VERSION */
    VERSION: "1.2.14",

    /** Constants: XMPP Namespace Constants
     *  Common namespace constants from the XMPP RFCs and XEPs.
     *
     *  NS.HTTPBIND - HTTP BIND namespace from XEP 124.
     *  NS.BOSH - BOSH namespace from XEP 206.
     *  NS.CLIENT - Main XMPP client namespace.
     *  NS.AUTH - Legacy authentication namespace.
     *  NS.ROSTER - Roster operations namespace.
     *  NS.PROFILE - Profile namespace.
     *  NS.DISCO_INFO - Service discovery info namespace from XEP 30.
     *  NS.DISCO_ITEMS - Service discovery items namespace from XEP 30.
     *  NS.MUC - Multi-User Chat namespace from XEP 45.
     *  NS.SASL - XMPP SASL namespace from RFC 3920.
     *  NS.STREAM - XMPP Streams namespace from RFC 3920.
     *  NS.BIND - XMPP Binding namespace from RFC 3920.
     *  NS.SESSION - XMPP Session namespace from RFC 3920.
     *  NS.XHTML_IM - XHTML-IM namespace from XEP 71.
     *  NS.XHTML - XHTML body namespace from XEP 71.
     */
    NS: {
        HTTPBIND: "http://jabber.org/protocol/httpbind",
        BOSH: "urn:xmpp:xbosh",
        CLIENT: "jabber:client",
        AUTH: "jabber:iq:auth",
        ROSTER: "jabber:iq:roster",
        PROFILE: "jabber:iq:profile",
        DISCO_INFO: "http://jabber.org/protocol/disco#info",
        DISCO_ITEMS: "http://jabber.org/protocol/disco#items",
        MUC: "http://jabber.org/protocol/muc",
        SASL: "urn:ietf:params:xml:ns:xmpp-sasl",
        STREAM: "http://etherx.jabber.org/streams",
        FRAMING: "urn:ietf:params:xml:ns:xmpp-framing",
        BIND: "urn:ietf:params:xml:ns:xmpp-bind",
        SESSION: "urn:ietf:params:xml:ns:xmpp-session",
        VERSION: "jabber:iq:version",
        STANZAS: "urn:ietf:params:xml:ns:xmpp-stanzas",
        XHTML_IM: "http://jabber.org/protocol/xhtml-im",
        XHTML: "http://www.w3.org/1999/xhtml"
    },

    /** Constants: XHTML_IM Namespace
     *  contains allowed tags, tag attributes, and css properties.
     *  Used in the createHtml function to filter incoming html into the allowed XHTML-IM subset.
     *  See http://xmpp.org/extensions/xep-0071.html#profile-summary for the list of recommended
     *  allowed tags and their attributes.
     */
    XHTML: {
        tags: ['a','blockquote','br','cite','em','img','li','ol','p','span','strong','ul','body'],
        attributes: {
            'a':          ['href'],
            'blockquote': ['style'],
            'br':         [],
            'cite':       ['style'],
            'em':         [],
            'img':        ['src', 'alt', 'style', 'height', 'width'],
            'li':         ['style'],
            'ol':         ['style'],
            'p':          ['style'],
            'span':       ['style'],
            'strong':     [],
            'ul':         ['style'],
            'body':       []
        },
        css: ['background-color','color','font-family','font-size','font-style','font-weight','margin-left','margin-right','text-align','text-decoration'],
        /** Function: XHTML.validTag
         *
         * Utility method to determine whether a tag is allowed
         * in the XHTML_IM namespace.
         *
         * XHTML tag names are case sensitive and must be lower case.
         */
        validTag: function(tag) {
            for (var i = 0; i < Strophe.XHTML.tags.length; i++) {
                if (tag === Strophe.XHTML.tags[i]) {
                    return true;
                }
            }
            return false;
        },
        /** Function: XHTML.validAttribute
         *
         * Utility method to determine whether an attribute is allowed
         * as recommended per XEP-0071
         *
         * XHTML attribute names are case sensitive and must be lower case.
         */
        validAttribute: function(tag, attribute) {
            if (typeof Strophe.XHTML.attributes[tag] !== 'undefined' && Strophe.XHTML.attributes[tag].length > 0) {
                for (var i = 0; i < Strophe.XHTML.attributes[tag].length; i++) {
                    if (attribute === Strophe.XHTML.attributes[tag][i]) {
                        return true;
                    }
                }
            }
        return false;
        },
        validCSS: function(style) {
            for (var i = 0; i < Strophe.XHTML.css.length; i++) {
                if (style === Strophe.XHTML.css[i]) {
                    return true;
                }
            }
            return false;
        }
    },

    /** Constants: Connection Status Constants
     *  Connection status constants for use by the connection handler
     *  callback.
     *
     *  Status.ERROR - An error has occurred
     *  Status.CONNECTING - The connection is currently being made
     *  Status.CONNFAIL - The connection attempt failed
     *  Status.AUTHENTICATING - The connection is authenticating
     *  Status.AUTHFAIL - The authentication attempt failed
     *  Status.CONNECTED - The connection has succeeded
     *  Status.DISCONNECTED - The connection has been terminated
     *  Status.DISCONNECTING - The connection is currently being terminated
     *  Status.ATTACHED - The connection has been attached
     *  Status.REDIRECT - The connection has been redirected
     *  Status.CONNTIMEOUT - The connection has timed out
     */
    Status: {
        ERROR: 0,
        CONNECTING: 1,
        CONNFAIL: 2,
        AUTHENTICATING: 3,
        AUTHFAIL: 4,
        CONNECTED: 5,
        DISCONNECTED: 6,
        DISCONNECTING: 7,
        ATTACHED: 8,
        REDIRECT: 9,
        CONNTIMEOUT: 10
    },

    /** Constants: Log Level Constants
     *  Logging level indicators.
     *
     *  LogLevel.DEBUG - Debug output
     *  LogLevel.INFO - Informational output
     *  LogLevel.WARN - Warnings
     *  LogLevel.ERROR - Errors
     *  LogLevel.FATAL - Fatal errors
     */
    LogLevel: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4
    },

    /** PrivateConstants: DOM Element Type Constants
     *  DOM element types.
     *
     *  ElementType.NORMAL - Normal element.
     *  ElementType.TEXT - Text data element.
     *  ElementType.FRAGMENT - XHTML fragment element.
     */
    ElementType: {
        NORMAL: 1,
        TEXT: 3,
        CDATA: 4,
        FRAGMENT: 11
    },

    /** PrivateConstants: Timeout Values
     *  Timeout values for error states.  These values are in seconds.
     *  These should not be changed unless you know exactly what you are
     *  doing.
     *
     *  TIMEOUT - Timeout multiplier. A waiting request will be considered
     *      failed after Math.floor(TIMEOUT * wait) seconds have elapsed.
     *      This defaults to 1.1, and with default wait, 66 seconds.
     *  SECONDARY_TIMEOUT - Secondary timeout multiplier. In cases where
     *      Strophe can detect early failure, it will consider the request
     *      failed if it doesn't return after
     *      Math.floor(SECONDARY_TIMEOUT * wait) seconds have elapsed.
     *      This defaults to 0.1, and with default wait, 6 seconds.
     */
    TIMEOUT: 1.1,
    SECONDARY_TIMEOUT: 0.1,

    /** Function: addNamespace
     *  This function is used to extend the current namespaces in
     *  Strophe.NS.  It takes a key and a value with the key being the
     *  name of the new namespace, with its actual value.
     *  For example:
     *  Strophe.addNamespace('PUBSUB', "http://jabber.org/protocol/pubsub");
     *
     *  Parameters:
     *    (String) name - The name under which the namespace will be
     *      referenced under Strophe.NS
     *    (String) value - The actual namespace.
     */
    addNamespace: function (name, value) {
        Strophe.NS[name] = value;
    },

    /** Function: forEachChild
     *  Map a function over some or all child elements of a given element.
     *
     *  This is a small convenience function for mapping a function over
     *  some or all of the children of an element.  If elemName is null, all
     *  children will be passed to the function, otherwise only children
     *  whose tag names match elemName will be passed.
     *
     *  Parameters:
     *    (XMLElement) elem - The element to operate on.
     *    (String) elemName - The child element tag name filter.
     *    (Function) func - The function to apply to each child.  This
     *      function should take a single argument, a DOM element.
     */
    forEachChild: function (elem, elemName, func) {
        var i, childNode;
        for (i = 0; i < elem.childNodes.length; i++) {
            childNode = elem.childNodes[i];
            if (childNode.nodeType === Strophe.ElementType.NORMAL &&
                (!elemName || this.isTagEqual(childNode, elemName))) {
                func(childNode);
            }
        }
    },

    /** Function: isTagEqual
     *  Compare an element's tag name with a string.
     *
     *  This function is case sensitive.
     *
     *  Parameters:
     *    (XMLElement) el - A DOM element.
     *    (String) name - The element name.
     *
     *  Returns:
     *    true if the element's tag name matches _el_, and false
     *    otherwise.
     */
    isTagEqual: function (el, name) {
        return el.tagName === name;
    },

    /** PrivateVariable: _xmlGenerator
     *  _Private_ variable that caches a DOM document to
     *  generate elements.
     */
    _xmlGenerator: null,

    /** PrivateFunction: _makeGenerator
     *  _Private_ function that creates a dummy XML DOM document to serve as
     *  an element and text node generator.
     */
    _makeGenerator: function () {
        var doc;
        // IE9 does implement createDocument(); however, using it will cause the browser to leak memory on page unload.
        // Here, we test for presence of createDocument() plus IE's proprietary documentMode attribute, which would be
                // less than 10 in the case of IE9 and below.
        if (document.implementation.createDocument === undefined ||
                        document.implementation.createDocument && document.documentMode && document.documentMode < 10) {
            doc = this._getIEXmlDom();
            doc.appendChild(doc.createElement('strophe'));
        } else {
            doc = document.implementation
                .createDocument('jabber:client', 'strophe', null);
        }
        return doc;
    },

    /** Function: xmlGenerator
     *  Get the DOM document to generate elements.
     *
     *  Returns:
     *    The currently used DOM document.
     */
    xmlGenerator: function () {
        if (!Strophe._xmlGenerator) {
            Strophe._xmlGenerator = Strophe._makeGenerator();
        }
        return Strophe._xmlGenerator;
    },

    /** PrivateFunction: _getIEXmlDom
     *  Gets IE xml doc object
     *
     *  Returns:
     *    A Microsoft XML DOM Object
     *  See Also:
     *    http://msdn.microsoft.com/en-us/library/ms757837%28VS.85%29.aspx
     */
    _getIEXmlDom : function() {
        var doc = null;
        var docStrings = [
            "Msxml2.DOMDocument.6.0",
            "Msxml2.DOMDocument.5.0",
            "Msxml2.DOMDocument.4.0",
            "MSXML2.DOMDocument.3.0",
            "MSXML2.DOMDocument",
            "MSXML.DOMDocument",
            "Microsoft.XMLDOM"
        ];

        for (var d = 0; d < docStrings.length; d++) {
            if (doc === null) {
                try {
                    doc = new ActiveXObject(docStrings[d]);
                } catch (e) {
                    doc = null;
                }
            } else {
                break;
            }
        }
        return doc;
    },

    /** Function: xmlElement
     *  Create an XML DOM element.
     *
     *  This function creates an XML DOM element correctly across all
     *  implementations. Note that these are not HTML DOM elements, which
     *  aren't appropriate for XMPP stanzas.
     *
     *  Parameters:
     *    (String) name - The name for the element.
     *    (Array|Object) attrs - An optional array or object containing
     *      key/value pairs to use as element attributes. The object should
     *      be in the format {'key': 'value'} or {key: 'value'}. The array
     *      should have the format [['key1', 'value1'], ['key2', 'value2']].
     *    (String) text - The text child data for the element.
     *
     *  Returns:
     *    A new XML DOM element.
     */
    xmlElement: function (name) {
        if (!name) { return null; }

        var node = Strophe.xmlGenerator().createElement(name);
        // FIXME: this should throw errors if args are the wrong type or
        // there are more than two optional args
        var a, i, k;
        for (a = 1; a < arguments.length; a++) {
            var arg = arguments[a];
            if (!arg) { continue; }
            if (typeof(arg) === "string" ||
                typeof(arg) === "number") {
                node.appendChild(Strophe.xmlTextNode(arg));
            } else if (typeof(arg) === "object" &&
                       typeof(arg.sort) === "function") {
                for (i = 0; i < arg.length; i++) {
                    var attr = arg[i];
                    if (typeof(attr) === "object" &&
                        typeof(attr.sort) === "function" &&
                        attr[1] !== undefined &&
                        attr[1] !== null) {
                        node.setAttribute(attr[0], attr[1]);
                    }
                }
            } else if (typeof(arg) === "object") {
                for (k in arg) {
                    if (arg.hasOwnProperty(k)) {
                        if (arg[k] !== undefined &&
                            arg[k] !== null) {
                            node.setAttribute(k, arg[k]);
                        }
                    }
                }
            }
        }

        return node;
    },

    /*  Function: xmlescape
     *  Excapes invalid xml characters.
     *
     *  Parameters:
     *     (String) text - text to escape.
     *
     *  Returns:
     *      Escaped text.
     */
    xmlescape: function(text) {
        text = text.replace(/\&/g, "&amp;");
        text = text.replace(/</g,  "&lt;");
        text = text.replace(/>/g,  "&gt;");
        text = text.replace(/'/g,  "&apos;");
        text = text.replace(/"/g,  "&quot;");
        return text;
    },

    /*  Function: xmlunescape
    *  Unexcapes invalid xml characters.
    *
    *  Parameters:
    *     (String) text - text to unescape.
    *
    *  Returns:
    *      Unescaped text.
    */
    xmlunescape: function(text) {
        text = text.replace(/\&amp;/g, "&");
        text = text.replace(/&lt;/g,  "<");
        text = text.replace(/&gt;/g,  ">");
        text = text.replace(/&apos;/g,  "'");
        text = text.replace(/&quot;/g,  "\"");
        return text;
    },

    /** Function: xmlTextNode
     *  Creates an XML DOM text node.
     *
     *  Provides a cross implementation version of document.createTextNode.
     *
     *  Parameters:
     *    (String) text - The content of the text node.
     *
     *  Returns:
     *    A new XML DOM text node.
     */
    xmlTextNode: function (text) {
        return Strophe.xmlGenerator().createTextNode(text);
    },

    /** Function: xmlHtmlNode
     *  Creates an XML DOM html node.
     *
     *  Parameters:
     *    (String) html - The content of the html node.
     *
     *  Returns:
     *    A new XML DOM text node.
     */
    xmlHtmlNode: function (html) {
        var node;
        //ensure text is escaped
        if (DOMParser) {
            var parser = new DOMParser();
            node = parser.parseFromString(html, "text/xml");
        } else {
            node = new ActiveXObject("Microsoft.XMLDOM");
            node.async="false";
            node.loadXML(html);
        }
        return node;
    },

    /** Function: getText
     *  Get the concatenation of all text children of an element.
     *
     *  Parameters:
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    A String with the concatenated text of all text element children.
     */
    getText: function (elem) {
        if (!elem) { return null; }

        var str = "";
        if (elem.childNodes.length === 0 && elem.nodeType === Strophe.ElementType.TEXT) {
            str += elem.nodeValue;
        }

        for (var i = 0; i < elem.childNodes.length; i++) {
            if (elem.childNodes[i].nodeType === Strophe.ElementType.TEXT) {
                str += elem.childNodes[i].nodeValue;
            }
        }

        return Strophe.xmlescape(str);
    },

    /** Function: copyElement
     *  Copy an XML DOM element.
     *
     *  This function copies a DOM element and all its descendants and returns
     *  the new copy.
     *
     *  Parameters:
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    A new, copied DOM element tree.
     */
    copyElement: function (elem) {
        var i, el;
        if (elem.nodeType === Strophe.ElementType.NORMAL) {
            el = Strophe.xmlElement(elem.tagName);

            for (i = 0; i < elem.attributes.length; i++) {
                el.setAttribute(elem.attributes[i].nodeName,
                                elem.attributes[i].value);
            }

            for (i = 0; i < elem.childNodes.length; i++) {
                el.appendChild(Strophe.copyElement(elem.childNodes[i]));
            }
        } else if (elem.nodeType === Strophe.ElementType.TEXT) {
            el = Strophe.xmlGenerator().createTextNode(elem.nodeValue);
        }
        return el;
    },


    /** Function: createHtml
     *  Copy an HTML DOM element into an XML DOM.
     *
     *  This function copies a DOM element and all its descendants and returns
     *  the new copy.
     *
     *  Parameters:
     *    (HTMLElement) elem - A DOM element.
     *
     *  Returns:
     *    A new, copied DOM element tree.
     */
    createHtml: function (elem) {
        var i, el, j, tag, attribute, value, css, cssAttrs, attr, cssName, cssValue;
        if (elem.nodeType === Strophe.ElementType.NORMAL) {
            tag = elem.nodeName.toLowerCase(); // XHTML tags must be lower case.
            if(Strophe.XHTML.validTag(tag)) {
                try {
                    el = Strophe.xmlElement(tag);
                    for(i = 0; i < Strophe.XHTML.attributes[tag].length; i++) {
                        attribute = Strophe.XHTML.attributes[tag][i];
                        value = elem.getAttribute(attribute);
                        if(typeof value === 'undefined' || value === null || value === '' || value === false || value === 0) {
                            continue;
                        }
                        if(attribute === 'style' && typeof value === 'object') {
                            if(typeof value.cssText !== 'undefined') {
                                value = value.cssText; // we're dealing with IE, need to get CSS out
                            }
                        }
                        // filter out invalid css styles
                        if(attribute === 'style') {
                            css = [];
                            cssAttrs = value.split(';');
                            for(j = 0; j < cssAttrs.length; j++) {
                                attr = cssAttrs[j].split(':');
                                cssName = attr[0].replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
                                if(Strophe.XHTML.validCSS(cssName)) {
                                    cssValue = attr[1].replace(/^\s*/, "").replace(/\s*$/, "");
                                    css.push(cssName + ': ' + cssValue);
                                }
                            }
                            if(css.length > 0) {
                                value = css.join('; ');
                                el.setAttribute(attribute, value);
                            }
                        } else {
                            el.setAttribute(attribute, value);
                        }
                    }

                    for (i = 0; i < elem.childNodes.length; i++) {
                        el.appendChild(Strophe.createHtml(elem.childNodes[i]));
                    }
                } catch(e) { // invalid elements
                  el = Strophe.xmlTextNode('');
                }
            } else {
                el = Strophe.xmlGenerator().createDocumentFragment();
                for (i = 0; i < elem.childNodes.length; i++) {
                    el.appendChild(Strophe.createHtml(elem.childNodes[i]));
                }
            }
        } else if (elem.nodeType === Strophe.ElementType.FRAGMENT) {
            el = Strophe.xmlGenerator().createDocumentFragment();
            for (i = 0; i < elem.childNodes.length; i++) {
                el.appendChild(Strophe.createHtml(elem.childNodes[i]));
            }
        } else if (elem.nodeType === Strophe.ElementType.TEXT) {
            el = Strophe.xmlTextNode(elem.nodeValue);
        }
        return el;
    },

    /** Function: escapeNode
     *  Escape the node part (also called local part) of a JID.
     *
     *  Parameters:
     *    (String) node - A node (or local part).
     *
     *  Returns:
     *    An escaped node (or local part).
     */
    escapeNode: function (node) {
        if (typeof node !== "string") { return node; }
        return node.replace(/^\s+|\s+$/g, '')
            .replace(/\\/g,  "\\5c")
            .replace(/ /g,   "\\20")
            .replace(/\"/g,  "\\22")
            .replace(/\&/g,  "\\26")
            .replace(/\'/g,  "\\27")
            .replace(/\//g,  "\\2f")
            .replace(/:/g,   "\\3a")
            .replace(/</g,   "\\3c")
            .replace(/>/g,   "\\3e")
            .replace(/@/g,   "\\40");
    },

    /** Function: unescapeNode
     *  Unescape a node part (also called local part) of a JID.
     *
     *  Parameters:
     *    (String) node - A node (or local part).
     *
     *  Returns:
     *    An unescaped node (or local part).
     */
    unescapeNode: function (node) {
        if (typeof node !== "string") { return node; }
        return node.replace(/\\20/g, " ")
            .replace(/\\22/g, '"')
            .replace(/\\26/g, "&")
            .replace(/\\27/g, "'")
            .replace(/\\2f/g, "/")
            .replace(/\\3a/g, ":")
            .replace(/\\3c/g, "<")
            .replace(/\\3e/g, ">")
            .replace(/\\40/g, "@")
            .replace(/\\5c/g, "\\");
    },

    /** Function: getNodeFromJid
     *  Get the node portion of a JID String.
     *
     *  Parameters:
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the node.
     */
    getNodeFromJid: function (jid) {
        if (jid.indexOf("@") < 0) { return null; }
        return jid.split("@")[0];
    },

    /** Function: getDomainFromJid
     *  Get the domain portion of a JID String.
     *
     *  Parameters:
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the domain.
     */
    getDomainFromJid: function (jid) {
        var bare = Strophe.getBareJidFromJid(jid);
        if (bare.indexOf("@") < 0) {
            return bare;
        } else {
            var parts = bare.split("@");
            parts.splice(0, 1);
            return parts.join('@');
        }
    },

    /** Function: getResourceFromJid
     *  Get the resource portion of a JID String.
     *
     *  Parameters:
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the resource.
     */
    getResourceFromJid: function (jid) {
        var s = jid.split("/");
        if (s.length < 2) { return null; }
        s.splice(0, 1);
        return s.join('/');
    },

    /** Function: getBareJidFromJid
     *  Get the bare JID from a JID String.
     *
     *  Parameters:
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the bare JID.
     */
    getBareJidFromJid: function (jid) {
        return jid ? jid.split("/")[0] : null;
    },

    /** PrivateFunction: _handleError
     *  _Private_ function that properly logs an error to the console
     */
    _handleError: function (e) {
        if (typeof e.stack !== "undefined") {
            Strophe.fatal(e.stack);
        }
        if (e.sourceURL) {
            Strophe.fatal("error: " + this.handler + " " + e.sourceURL + ":" +
                          e.line + " - " + e.name + ": " + e.message);
        } else if (e.fileName) {
            Strophe.fatal("error: " + this.handler + " " +
                          e.fileName + ":" + e.lineNumber + " - " +
                          e.name + ": " + e.message);
        } else {
            Strophe.fatal("error: " + e.message);
        }
    },

    /** Function: log
     *  User overrideable logging function.
     *
     *  This function is called whenever the Strophe library calls any
     *  of the logging functions.  The default implementation of this
     *  function does nothing.  If client code wishes to handle the logging
     *  messages, it should override this with
     *  > Strophe.log = function (level, msg) {
     *  >   (user code here)
     *  > };
     *
     *  Please note that data sent and received over the wire is logged
     *  via Strophe.Connection.rawInput() and Strophe.Connection.rawOutput().
     *
     *  The different levels and their meanings are
     *
     *    DEBUG - Messages useful for debugging purposes.
     *    INFO - Informational messages.  This is mostly information like
     *      'disconnect was called' or 'SASL auth succeeded'.
     *    WARN - Warnings about potential problems.  This is mostly used
     *      to report transient connection errors like request timeouts.
     *    ERROR - Some error occurred.
     *    FATAL - A non-recoverable fatal error occurred.
     *
     *  Parameters:
     *    (Integer) level - The log level of the log message.  This will
     *      be one of the values in Strophe.LogLevel.
     *    (String) msg - The log message.
     */
    /* jshint ignore:start */
    log: function (level, msg) {
        return;
    },
    /* jshint ignore:end */

    /** Function: debug
     *  Log a message at the Strophe.LogLevel.DEBUG level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    debug: function(msg) {
        this.log(this.LogLevel.DEBUG, msg);
    },

    /** Function: info
     *  Log a message at the Strophe.LogLevel.INFO level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    info: function (msg) {
        this.log(this.LogLevel.INFO, msg);
    },

    /** Function: warn
     *  Log a message at the Strophe.LogLevel.WARN level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    warn: function (msg) {
        this.log(this.LogLevel.WARN, msg);
    },

    /** Function: error
     *  Log a message at the Strophe.LogLevel.ERROR level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    error: function (msg) {
        this.log(this.LogLevel.ERROR, msg);
    },

    /** Function: fatal
     *  Log a message at the Strophe.LogLevel.FATAL level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    fatal: function (msg) {
        this.log(this.LogLevel.FATAL, msg);
    },

    /** Function: serialize
     *  Render a DOM element and all descendants to a String.
     *
     *  Parameters:
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    The serialized element tree as a String.
     */
    serialize: function (elem) {
        var result;

        if (!elem) { return null; }

        if (typeof(elem.tree) === "function") {
            elem = elem.tree();
        }

        var nodeName = elem.nodeName;
        var i, child;

        if (elem.getAttribute("_realname")) {
            nodeName = elem.getAttribute("_realname");
        }

        result = "<" + nodeName;
        for (i = 0; i < elem.attributes.length; i++) {
             if(elem.attributes[i].nodeName !== "_realname") {
               result += " " + elem.attributes[i].nodeName +
                   "='" + Strophe.xmlescape(elem.attributes[i].value) + "'";
             }
        }

        if (elem.childNodes.length > 0) {
            result += ">";
            for (i = 0; i < elem.childNodes.length; i++) {
                child = elem.childNodes[i];
                switch( child.nodeType ){
                  case Strophe.ElementType.NORMAL:
                    // normal element, so recurse
                    result += Strophe.serialize(child);
                    break;
                  case Strophe.ElementType.TEXT:
                    // text element to escape values
                    result += Strophe.xmlescape(child.nodeValue);
                    break;
                  case Strophe.ElementType.CDATA:
                    // cdata section so don't escape values
                    result += "<![CDATA["+child.nodeValue+"]]>";
                }
            }
            result += "</" + nodeName + ">";
        } else {
            result += "/>";
        }

        return result;
    },

    /** PrivateVariable: _requestId
     *  _Private_ variable that keeps track of the request ids for
     *  connections.
     */
    _requestId: 0,

    /** PrivateVariable: Strophe.connectionPlugins
     *  _Private_ variable Used to store plugin names that need
     *  initialization on Strophe.Connection construction.
     */
    _connectionPlugins: {},

    /** Function: addConnectionPlugin
     *  Extends the Strophe.Connection object with the given plugin.
     *
     *  Parameters:
     *    (String) name - The name of the extension.
     *    (Object) ptype - The plugin's prototype.
     */
    addConnectionPlugin: function (name, ptype) {
        Strophe._connectionPlugins[name] = ptype;
    }
};

/** Class: Strophe.Builder
 *  XML DOM builder.
 *
 *  This object provides an interface similar to JQuery but for building
 *  DOM elements easily and rapidly.  All the functions except for toString()
 *  and tree() return the object, so calls can be chained.  Here's an
 *  example using the $iq() builder helper.
 *  > $iq({to: 'you', from: 'me', type: 'get', id: '1'})
 *  >     .c('query', {xmlns: 'strophe:example'})
 *  >     .c('example')
 *  >     .toString()
 *
 *  The above generates this XML fragment
 *  > <iq to='you' from='me' type='get' id='1'>
 *  >   <query xmlns='strophe:example'>
 *  >     <example/>
 *  >   </query>
 *  > </iq>
 *  The corresponding DOM manipulations to get a similar fragment would be
 *  a lot more tedious and probably involve several helper variables.
 *
 *  Since adding children makes new operations operate on the child, up()
 *  is provided to traverse up the tree.  To add two children, do
 *  > builder.c('child1', ...).up().c('child2', ...)
 *  The next operation on the Builder will be relative to the second child.
 */

/** Constructor: Strophe.Builder
 *  Create a Strophe.Builder object.
 *
 *  The attributes should be passed in object notation.  For example
 *  > var b = new Builder('message', {to: 'you', from: 'me'});
 *  or
 *  > var b = new Builder('messsage', {'xml:lang': 'en'});
 *
 *  Parameters:
 *    (String) name - The name of the root element.
 *    (Object) attrs - The attributes for the root element in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder.
 */
Strophe.Builder = function (name, attrs) {
    // Set correct namespace for jabber:client elements
    if (name === "presence" || name === "message" || name === "iq") {
        if (attrs && !attrs.xmlns) {
            attrs.xmlns = Strophe.NS.CLIENT;
        } else if (!attrs) {
            attrs = {xmlns: Strophe.NS.CLIENT};
        }
    }

    // Holds the tree being built.
    this.nodeTree = Strophe.xmlElement(name, attrs);

    // Points to the current operation node.
    this.node = this.nodeTree;
};

Strophe.Builder.prototype = {
    /** Function: tree
     *  Return the DOM tree.
     *
     *  This function returns the current DOM tree as an element object.  This
     *  is suitable for passing to functions like Strophe.Connection.send().
     *
     *  Returns:
     *    The DOM tree as a element object.
     */
    tree: function () {
        return this.nodeTree;
    },

    /** Function: toString
     *  Serialize the DOM tree to a String.
     *
     *  This function returns a string serialization of the current DOM
     *  tree.  It is often used internally to pass data to a
     *  Strophe.Request object.
     *
     *  Returns:
     *    The serialized DOM tree in a String.
     */
    toString: function () {
        return Strophe.serialize(this.nodeTree);
    },

    /** Function: up
     *  Make the current parent element the new current element.
     *
     *  This function is often used after c() to traverse back up the tree.
     *  For example, to add two children to the same element
     *  > builder.c('child1', {}).up().c('child2', {});
     *
     *  Returns:
     *    The Stophe.Builder object.
     */
    up: function () {
        this.node = this.node.parentNode;
        return this;
    },

    /** Function: root
     *  Make the root element the new current element.
     *
     *  When at a deeply nested element in the tree, this function can be used
     *  to jump back to the root of the tree, instead of having to repeatedly
     *  call up().
     *
     *  Returns:
     *    The Stophe.Builder object.
     */
    root: function () {
        this.node = this.nodeTree;
        return this;
    },

    /** Function: attrs
     *  Add or modify attributes of the current element.
     *
     *  The attributes should be passed in object notation.  This function
     *  does not move the current element pointer.
     *
     *  Parameters:
     *    (Object) moreattrs - The attributes to add/modify in object notation.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    attrs: function (moreattrs) {
        for (var k in moreattrs) {
            if (moreattrs.hasOwnProperty(k)) {
                if (moreattrs[k] === undefined) {
                    this.node.removeAttribute(k);
                } else {
                    this.node.setAttribute(k, moreattrs[k]);
                }
            }
        }
        return this;
    },

    /** Function: c
     *  Add a child to the current element and make it the new current
     *  element.
     *
     *  This function moves the current element pointer to the child,
     *  unless text is provided.  If you need to add another child, it
     *  is necessary to use up() to go back to the parent in the tree.
     *
     *  Parameters:
     *    (String) name - The name of the child.
     *    (Object) attrs - The attributes of the child in object notation.
     *    (String) text - The text to add to the child.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    c: function (name, attrs, text) {
        var child = Strophe.xmlElement(name, attrs, text);
        this.node.appendChild(child);
        if (typeof text !== "string" && typeof text !=="number") {
            this.node = child;
        }
        return this;
    },

    /** Function: cnode
     *  Add a child to the current element and make it the new current
     *  element.
     *
     *  This function is the same as c() except that instead of using a
     *  name and an attributes object to create the child it uses an
     *  existing DOM element object.
     *
     *  Parameters:
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    cnode: function (elem) {
        var impNode;
        var xmlGen = Strophe.xmlGenerator();
        try {
            impNode = (xmlGen.importNode !== undefined);
        } catch (e) {
            impNode = false;
        }
        var newElem = impNode ?
                      xmlGen.importNode(elem, true) :
                      Strophe.copyElement(elem);
        this.node.appendChild(newElem);
        this.node = newElem;
        return this;
    },

    /** Function: t
     *  Add a child text element.
     *
     *  This *does not* make the child the new current element since there
     *  are no children of text elements.
     *
     *  Parameters:
     *    (String) text - The text data to append to the current element.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    t: function (text) {
        var child = Strophe.xmlTextNode(text);
        this.node.appendChild(child);
        return this;
    },

    /** Function: h
     *  Replace current element contents with the HTML passed in.
     *
     *  This *does not* make the child the new current element
     *
     *  Parameters:
     *    (String) html - The html to insert as contents of current element.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    h: function (html) {
        var fragment = document.createElement('body');

        // force the browser to try and fix any invalid HTML tags
        fragment.innerHTML = html;

        // copy cleaned html into an xml dom
        var xhtml = Strophe.createHtml(fragment);

        while(xhtml.childNodes.length > 0) {
            this.node.appendChild(xhtml.childNodes[0]);
        }
        return this;
    }
};

/** PrivateClass: Strophe.Handler
 *  _Private_ helper class for managing stanza handlers.
 *
 *  A Strophe.Handler encapsulates a user provided callback function to be
 *  executed when matching stanzas are received by the connection.
 *  Handlers can be either one-off or persistant depending on their
 *  return value. Returning true will cause a Handler to remain active, and
 *  returning false will remove the Handler.
 *
 *  Users will not use Strophe.Handler objects directly, but instead they
 *  will use Strophe.Connection.addHandler() and
 *  Strophe.Connection.deleteHandler().
 */

/** PrivateConstructor: Strophe.Handler
 *  Create and initialize a new Strophe.Handler.
 *
 *  Parameters:
 *    (Function) handler - A function to be executed when the handler is run.
 *    (String) ns - The namespace to match.
 *    (String) name - The element name to match.
 *    (String) type - The element type to match.
 *    (String) id - The element id attribute to match.
 *    (String) from - The element from attribute to match.
 *    (Object) options - Handler options
 *
 *  Returns:
 *    A new Strophe.Handler object.
 */
Strophe.Handler = function (handler, ns, name, type, id, from, options) {
    this.handler = handler;
    this.ns = ns;
    this.name = name;
    this.type = type;
    this.id = id;
    this.options = options || {'matchBareFromJid': false, 'ignoreNamespaceFragment': false};
    // BBB: Maintain backward compatibility with old `matchBare` option
    if (this.options.matchBare) {
        Strophe.warn('The "matchBare" option is deprecated, use "matchBareFromJid" instead.');
        this.options.matchBareFromJid = this.options.matchBare;
        delete this.options.matchBare;
    }

    if (this.options.matchBareFromJid) {
        this.from = from ? Strophe.getBareJidFromJid(from) : null;
    } else {
        this.from = from;
    }
    // whether the handler is a user handler or a system handler
    this.user = true;
};

Strophe.Handler.prototype = {
    /** PrivateFunction: getNamespace
     *  Returns the XML namespace attribute on an element.
     *  If `ignoreNamespaceFragment` was passed in for this handler, then the
     *  URL fragment will be stripped.
     *
     *  Parameters:
     *    (XMLElement) elem - The XML element with the namespace.
     *
     *  Returns:
     *    The namespace, with optionally the fragment stripped.
     */
    getNamespace: function (elem) {
        var elNamespace = elem.getAttribute("xmlns");
        if (elNamespace && this.options.ignoreNamespaceFragment) {
            elNamespace = elNamespace.split('#')[0];
        }
        return elNamespace;
    },

    /** PrivateFunction: namespaceMatch
     *  Tests if a stanza matches the namespace set for this Strophe.Handler.
     *
     *  Parameters:
     *    (XMLElement) elem - The XML element to test.
     *
     *  Returns:
     *    true if the stanza matches and false otherwise.
     */
    namespaceMatch: function (elem) {
        var nsMatch = false;
        if (!this.ns) {
            return true;
        } else {
            var that = this;
            Strophe.forEachChild(elem, null, function (elem) {
                if (that.getNamespace(elem) === that.ns) {
                    nsMatch = true;
                }
            });
            nsMatch = nsMatch || this.getNamespace(elem) === this.ns;
        }
        return nsMatch;
    },

    /** PrivateFunction: isMatch
     *  Tests if a stanza matches the Strophe.Handler.
     *
     *  Parameters:
     *    (XMLElement) elem - The XML element to test.
     *
     *  Returns:
     *    true if the stanza matches and false otherwise.
     */
    isMatch: function (elem) {
        var from = elem.getAttribute('from');
        if (this.options.matchBareFromJid) {
            from = Strophe.getBareJidFromJid(from);
        }
        var elem_type = elem.getAttribute("type");
        if (this.namespaceMatch(elem) &&
            (!this.name || Strophe.isTagEqual(elem, this.name)) &&
            (!this.type || (Array.isArray(this.type) ? this.type.indexOf(elem_type) !== -1 : elem_type === this.type)) &&
            (!this.id || elem.getAttribute("id") === this.id) &&
            (!this.from || from === this.from)) {
                return true;
        }
        return false;
    },

    /** PrivateFunction: run
     *  Run the callback on a matching stanza.
     *
     *  Parameters:
     *    (XMLElement) elem - The DOM element that triggered the
     *      Strophe.Handler.
     *
     *  Returns:
     *    A boolean indicating if the handler should remain active.
     */
    run: function (elem) {
        var result = null;
        try {
            result = this.handler(elem);
        } catch (e) {
            Strophe._handleError(e);
            throw e;
        }
        return result;
    },

    /** PrivateFunction: toString
     *  Get a String representation of the Strophe.Handler object.
     *
     *  Returns:
     *    A String.
     */
    toString: function () {
        return "{Handler: " + this.handler + "(" + this.name + "," +
            this.id + "," + this.ns + ")}";
    }
};

/** PrivateClass: Strophe.TimedHandler
 *  _Private_ helper class for managing timed handlers.
 *
 *  A Strophe.TimedHandler encapsulates a user provided callback that
 *  should be called after a certain period of time or at regular
 *  intervals.  The return value of the callback determines whether the
 *  Strophe.TimedHandler will continue to fire.
 *
 *  Users will not use Strophe.TimedHandler objects directly, but instead
 *  they will use Strophe.Connection.addTimedHandler() and
 *  Strophe.Connection.deleteTimedHandler().
 */

/** PrivateConstructor: Strophe.TimedHandler
 *  Create and initialize a new Strophe.TimedHandler object.
 *
 *  Parameters:
 *    (Integer) period - The number of milliseconds to wait before the
 *      handler is called.
 *    (Function) handler - The callback to run when the handler fires.  This
 *      function should take no arguments.
 *
 *  Returns:
 *    A new Strophe.TimedHandler object.
 */
Strophe.TimedHandler = function (period, handler) {
    this.period = period;
    this.handler = handler;
    this.lastCalled = new Date().getTime();
    this.user = true;
};

Strophe.TimedHandler.prototype = {
    /** PrivateFunction: run
     *  Run the callback for the Strophe.TimedHandler.
     *
     *  Returns:
     *    true if the Strophe.TimedHandler should be called again, and false
     *      otherwise.
     */
    run: function () {
        this.lastCalled = new Date().getTime();
        return this.handler();
    },

    /** PrivateFunction: reset
     *  Reset the last called time for the Strophe.TimedHandler.
     */
    reset: function () {
        this.lastCalled = new Date().getTime();
    },

    /** PrivateFunction: toString
     *  Get a string representation of the Strophe.TimedHandler object.
     *
     *  Returns:
     *    The string representation.
     */
    toString: function () {
        return "{TimedHandler: " + this.handler + "(" + this.period +")}";
    }
};

/** Class: Strophe.Connection
 *  XMPP Connection manager.
 *
 *  This class is the main part of Strophe.  It manages a BOSH or websocket
 *  connection to an XMPP server and dispatches events to the user callbacks
 *  as data arrives. It supports SASL PLAIN, SASL DIGEST-MD5, SASL SCRAM-SHA1
 *  and legacy authentication.
 *
 *  After creating a Strophe.Connection object, the user will typically
 *  call connect() with a user supplied callback to handle connection level
 *  events like authentication failure, disconnection, or connection
 *  complete.
 *
 *  The user will also have several event handlers defined by using
 *  addHandler() and addTimedHandler().  These will allow the user code to
 *  respond to interesting stanzas or do something periodically with the
 *  connection. These handlers will be active once authentication is
 *  finished.
 *
 *  To send data to the connection, use send().
 */

/** Constructor: Strophe.Connection
 *  Create and initialize a Strophe.Connection object.
 *
 *  The transport-protocol for this connection will be chosen automatically
 *  based on the given service parameter. URLs starting with "ws://" or
 *  "wss://" will use WebSockets, URLs starting with "http://", "https://"
 *  or without a protocol will use BOSH.
 *
 *  To make Strophe connect to the current host you can leave out the protocol
 *  and host part and just pass the path, e.g.
 *
 *  > var conn = new Strophe.Connection("/http-bind/");
 *
 *  Options common to both Websocket and BOSH:
 *  ------------------------------------------
 *
 *  cookies:
 *
 *  The *cookies* option allows you to pass in cookies to be added to the
 *  document. These cookies will then be included in the BOSH XMLHttpRequest
 *  or in the websocket connection.
 *
 *  The passed in value must be a map of cookie names and string values.
 *
 *  > { "myCookie": {
 *  >     "value": "1234",
 *  >     "domain": ".example.org",
 *  >     "path": "/",
 *  >     "expires": expirationDate
 *  >     }
 *  > }
 *
 *  Note that cookies can't be set in this way for other domains (i.e. cross-domain).
 *  Those cookies need to be set under those domains, for example they can be
 *  set server-side by making a XHR call to that domain to ask it to set any
 *  necessary cookies.
 *
 *  mechanisms:
 *
 *  The *mechanisms* option allows you to specify the SASL mechanisms that this
 *  instance of Strophe.Connection (and therefore your XMPP client) will
 *  support.
 *
 *  The value must be an array of objects with Strophe.SASLMechanism
 *  prototypes.
 *
 *  If nothing is specified, then the following mechanisms (and their
 *  priorities) are registered:
 *
 *      OAUTHBEARER - 60
 *      SCRAM-SHA1 - 50
 *      DIGEST-MD5 - 40
 *      PLAIN - 30
 *      ANONYMOUS - 20
 *      EXTERNAL - 10
 *
 *  WebSocket options:
 *  ------------------
 *
 *  If you want to connect to the current host with a WebSocket connection you
 *  can tell Strophe to use WebSockets through a "protocol" attribute in the
 *  optional options parameter. Valid values are "ws" for WebSocket and "wss"
 *  for Secure WebSocket.
 *  So to connect to "wss://CURRENT_HOSTNAME/xmpp-websocket" you would call
 *
 *  > var conn = new Strophe.Connection("/xmpp-websocket/", {protocol: "wss"});
 *
 *  Note that relative URLs _NOT_ starting with a "/" will also include the path
 *  of the current site.
 *
 *  Also because downgrading security is not permitted by browsers, when using
 *  relative URLs both BOSH and WebSocket connections will use their secure
 *  variants if the current connection to the site is also secure (https).
 *
 *  BOSH options:
 *  -------------
 *
 *  By adding "sync" to the options, you can control if requests will
 *  be made synchronously or not. The default behaviour is asynchronous.
 *  If you want to make requests synchronous, make "sync" evaluate to true.
 *  > var conn = new Strophe.Connection("/http-bind/", {sync: true});
 *
 *  You can also toggle this on an already established connection.
 *  > conn.options.sync = true;
 *
 *  The *customHeaders* option can be used to provide custom HTTP headers to be
 *  included in the XMLHttpRequests made.
 *
 *  The *keepalive* option can be used to instruct Strophe to maintain the
 *  current BOSH session across interruptions such as webpage reloads.
 *
 *  It will do this by caching the sessions tokens in sessionStorage, and when
 *  "restore" is called it will check whether there are cached tokens with
 *  which it can resume an existing session.
 *
 *  The *withCredentials* option should receive a Boolean value and is used to
 *  indicate wether cookies should be included in ajax requests (by default
 *  they're not).
 *  Set this value to true if you are connecting to a BOSH service
 *  and for some reason need to send cookies to it.
 *  In order for this to work cross-domain, the server must also enable
 *  credentials by setting the Access-Control-Allow-Credentials response header
 *  to "true". For most usecases however this setting should be false (which
 *  is the default).
 *  Additionally, when using Access-Control-Allow-Credentials, the
 *  Access-Control-Allow-Origin header can't be set to the wildcard "*", but
 *  instead must be restricted to actual domains.
 *
 *  The *contentType* option can be set to change the default Content-Type
 *  of "text/xml; charset=utf-8", which can be useful to reduce the amount of
 *  CORS preflight requests that are sent to the server.
 *
 *  Parameters:
 *    (String) service - The BOSH or WebSocket service URL.
 *    (Object) options - A hash of configuration options
 *
 *  Returns:
 *    A new Strophe.Connection object.
 */
Strophe.Connection = function (service, options) {
    // The service URL
    this.service = service;
    // Configuration options
    this.options = options || {};
    var proto = this.options.protocol || "";

    // Select protocal based on service or options
    if (service.indexOf("ws:") === 0 || service.indexOf("wss:") === 0 ||
            proto.indexOf("ws") === 0) {
        this._proto = new Strophe.Websocket(this);
    } else {
        this._proto = new Strophe.Bosh(this);
    }

    /* The connected JID. */
    this.jid = "";
    /* the JIDs domain */
    this.domain = null;
    /* stream:features */
    this.features = null;

    // SASL
    this._sasl_data = {};
    this.do_session = false;
    this.do_bind = false;

    // handler lists
    this.timedHandlers = [];
    this.handlers = [];
    this.removeTimeds = [];
    this.removeHandlers = [];
    this.addTimeds = [];
    this.addHandlers = [];
    this.protocolErrorHandlers = {
        'HTTP': {},
        'websocket': {}
    };

    this._idleTimeout = null;
    this._disconnectTimeout = null;

    this.authenticated = false;
    this.connected = false;
    this.disconnecting = false;
    this.do_authentication = true;
    this.paused = false;
    this.restored = false;

    this._data = [];
    this._uniqueId = 0;

    this._sasl_success_handler = null;
    this._sasl_failure_handler = null;
    this._sasl_challenge_handler = null;

    // Max retries before disconnecting
    this.maxRetries = 5;

    // Call onIdle callback every 1/10th of a second
    // XXX: setTimeout should be called only with function expressions (23974bc1)
    this._idleTimeout = setTimeout(function() {
        this._onIdle();
    }.bind(this), 100);

    utils.addCookies(this.options.cookies);
    this.registerSASLMechanisms(this.options.mechanisms);

    // initialize plugins
    for (var k in Strophe._connectionPlugins) {
        if (Strophe._connectionPlugins.hasOwnProperty(k)) {
            var ptype = Strophe._connectionPlugins[k];
            // jslint complaints about the below line, but this is fine
            var F = function () {}; // jshint ignore:line
            F.prototype = ptype;
            this[k] = new F();
            this[k].init(this);
        }
    }
};

Strophe.Connection.prototype = {
    /** Function: reset
     *  Reset the connection.
     *
     *  This function should be called after a connection is disconnected
     *  before that connection is reused.
     */
    reset: function () {
        this._proto._reset();

        // SASL
        this.do_session = false;
        this.do_bind = false;

        // handler lists
        this.timedHandlers = [];
        this.handlers = [];
        this.removeTimeds = [];
        this.removeHandlers = [];
        this.addTimeds = [];
        this.addHandlers = [];

        this.authenticated = false;
        this.connected = false;
        this.disconnecting = false;
        this.restored = false;

        this._data = [];
        this._requests = [];
        this._uniqueId = 0;
    },

    /** Function: pause
     *  Pause the request manager.
     *
     *  This will prevent Strophe from sending any more requests to the
     *  server.  This is very useful for temporarily pausing
     *  BOSH-Connections while a lot of send() calls are happening quickly.
     *  This causes Strophe to send the data in a single request, saving
     *  many request trips.
     */
    pause: function () {
        this.paused = true;
    },

    /** Function: resume
     *  Resume the request manager.
     *
     *  This resumes after pause() has been called.
     */
    resume: function () {
        this.paused = false;
    },

    /** Function: getUniqueId
     *  Generate a unique ID for use in <iq/> elements.
     *
     *  All <iq/> stanzas are required to have unique id attributes.  This
     *  function makes creating these easy.  Each connection instance has
     *  a counter which starts from zero, and the value of this counter
     *  plus a colon followed by the suffix becomes the unique id. If no
     *  suffix is supplied, the counter is used as the unique id.
     *
     *  Suffixes are used to make debugging easier when reading the stream
     *  data, and their use is recommended.  The counter resets to 0 for
     *  every new connection for the same reason.  For connections to the
     *  same server that authenticate the same way, all the ids should be
     *  the same, which makes it easy to see changes.  This is useful for
     *  automated testing as well.
     *
     *  Parameters:
     *    (String) suffix - A optional suffix to append to the id.
     *
     *  Returns:
     *    A unique string to be used for the id attribute.
     */
    getUniqueId: function(suffix) {
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
        if (typeof(suffix) === "string" || typeof(suffix) === "number") {
            return uuid + ":" + suffix;
        } else {
            return uuid + "";
        }
    },

    /** Function: addProtocolErrorHandler
     *  Register a handler function for when a protocol (websocker or HTTP)
     *  error occurs.
     *
     *  NOTE: Currently only HTTP errors for BOSH requests are handled.
     *  Patches that handle websocket errors would be very welcome.
     *
     *  Parameters:
     *    (String) protocol - 'HTTP' or 'websocket'
     *    (Integer) status_code - Error status code (e.g 500, 400 or 404)
     *    (Function) callback - Function that will fire on Http error
     *
     *  Example:
     *  function onError(err_code){
     *    //do stuff
     *  }
     *
     *  var conn = Strophe.connect('http://example.com/http-bind');
     *  conn.addProtocolErrorHandler('HTTP', 500, onError);
     *  // Triggers HTTP 500 error and onError handler will be called
     *  conn.connect('user_jid@incorrect_jabber_host', 'secret', onConnect);
     */
    addProtocolErrorHandler: function(protocol, status_code, callback){
        this.protocolErrorHandlers[protocol][status_code] = callback;
    },


    /** Function: connect
     *  Starts the connection process.
     *
     *  As the connection process proceeds, the user supplied callback will
     *  be triggered multiple times with status updates.  The callback
     *  should take two arguments - the status code and the error condition.
     *
     *  The status code will be one of the values in the Strophe.Status
     *  constants.  The error condition will be one of the conditions
     *  defined in RFC 3920 or the condition 'strophe-parsererror'.
     *
     *  The Parameters _wait_, _hold_ and _route_ are optional and only relevant
     *  for BOSH connections. Please see XEP 124 for a more detailed explanation
     *  of the optional parameters.
     *
     *  Parameters:
     *    (String) jid - The user's JID.  This may be a bare JID,
     *      or a full JID.  If a node is not supplied, SASL OAUTHBEARER or
     *      SASL ANONYMOUS authentication will be attempted (OAUTHBEARER will
     *      process the provided password value as an access token).
     *    (String) pass - The user's password.
     *    (Function) callback - The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (String) route - The optional route value.
     *    (String) authcid - The optional alternative authentication identity
     *      (username) if intending to impersonate another user.
     *      When using the SASL-EXTERNAL authentication mechanism, for example
     *      with client certificates, then the authcid value is used to
     *      determine whether an authorization JID (authzid) should be sent to
     *      the server. The authzid should not be sent to the server if the
     *      authzid and authcid are the same. So to prevent it from being sent
     *      (for example when the JID is already contained in the client
     *      certificate), set authcid to that same JID. See XEP-178 for more
     *      details.
     */
    connect: function (jid, pass, callback, wait, hold, route, authcid) {
        this.jid = jid;
        /** Variable: authzid
         *  Authorization identity.
         */
        this.authzid = Strophe.getBareJidFromJid(this.jid);

        /** Variable: authcid
         *  Authentication identity (User name).
         */
        this.authcid = authcid || Strophe.getNodeFromJid(this.jid);

        /** Variable: pass
         *  Authentication identity (User password).
         */
        this.pass = pass;

        /** Variable: servtype
         *  Digest MD5 compatibility.
         */
        this.servtype = "xmpp";

        this.connect_callback = callback;
        this.disconnecting = false;
        this.connected = false;
        this.authenticated = false;
        this.restored = false;

        // parse jid for domain
        this.domain = Strophe.getDomainFromJid(this.jid);

        this._changeConnectStatus(Strophe.Status.CONNECTING, null);

        this._proto._connect(wait, hold, route);
    },

    /** Function: attach
     *  Attach to an already created and authenticated BOSH session.
     *
     *  This function is provided to allow Strophe to attach to BOSH
     *  sessions which have been created externally, perhaps by a Web
     *  application.  This is often used to support auto-login type features
     *  without putting user credentials into the page.
     *
     *  Parameters:
     *    (String) jid - The full JID that is bound by the session.
     *    (String) sid - The SID of the BOSH session.
     *    (String) rid - The current RID of the BOSH session.  This RID
     *      will be used by the next request.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
     */
    attach: function (jid, sid, rid, callback, wait, hold, wind) {
        if (this._proto instanceof Strophe.Bosh) {
            this._proto._attach(jid, sid, rid, callback, wait, hold, wind);
        } else {
            throw {
                name: 'StropheSessionError',
                message: 'The "attach" method can only be used with a BOSH connection.'
            };
        }
    },

    /** Function: restore
     *  Attempt to restore a cached BOSH session.
     *
     *  This function is only useful in conjunction with providing the
     *  "keepalive":true option when instantiating a new Strophe.Connection.
     *
     *  When "keepalive" is set to true, Strophe will cache the BOSH tokens
     *  RID (Request ID) and SID (Session ID) and then when this function is
     *  called, it will attempt to restore the session from those cached
     *  tokens.
     *
     *  This function must therefore be called instead of connect or attach.
     *
     *  For an example on how to use it, please see examples/restore.js
     *
     *  Parameters:
     *    (String) jid - The user's JID.  This may be a bare JID or a full JID.
     *    (Function) callback - The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
     */
    restore: function (jid, callback, wait, hold, wind) {
        if (this._sessionCachingSupported()) {
            this._proto._restore(jid, callback, wait, hold, wind);
        } else {
            throw {
                name: 'StropheSessionError',
                message: 'The "restore" method can only be used with a BOSH connection.'
            };
        }
    },

    /** PrivateFunction: _sessionCachingSupported
     * Checks whether sessionStorage and JSON are supported and whether we're
     * using BOSH.
     */
    _sessionCachingSupported: function () {
        if (this._proto instanceof Strophe.Bosh) {
            if (!JSON) { return false; }
            try {
                sessionStorage.setItem('_strophe_', '_strophe_');
                sessionStorage.removeItem('_strophe_');
            } catch (e) {
                return false;
            }
            return true;
        }
        return false;
    },

    /** Function: xmlInput
     *  User overrideable function that receives XML data coming into the
     *  connection.
     *
     *  The default function does nothing.  User code can override this with
     *  > Strophe.Connection.xmlInput = function (elem) {
     *  >   (user code)
     *  > };
     *
     *  Due to limitations of current Browsers' XML-Parsers the opening and closing
     *  <stream> tag for WebSocket-Connoctions will be passed as selfclosing here.
     *
     *  BOSH-Connections will have all stanzas wrapped in a <body> tag. See
     *  <Strophe.Bosh.strip> if you want to strip this tag.
     *
     *  Parameters:
     *    (XMLElement) elem - The XML data received by the connection.
     */
    /* jshint unused:false */
    xmlInput: function (elem) {
        return;
    },
    /* jshint unused:true */

    /** Function: xmlOutput
     *  User overrideable function that receives XML data sent to the
     *  connection.
     *
     *  The default function does nothing.  User code can override this with
     *  > Strophe.Connection.xmlOutput = function (elem) {
     *  >   (user code)
     *  > };
     *
     *  Due to limitations of current Browsers' XML-Parsers the opening and closing
     *  <stream> tag for WebSocket-Connoctions will be passed as selfclosing here.
     *
     *  BOSH-Connections will have all stanzas wrapped in a <body> tag. See
     *  <Strophe.Bosh.strip> if you want to strip this tag.
     *
     *  Parameters:
     *    (XMLElement) elem - The XMLdata sent by the connection.
     */
    /* jshint unused:false */
    xmlOutput: function (elem) {
        return;
    },
    /* jshint unused:true */

    /** Function: rawInput
     *  User overrideable function that receives raw data coming into the
     *  connection.
     *
     *  The default function does nothing.  User code can override this with
     *  > Strophe.Connection.rawInput = function (data) {
     *  >   (user code)
     *  > };
     *
     *  Parameters:
     *    (String) data - The data received by the connection.
     */
    /* jshint unused:false */
    rawInput: function (data) {
        return;
    },
    /* jshint unused:true */

    /** Function: rawOutput
     *  User overrideable function that receives raw data sent to the
     *  connection.
     *
     *  The default function does nothing.  User code can override this with
     *  > Strophe.Connection.rawOutput = function (data) {
     *  >   (user code)
     *  > };
     *
     *  Parameters:
     *    (String) data - The data sent by the connection.
     */
    /* jshint unused:false */
    rawOutput: function (data) {
        return;
    },
    /* jshint unused:true */

    /** Function: nextValidRid
     *  User overrideable function that receives the new valid rid.
     *
     *  The default function does nothing. User code can override this with
     *  > Strophe.Connection.nextValidRid = function (rid) {
     *  >    (user code)
     *  > };
     *
     *  Parameters:
     *    (Number) rid - The next valid rid
     */
    /* jshint unused:false */
    nextValidRid: function (rid) {
        return;
    },
    /* jshint unused:true */

    /** Function: send
     *  Send a stanza.
     *
     *  This function is called to push data onto the send queue to
     *  go out over the wire.  Whenever a request is sent to the BOSH
     *  server, all pending data is sent and the queue is flushed.
     *
     *  Parameters:
     *    (XMLElement |
     *     [XMLElement] |
     *     Strophe.Builder) elem - The stanza to send.
     */
    send: function (elem) {
        if (elem === null) { return ; }
        if (typeof(elem.sort) === "function") {
            for (var i = 0; i < elem.length; i++) {
                this._queueData(elem[i]);
            }
        } else if (typeof(elem.tree) === "function") {
            this._queueData(elem.tree());
        } else {
            this._queueData(elem);
        }

        this._proto._send();
    },

    /** Function: flush
     *  Immediately send any pending outgoing data.
     *
     *  Normally send() queues outgoing data until the next idle period
     *  (100ms), which optimizes network use in the common cases when
     *  several send()s are called in succession. flush() can be used to
     *  immediately send all pending data.
     */
    flush: function () {
        // cancel the pending idle period and run the idle function
        // immediately
        clearTimeout(this._idleTimeout);
        this._onIdle();
    },

    /** Function: sendPresence
     *  Helper function to send presence stanzas. The main benefit is for
     *  sending presence stanzas for which you expect a responding presence
     *  stanza with the same id (for example when leaving a chat room).
     *
     *  Parameters:
     *    (XMLElement) elem - The stanza to send.
     *    (Function) callback - The callback function for a successful request.
     *    (Function) errback - The callback function for a failed or timed
     *      out request.  On timeout, the stanza will be null.
     *    (Integer) timeout - The time specified in milliseconds for a
     *      timeout to occur.
     *
     *  Returns:
     *    The id used to send the presence.
     */
    sendPresence: function(elem, callback, errback, timeout) {
        var timeoutHandler = null;
        var that = this;
        if (typeof(elem.tree) === "function") {
            elem = elem.tree();
        }
        var id = elem.getAttribute('id');
        if (!id) { // inject id if not found
            id = this.getUniqueId("sendPresence");
            elem.setAttribute("id", id);
        }

        if (typeof callback === "function" || typeof errback === "function") {
            var handler = this.addHandler(function (stanza) {
                // remove timeout handler if there is one
                if (timeoutHandler) {
                    that.deleteTimedHandler(timeoutHandler);
                }
                var type = stanza.getAttribute('type');
                if (type === 'error') {
                    if (errback) {
                        errback(stanza);
                    }
                } else if (callback) {
                    callback(stanza);
                }
            }, null, 'presence', null, id);

            // if timeout specified, set up a timeout handler.
            if (timeout) {
                timeoutHandler = this.addTimedHandler(timeout, function () {
                    // get rid of normal handler
                    that.deleteHandler(handler);
                    // call errback on timeout with null stanza
                    if (errback) {
                        errback(null);
                    }
                    return false;
                });
            }
        }
        this.send(elem);
        return id;
    },

    /** Function: sendIQ
     *  Helper function to send IQ stanzas.
     *
     *  Parameters:
     *    (XMLElement) elem - The stanza to send.
     *    (Function) callback - The callback function for a successful request.
     *    (Function) errback - The callback function for a failed or timed
     *      out request.  On timeout, the stanza will be null.
     *    (Integer) timeout - The time specified in milliseconds for a
     *      timeout to occur.
     *
     *  Returns:
     *    The id used to send the IQ.
    */
    sendIQ: function(elem, callback, errback, timeout) {
        var timeoutHandler = null;
        var that = this;
        if (typeof(elem.tree) === "function") {
            elem = elem.tree();
        }
        var id = elem.getAttribute('id');
        if (!id) { // inject id if not found
            id = this.getUniqueId("sendIQ");
            elem.setAttribute("id", id);
        }

        if (typeof callback === "function" || typeof errback === "function") {
            var handler = this.addHandler(function (stanza) {
                // remove timeout handler if there is one
                if (timeoutHandler) {
                    that.deleteTimedHandler(timeoutHandler);
                }
                var iqtype = stanza.getAttribute('type');
                if (iqtype === 'result') {
                    if (callback) {
                        callback(stanza);
                    }
                } else if (iqtype === 'error') {
                    if (errback) {
                        errback(stanza);
                    }
                } else {
                    throw {
                        name: "StropheError",
                        message: "Got bad IQ type of " + iqtype
                    };
                }
            }, null, 'iq', ['error', 'result'], id);

            // if timeout specified, set up a timeout handler.
            if (timeout) {
                timeoutHandler = this.addTimedHandler(timeout, function () {
                    // get rid of normal handler
                    that.deleteHandler(handler);
                    // call errback on timeout with null stanza
                    if (errback) {
                        errback(null);
                    }
                    return false;
                });
            }
        }
        this.send(elem);
        return id;
    },

    /** PrivateFunction: _queueData
     *  Queue outgoing data for later sending.  Also ensures that the data
     *  is a DOMElement.
     */
    _queueData: function (element) {
        if (element === null ||
            !element.tagName ||
            !element.childNodes) {
            throw {
                name: "StropheError",
                message: "Cannot queue non-DOMElement."
            };
        }
        this._data.push(element);
    },

    /** PrivateFunction: _sendRestart
     *  Send an xmpp:restart stanza.
     */
    _sendRestart: function () {
        this._data.push("restart");
        this._proto._sendRestart();
        // XXX: setTimeout should be called only with function expressions (23974bc1)
        this._idleTimeout = setTimeout(function() {
            this._onIdle();
        }.bind(this), 100);
    },

    /** Function: addTimedHandler
     *  Add a timed handler to the connection.
     *
     *  This function adds a timed handler.  The provided handler will
     *  be called every period milliseconds until it returns false,
     *  the connection is terminated, or the handler is removed.  Handlers
     *  that wish to continue being invoked should return true.
     *
     *  Because of method binding it is necessary to save the result of
     *  this function if you wish to remove a handler with
     *  deleteTimedHandler().
     *
     *  Note that user handlers are not active until authentication is
     *  successful.
     *
     *  Parameters:
     *    (Integer) period - The period of the handler.
     *    (Function) handler - The callback function.
     *
     *  Returns:
     *    A reference to the handler that can be used to remove it.
     */
    addTimedHandler: function (period, handler) {
        var thand = new Strophe.TimedHandler(period, handler);
        this.addTimeds.push(thand);
        return thand;
    },

    /** Function: deleteTimedHandler
     *  Delete a timed handler for a connection.
     *
     *  This function removes a timed handler from the connection.  The
     *  handRef parameter is *not* the function passed to addTimedHandler(),
     *  but is the reference returned from addTimedHandler().
     *
     *  Parameters:
     *    (Strophe.TimedHandler) handRef - The handler reference.
     */
    deleteTimedHandler: function (handRef) {
        // this must be done in the Idle loop so that we don't change
        // the handlers during iteration
        this.removeTimeds.push(handRef);
    },

    /** Function: addHandler
     *  Add a stanza handler for the connection.
     *
     *  This function adds a stanza handler to the connection.  The
     *  handler callback will be called for any stanza that matches
     *  the parameters.  Note that if multiple parameters are supplied,
     *  they must all match for the handler to be invoked.
     *
     *  The handler will receive the stanza that triggered it as its argument.
     *  *The handler should return true if it is to be invoked again;
     *  returning false will remove the handler after it returns.*
     *
     *  As a convenience, the ns parameters applies to the top level element
     *  and also any of its immediate children.  This is primarily to make
     *  matching /iq/query elements easy.
     *
     *  Options
     *  ~~~~~~~
     *  With the options argument, you can specify boolean flags that affect how
     *  matches are being done.
     *
     *  Currently two flags exist:
     *
     *  - matchBareFromJid:
     *      When set to true, the from parameter and the
     *      from attribute on the stanza will be matched as bare JIDs instead
     *      of full JIDs. To use this, pass {matchBareFromJid: true} as the
     *      value of options. The default value for matchBareFromJid is false.
     *
     *  - ignoreNamespaceFragment:
     *      When set to true, a fragment specified on the stanza's namespace
     *      URL will be ignored when it's matched with the one configured for
     *      the handler.
     *
     *      This means that if you register like this:
     *      >   connection.addHandler(
     *      >       handler,
     *      >       'http://jabber.org/protocol/muc',
     *      >       null, null, null, null,
     *      >       {'ignoreNamespaceFragment': true}
     *      >   );
     *
     *      Then a stanza with XML namespace of
     *      'http://jabber.org/protocol/muc#user' will also be matched. If
     *      'ignoreNamespaceFragment' is false, then only stanzas with
     *      'http://jabber.org/protocol/muc' will be matched.
     *
     *  Deleting the handler
     *  ~~~~~~~~~~~~~~~~~~~~
     *  The return value should be saved if you wish to remove the handler
     *  with deleteHandler().
     *
     *  Parameters:
     *    (Function) handler - The user callback.
     *    (String) ns - The namespace to match.
     *    (String) name - The stanza name to match.
     *    (String|Array) type - The stanza type (or types if an array) to match.
     *    (String) id - The stanza id attribute to match.
     *    (String) from - The stanza from attribute to match.
     *    (String) options - The handler options
     *
     *  Returns:
     *    A reference to the handler that can be used to remove it.
     */
    addHandler: function (handler, ns, name, type, id, from, options) {
        var hand = new Strophe.Handler(handler, ns, name, type, id, from, options);
        this.addHandlers.push(hand);
        return hand;
    },

    /** Function: deleteHandler
     *  Delete a stanza handler for a connection.
     *
     *  This function removes a stanza handler from the connection.  The
     *  handRef parameter is *not* the function passed to addHandler(),
     *  but is the reference returned from addHandler().
     *
     *  Parameters:
     *    (Strophe.Handler) handRef - The handler reference.
     */
    deleteHandler: function (handRef) {
        // this must be done in the Idle loop so that we don't change
        // the handlers during iteration
        this.removeHandlers.push(handRef);
        // If a handler is being deleted while it is being added,
        // prevent it from getting added
        var i = this.addHandlers.indexOf(handRef);
        if (i >= 0) {
            this.addHandlers.splice(i, 1);
        }
    },

    /** Function: registerSASLMechanisms
     *
     * Register the SASL mechanisms which will be supported by this instance of
     * Strophe.Connection (i.e. which this XMPP client will support).
     *
     *  Parameters:
     *    (Array) mechanisms - Array of objects with Strophe.SASLMechanism prototypes
     *
     */
    registerSASLMechanisms: function (mechanisms) {
        this.mechanisms = {};
        mechanisms = mechanisms || [
            Strophe.SASLAnonymous,
            Strophe.SASLExternal,
            Strophe.SASLMD5,
            Strophe.SASLOAuthBearer,
            Strophe.SASLPlain,
            Strophe.SASLSHA1
        ];
        mechanisms.forEach(this.registerSASLMechanism.bind(this));
    },

    /** Function: registerSASLMechanism
     *
     * Register a single SASL mechanism, to be supported by this client.
     *
     *  Parameters:
     *    (Object) mechanism - Object with a Strophe.SASLMechanism prototype
     *
     */
    registerSASLMechanism: function (mechanism) {
        this.mechanisms[mechanism.prototype.name] = mechanism;
    },

    /** Function: disconnect
     *  Start the graceful disconnection process.
     *
     *  This function starts the disconnection process.  This process starts
     *  by sending unavailable presence and sending BOSH body of type
     *  terminate.  A timeout handler makes sure that disconnection happens
     *  even if the BOSH server does not respond.
     *  If the Connection object isn't connected, at least tries to abort all pending requests
     *  so the connection object won't generate successful requests (which were already opened).
     *
     *  The user supplied connection callback will be notified of the
     *  progress as this process happens.
     *
     *  Parameters:
     *    (String) reason - The reason the disconnect is occuring.
     */
    disconnect: function (reason) {
        this._changeConnectStatus(Strophe.Status.DISCONNECTING, reason);

        Strophe.info("Disconnect was called because: " + reason);
        if (this.connected) {
            var pres = false;
            this.disconnecting = true;
            if (this.authenticated) {
                pres = $pres({
                    xmlns: Strophe.NS.CLIENT,
                    type: 'unavailable'
                });
            }
            // setup timeout handler
            this._disconnectTimeout = this._addSysTimedHandler(
                3000, this._onDisconnectTimeout.bind(this));
            this._proto._disconnect(pres);
        } else {
            Strophe.info("Disconnect was called before Strophe connected to the server");
            this._proto._abortAllRequests();
            this._doDisconnect();
        }
    },

    /** PrivateFunction: _changeConnectStatus
     *  _Private_ helper function that makes sure plugins and the user's
     *  callback are notified of connection status changes.
     *
     *  Parameters:
     *    (Integer) status - the new connection status, one of the values
     *      in Strophe.Status
     *    (String) condition - the error condition or null
     */
    _changeConnectStatus: function (status, condition) {
        // notify all plugins listening for status changes
        for (var k in Strophe._connectionPlugins) {
            if (Strophe._connectionPlugins.hasOwnProperty(k)) {
                var plugin = this[k];
                if (plugin.statusChanged) {
                    try {
                        plugin.statusChanged(status, condition);
                    } catch (err) {
                        Strophe.error("" + k + " plugin caused an exception " +
                                      "changing status: " + err);
                    }
                }
            }
        }

        // notify the user's callback
        if (this.connect_callback) {
            try {
                this.connect_callback(status, condition);
            } catch (e) {
                Strophe._handleError(e);
                Strophe.error(
                    "User connection callback caused an "+"exception: "+e);
            }
        }
    },

    /** PrivateFunction: _doDisconnect
     *  _Private_ function to disconnect.
     *
     *  This is the last piece of the disconnection logic.  This resets the
     *  connection and alerts the user's connection callback.
     */
    _doDisconnect: function (condition) {
        if (typeof this._idleTimeout === "number") {
            clearTimeout(this._idleTimeout);
        }

        // Cancel Disconnect Timeout
        if (this._disconnectTimeout !== null) {
            this.deleteTimedHandler(this._disconnectTimeout);
            this._disconnectTimeout = null;
        }

        Strophe.info("_doDisconnect was called");
        this._proto._doDisconnect();

        this.authenticated = false;
        this.disconnecting = false;
        this.restored = false;

        // delete handlers
        this.handlers = [];
        this.timedHandlers = [];
        this.removeTimeds = [];
        this.removeHandlers = [];
        this.addTimeds = [];
        this.addHandlers = [];

        // tell the parent we disconnected
        this._changeConnectStatus(Strophe.Status.DISCONNECTED, condition);
        this.connected = false;
    },

    /** PrivateFunction: _dataRecv
     *  _Private_ handler to processes incoming data from the the connection.
     *
     *  Except for _connect_cb handling the initial connection request,
     *  this function handles the incoming data for all requests.  This
     *  function also fires stanza handlers that match each incoming
     *  stanza.
     *
     *  Parameters:
     *    (Strophe.Request) req - The request that has data ready.
     *    (string) req - The stanza a raw string (optiona).
     */
    _dataRecv: function (req, raw) {
        Strophe.info("_dataRecv called");
        var elem = this._proto._reqToData(req);
        if (elem === null) { return; }

        if (this.xmlInput !== Strophe.Connection.prototype.xmlInput) {
            if (elem.nodeName === this._proto.strip && elem.childNodes.length) {
                this.xmlInput(elem.childNodes[0]);
            } else {
                this.xmlInput(elem);
            }
        }
        if (this.rawInput !== Strophe.Connection.prototype.rawInput) {
            if (raw) {
                this.rawInput(raw);
            } else {
                this.rawInput(Strophe.serialize(elem));
            }
        }

        // remove handlers scheduled for deletion
        var i, hand;
        while (this.removeHandlers.length > 0) {
            hand = this.removeHandlers.pop();
            i = this.handlers.indexOf(hand);
            if (i >= 0) {
                this.handlers.splice(i, 1);
            }
        }

        // add handlers scheduled for addition
        while (this.addHandlers.length > 0) {
            this.handlers.push(this.addHandlers.pop());
        }

        // handle graceful disconnect
        if (this.disconnecting && this._proto._emptyQueue()) {
            this._doDisconnect();
            return;
        }

        var type = elem.getAttribute("type");
        var cond, conflict;
        if (type !== null && type === "terminate") {
            // Don't process stanzas that come in after disconnect
            if (this.disconnecting) {
                return;
            }

            // an error occurred
            cond = elem.getAttribute("condition");
            conflict = elem.getElementsByTagName("conflict");
            if (cond !== null) {
                if (cond === "remote-stream-error" && conflict.length > 0) {
                    cond = "conflict";
                }
                this._changeConnectStatus(Strophe.Status.CONNFAIL, cond);
            } else {
                this._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown");
            }
            this._doDisconnect(cond);
            return;
        }

        // send each incoming stanza through the handler chain
        var that = this;
        Strophe.forEachChild(elem, null, function (child) {
            var i, newList;
            // process handlers
            newList = that.handlers;
            that.handlers = [];
            for (i = 0; i < newList.length; i++) {
                var hand = newList[i];
                // encapsulate 'handler.run' not to lose the whole handler list if
                // one of the handlers throws an exception
                try {
                    if (hand.isMatch(child) &&
                        (that.authenticated || !hand.user)) {
                        if (hand.run(child)) {
                            that.handlers.push(hand);
                        }
                    } else {
                        that.handlers.push(hand);
                    }
                } catch(e) {
                    // if the handler throws an exception, we consider it as false
                    Strophe.warn('Removing Strophe handlers due to uncaught exception: '+e.message);
                }
            }
        });
    },


    /** Attribute: mechanisms
     *  SASL Mechanisms available for Connection.
     */
    mechanisms: {},

    /** PrivateFunction: _connect_cb
     *  _Private_ handler for initial connection request.
     *
     *  This handler is used to process the initial connection request
     *  response from the BOSH server. It is used to set up authentication
     *  handlers and start the authentication process.
     *
     *  SASL authentication will be attempted if available, otherwise
     *  the code will fall back to legacy authentication.
     *
     *  Parameters:
     *    (Strophe.Request) req - The current request.
     *    (Function) _callback - low level (xmpp) connect callback function.
     *      Useful for plugins with their own xmpp connect callback (when their)
     *      want to do something special).
     */
    _connect_cb: function (req, _callback, raw) {
        Strophe.info("_connect_cb was called");
        this.connected = true;

        var bodyWrap;
        try {
            bodyWrap = this._proto._reqToData(req);
        } catch (e) {
            if (e !== "badformat") { throw e; }
            this._changeConnectStatus(Strophe.Status.CONNFAIL, 'bad-format');
            this._doDisconnect('bad-format');
        }
        if (!bodyWrap) { return; }

        if (this.xmlInput !== Strophe.Connection.prototype.xmlInput) {
            if (bodyWrap.nodeName === this._proto.strip && bodyWrap.childNodes.length) {
                this.xmlInput(bodyWrap.childNodes[0]);
            } else {
                this.xmlInput(bodyWrap);
            }
        }
        if (this.rawInput !== Strophe.Connection.prototype.rawInput) {
            if (raw) {
                this.rawInput(raw);
            } else {
                this.rawInput(Strophe.serialize(bodyWrap));
            }
        }

        var conncheck = this._proto._connect_cb(bodyWrap);
        if (conncheck === Strophe.Status.CONNFAIL) {
            return;
        }

        // Check for the stream:features tag
        var hasFeatures;
        if (bodyWrap.getElementsByTagNameNS) {
            hasFeatures = bodyWrap.getElementsByTagNameNS(Strophe.NS.STREAM, "features").length > 0;
        } else {
            hasFeatures = bodyWrap.getElementsByTagName("stream:features").length > 0 ||
                            bodyWrap.getElementsByTagName("features").length > 0;
        }
        if (!hasFeatures) {
            this._proto._no_auth_received(_callback);
            return;
        }

        var matched = [], i, mech;
        var mechanisms = bodyWrap.getElementsByTagName("mechanism");
        if (mechanisms.length > 0) {
            for (i = 0; i < mechanisms.length; i++) {
                mech = Strophe.getText(mechanisms[i]);
                if (this.mechanisms[mech]) matched.push(this.mechanisms[mech]);
            }
        }
        if (matched.length === 0) {
            if (bodyWrap.getElementsByTagName("auth").length === 0) {
                // There are no matching SASL mechanisms and also no legacy
                // auth available.
                this._proto._no_auth_received(_callback);
                return;
            }
        }
        if (this.do_authentication !== false) {
            this.authenticate(matched);
        }
    },

    /** Function: sortMechanismsByPriority
     *
     *  Sorts an array of objects with prototype SASLMechanism according to
     *  their priorities.
     *
     *  Parameters:
     *    (Array) mechanisms - Array of SASL mechanisms.
     *
     */
    sortMechanismsByPriority: function (mechanisms) {
        // Sorting mechanisms according to priority.
        var i, j, higher, swap;
        for (i = 0; i < mechanisms.length - 1; ++i) {
            higher = i;
            for (j = i + 1; j < mechanisms.length; ++j) {
                if (mechanisms[j].prototype.priority > mechanisms[higher].prototype.priority) {
                    higher = j;
                }
            }
            if (higher !== i) {
                swap = mechanisms[i];
                mechanisms[i] = mechanisms[higher];
                mechanisms[higher] = swap;
            }
        }
        return mechanisms;
    },

    /** PrivateFunction: _attemptSASLAuth
     *
     *  Iterate through an array of SASL mechanisms and attempt authentication
     *  with the highest priority (enabled) mechanism.
     *
     *  Parameters:
     *    (Array) mechanisms - Array of SASL mechanisms.
     *
     *  Returns:
     *    (Boolean) mechanism_found - true or false, depending on whether a
     *          valid SASL mechanism was found with which authentication could be
     *          started.
     */
    _attemptSASLAuth: function (mechanisms) {
        mechanisms = this.sortMechanismsByPriority(mechanisms || []);
        var i = 0, mechanism_found = false;
        for (i = 0; i < mechanisms.length; ++i) {
            if (!mechanisms[i].prototype.test(this)) {
                continue;
            }
            this._sasl_success_handler = this._addSysHandler(
                this._sasl_success_cb.bind(this), null,
                "success", null, null);
            this._sasl_failure_handler = this._addSysHandler(
                this._sasl_failure_cb.bind(this), null,
                "failure", null, null);
            this._sasl_challenge_handler = this._addSysHandler(
                this._sasl_challenge_cb.bind(this), null,
                "challenge", null, null);

            this._sasl_mechanism = new mechanisms[i]();
            this._sasl_mechanism.onStart(this);

            var request_auth_exchange = $build("auth", {
                xmlns: Strophe.NS.SASL,
                mechanism: this._sasl_mechanism.name
            });
            if (this._sasl_mechanism.isClientFirst) {
                var response = this._sasl_mechanism.onChallenge(this, null);
                request_auth_exchange.t(btoa(response));
            }
            this.send(request_auth_exchange.tree());
            mechanism_found = true;
            break;
        }
        return mechanism_found;
    },

    /** PrivateFunction: _attemptLegacyAuth
     *
     *  Attempt legacy (i.e. non-SASL) authentication.
     *
     */
    _attemptLegacyAuth: function () {
        if (Strophe.getNodeFromJid(this.jid) === null) {
            // we don't have a node, which is required for non-anonymous
            // client connections
            this._changeConnectStatus(
                Strophe.Status.CONNFAIL,
                'x-strophe-bad-non-anon-jid'
            );
            this.disconnect('x-strophe-bad-non-anon-jid');
        } else {
            // Fall back to legacy authentication
            this._changeConnectStatus(Strophe.Status.AUTHENTICATING, null);
            this._addSysHandler(
                this._auth1_cb.bind(this),
                null, null, null, "_auth_1"
            );
            this.send($iq({
                    'type': "get",
                    'to': this.domain,
                    'id': "_auth_1"
                }).c("query", {xmlns: Strophe.NS.AUTH})
                .c("username", {}).t(Strophe.getNodeFromJid(this.jid))
                .tree());
        }
    },

    /** Function: authenticate
     * Set up authentication
     *
     *  Continues the initial connection request by setting up authentication
     *  handlers and starting the authentication process.
     *
     *  SASL authentication will be attempted if available, otherwise
     *  the code will fall back to legacy authentication.
     *
     *  Parameters:
     *    (Array) matched - Array of SASL mechanisms supported.
     *
     */
    authenticate: function (matched) {
        if (!this._attemptSASLAuth(matched)) {
            this._attemptLegacyAuth();
        }
    },

    /** PrivateFunction: _sasl_challenge_cb
     *  _Private_ handler for the SASL challenge
     *
     */
    _sasl_challenge_cb: function(elem) {
      var challenge = atob(Strophe.getText(elem));
      var response = this._sasl_mechanism.onChallenge(this, challenge);
      var stanza = $build('response', {
          'xmlns': Strophe.NS.SASL
      });
      if (response !== "") {
        stanza.t(btoa(response));
      }
      this.send(stanza.tree());
      return true;
    },

    /** PrivateFunction: _auth1_cb
     *  _Private_ handler for legacy authentication.
     *
     *  This handler is called in response to the initial <iq type='get'/>
     *  for legacy authentication.  It builds an authentication <iq/> and
     *  sends it, creating a handler (calling back to _auth2_cb()) to
     *  handle the result
     *
     *  Parameters:
     *    (XMLElement) elem - The stanza that triggered the callback.
     *
     *  Returns:
     *    false to remove the handler.
     */
    /* jshint unused:false */
    _auth1_cb: function (elem) {
        // build plaintext auth iq
        var iq = $iq({type: "set", id: "_auth_2"})
            .c('query', {xmlns: Strophe.NS.AUTH})
            .c('username', {}).t(Strophe.getNodeFromJid(this.jid))
            .up()
            .c('password').t(this.pass);

        if (!Strophe.getResourceFromJid(this.jid)) {
            // since the user has not supplied a resource, we pick
            // a default one here.  unlike other auth methods, the server
            // cannot do this for us.
            this.jid = Strophe.getBareJidFromJid(this.jid) + '/strophe';
        }
        iq.up().c('resource', {}).t(Strophe.getResourceFromJid(this.jid));

        this._addSysHandler(this._auth2_cb.bind(this), null,
                            null, null, "_auth_2");
        this.send(iq.tree());
        return false;
    },
    /* jshint unused:true */

    /** PrivateFunction: _sasl_success_cb
     *  _Private_ handler for succesful SASL authentication.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _sasl_success_cb: function (elem) {
        if (this._sasl_data["server-signature"]) {
            var serverSignature;
            var success = atob(Strophe.getText(elem));
            var attribMatch = /([a-z]+)=([^,]+)(,|$)/;
            var matches = success.match(attribMatch);
            if (matches[1] === "v") {
                serverSignature = matches[2];
            }

            if (serverSignature !== this._sasl_data["server-signature"]) {
              // remove old handlers
              this.deleteHandler(this._sasl_failure_handler);
              this._sasl_failure_handler = null;
              if (this._sasl_challenge_handler) {
                this.deleteHandler(this._sasl_challenge_handler);
                this._sasl_challenge_handler = null;
              }

              this._sasl_data = {};
              return this._sasl_failure_cb(null);
            }
        }
        Strophe.info("SASL authentication succeeded.");

        if (this._sasl_mechanism) {
          this._sasl_mechanism.onSuccess();
        }

        // remove old handlers
        this.deleteHandler(this._sasl_failure_handler);
        this._sasl_failure_handler = null;
        if (this._sasl_challenge_handler) {
            this.deleteHandler(this._sasl_challenge_handler);
            this._sasl_challenge_handler = null;
        }

        var streamfeature_handlers = [];
        var wrapper = function(handlers, elem) {
            while (handlers.length) {
                this.deleteHandler(handlers.pop());
            }
            this._sasl_auth1_cb.bind(this)(elem);
            return false;
        };
        streamfeature_handlers.push(this._addSysHandler(function(elem) {
            wrapper.bind(this)(streamfeature_handlers, elem);
        }.bind(this), null, "stream:features", null, null));
        streamfeature_handlers.push(this._addSysHandler(function(elem) {
            wrapper.bind(this)(streamfeature_handlers, elem);
        }.bind(this), Strophe.NS.STREAM, "features", null, null));

        // we must send an xmpp:restart now
        this._sendRestart();

        return false;
    },

    /** PrivateFunction: _sasl_auth1_cb
     *  _Private_ handler to start stream binding.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _sasl_auth1_cb: function (elem) {
        // save stream:features for future usage
        this.features = elem;
        var i, child;
        for (i = 0; i < elem.childNodes.length; i++) {
            child = elem.childNodes[i];
            if (child.nodeName === 'bind') {
                this.do_bind = true;
            }

            if (child.nodeName === 'session') {
                this.do_session = true;
            }
        }

        if (!this.do_bind) {
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            return false;
        } else {
            this._addSysHandler(this._sasl_bind_cb.bind(this), null, null,
                                null, "_bind_auth_2");

            var resource = Strophe.getResourceFromJid(this.jid);
            if (resource) {
                this.send($iq({type: "set", id: "_bind_auth_2"})
                          .c('bind', {xmlns: Strophe.NS.BIND})
                          .c('resource', {}).t(resource).tree());
            } else {
                this.send($iq({type: "set", id: "_bind_auth_2"})
                          .c('bind', {xmlns: Strophe.NS.BIND})
                          .tree());
            }
        }
        return false;
    },

    /** PrivateFunction: _sasl_bind_cb
     *  _Private_ handler for binding result and session start.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _sasl_bind_cb: function (elem) {
        if (elem.getAttribute("type") === "error") {
            Strophe.info("SASL binding failed.");
            var conflict = elem.getElementsByTagName("conflict"), condition;
            if (conflict.length > 0) {
                condition = 'conflict';
            }
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, condition);
            return false;
        }

        // TODO - need to grab errors
        var bind = elem.getElementsByTagName("bind");
        var jidNode;
        if (bind.length > 0) {
            // Grab jid
            jidNode = bind[0].getElementsByTagName("jid");
            if (jidNode.length > 0) {
                this.jid = Strophe.getText(jidNode[0]);

                if (this.do_session) {
                    this._addSysHandler(this._sasl_session_cb.bind(this),
                                        null, null, null, "_session_auth_2");

                    this.send($iq({type: "set", id: "_session_auth_2"})
                                  .c('session', {xmlns: Strophe.NS.SESSION})
                                  .tree());
                } else {
                    this.authenticated = true;
                    this._changeConnectStatus(Strophe.Status.CONNECTED, null);
                }
            }
        } else {
            Strophe.info("SASL binding failed.");
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            return false;
        }
    },

    /** PrivateFunction: _sasl_session_cb
     *  _Private_ handler to finish successful SASL connection.
     *
     *  This sets Connection.authenticated to true on success, which
     *  starts the processing of user handlers.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _sasl_session_cb: function (elem) {
        if (elem.getAttribute("type") === "result") {
            this.authenticated = true;
            this._changeConnectStatus(Strophe.Status.CONNECTED, null);
        } else if (elem.getAttribute("type") === "error") {
            Strophe.info("Session creation failed.");
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            return false;
        }
        return false;
    },

    /** PrivateFunction: _sasl_failure_cb
     *  _Private_ handler for SASL authentication failure.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    /* jshint unused:false */
    _sasl_failure_cb: function (elem) {
        // delete unneeded handlers
        if (this._sasl_success_handler) {
            this.deleteHandler(this._sasl_success_handler);
            this._sasl_success_handler = null;
        }
        if (this._sasl_challenge_handler) {
            this.deleteHandler(this._sasl_challenge_handler);
            this._sasl_challenge_handler = null;
        }

        if(this._sasl_mechanism)
          this._sasl_mechanism.onFailure();
        this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
        return false;
    },
    /* jshint unused:true */

    /** PrivateFunction: _auth2_cb
     *  _Private_ handler to finish legacy authentication.
     *
     *  This handler is called when the result from the jabber:iq:auth
     *  <iq/> stanza is returned.
     *
     *  Parameters:
     *    (XMLElement) elem - The stanza that triggered the callback.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _auth2_cb: function (elem) {
        if (elem.getAttribute("type") === "result") {
            this.authenticated = true;
            this._changeConnectStatus(Strophe.Status.CONNECTED, null);
        } else if (elem.getAttribute("type") === "error") {
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            this.disconnect('authentication failed');
        }
        return false;
    },

    /** PrivateFunction: _addSysTimedHandler
     *  _Private_ function to add a system level timed handler.
     *
     *  This function is used to add a Strophe.TimedHandler for the
     *  library code.  System timed handlers are allowed to run before
     *  authentication is complete.
     *
     *  Parameters:
     *    (Integer) period - The period of the handler.
     *    (Function) handler - The callback function.
     */
    _addSysTimedHandler: function (period, handler) {
        var thand = new Strophe.TimedHandler(period, handler);
        thand.user = false;
        this.addTimeds.push(thand);
        return thand;
    },

    /** PrivateFunction: _addSysHandler
     *  _Private_ function to add a system level stanza handler.
     *
     *  This function is used to add a Strophe.Handler for the
     *  library code.  System stanza handlers are allowed to run before
     *  authentication is complete.
     *
     *  Parameters:
     *    (Function) handler - The callback function.
     *    (String) ns - The namespace to match.
     *    (String) name - The stanza name to match.
     *    (String) type - The stanza type attribute to match.
     *    (String) id - The stanza id attribute to match.
     */
    _addSysHandler: function (handler, ns, name, type, id) {
        var hand = new Strophe.Handler(handler, ns, name, type, id);
        hand.user = false;
        this.addHandlers.push(hand);
        return hand;
    },

    /** PrivateFunction: _onDisconnectTimeout
     *  _Private_ timeout handler for handling non-graceful disconnection.
     *
     *  If the graceful disconnect process does not complete within the
     *  time allotted, this handler finishes the disconnect anyway.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _onDisconnectTimeout: function () {
        Strophe.info("_onDisconnectTimeout was called");
        this._changeConnectStatus(Strophe.Status.CONNTIMEOUT, null);
        this._proto._onDisconnectTimeout();
        // actually disconnect
        this._doDisconnect();
        return false;
    },

    /** PrivateFunction: _onIdle
     *  _Private_ handler to process events during idle cycle.
     *
     *  This handler is called every 100ms to fire timed handlers that
     *  are ready and keep poll requests going.
     */
    _onIdle: function () {
        var i, thand, since, newList;

        // add timed handlers scheduled for addition
        // NOTE: we add before remove in the case a timed handler is
        // added and then deleted before the next _onIdle() call.
        while (this.addTimeds.length > 0) {
            this.timedHandlers.push(this.addTimeds.pop());
        }

        // remove timed handlers that have been scheduled for deletion
        while (this.removeTimeds.length > 0) {
            thand = this.removeTimeds.pop();
            i = this.timedHandlers.indexOf(thand);
            if (i >= 0) {
                this.timedHandlers.splice(i, 1);
            }
        }

        // call ready timed handlers
        var now = new Date().getTime();
        newList = [];
        for (i = 0; i < this.timedHandlers.length; i++) {
            thand = this.timedHandlers[i];
            if (this.authenticated || !thand.user) {
                since = thand.lastCalled + thand.period;
                if (since - now <= 0) {
                    if (thand.run()) {
                        newList.push(thand);
                    }
                } else {
                    newList.push(thand);
                }
            }
        }
        this.timedHandlers = newList;

        clearTimeout(this._idleTimeout);

        this._proto._onIdle();

        // reactivate the timer only if connected
        if (this.connected) {
            // XXX: setTimeout should be called only with function expressions (23974bc1)
            this._idleTimeout = setTimeout(function() {
                this._onIdle();
            }.bind(this), 100);
        }
    }
};

/** Class: Strophe.SASLMechanism
 *
 *  encapsulates SASL authentication mechanisms.
 *
 *  User code may override the priority for each mechanism or disable it completely.
 *  See <priority> for information about changing priority and <test> for informatian on
 *  how to disable a mechanism.
 *
 *  By default, all mechanisms are enabled and the priorities are
 *
 *      OAUTHBEARER - 60
 *      SCRAM-SHA1 - 50
 *      DIGEST-MD5 - 40
 *      PLAIN - 30
 *      ANONYMOUS - 20
 *      EXTERNAL - 10
 *
 *  See: Strophe.Connection.addSupportedSASLMechanisms
 */

/**
 * PrivateConstructor: Strophe.SASLMechanism
 * SASL auth mechanism abstraction.
 *
 *  Parameters:
 *    (String) name - SASL Mechanism name.
 *    (Boolean) isClientFirst - If client should send response first without challenge.
 *    (Number) priority - Priority.
 *
 *  Returns:
 *    A new Strophe.SASLMechanism object.
 */
Strophe.SASLMechanism = function(name, isClientFirst, priority) {
  /** PrivateVariable: name
   *  Mechanism name.
   */
  this.name = name;
  /** PrivateVariable: isClientFirst
   *  If client sends response without initial server challenge.
   */
  this.isClientFirst = isClientFirst;
  /** Variable: priority
   *  Determines which <SASLMechanism> is chosen for authentication (Higher is better).
   *  Users may override this to prioritize mechanisms differently.
   *
   *  In the default configuration the priorities are
   *
   *  SCRAM-SHA1 - 40
   *  DIGEST-MD5 - 30
   *  Plain - 20
   *
   *  Example: (This will cause Strophe to choose the mechanism that the server sent first)
   *
   *  > Strophe.SASLMD5.priority = Strophe.SASLSHA1.priority;
   *
   *  See <SASL mechanisms> for a list of available mechanisms.
   *
   */
  this.priority = priority;
};

Strophe.SASLMechanism.prototype = {
  /**
   *  Function: test
   *  Checks if mechanism able to run.
   *  To disable a mechanism, make this return false;
   *
   *  To disable plain authentication run
   *  > Strophe.SASLPlain.test = function() {
   *  >   return false;
   *  > }
   *
   *  See <SASL mechanisms> for a list of available mechanisms.
   *
   *  Parameters:
   *    (Strophe.Connection) connection - Target Connection.
   *
   *  Returns:
   *    (Boolean) If mechanism was able to run.
   */
  /* jshint unused:false */
  test: function(connection) {
    return true;
  },
  /* jshint unused:true */

  /** PrivateFunction: onStart
   *  Called before starting mechanism on some connection.
   *
   *  Parameters:
   *    (Strophe.Connection) connection - Target Connection.
   */
  onStart: function(connection) {
    this._connection = connection;
  },

  /** PrivateFunction: onChallenge
   *  Called by protocol implementation on incoming challenge. If client is
   *  first (isClientFirst === true) challenge will be null on the first call.
   *
   *  Parameters:
   *    (Strophe.Connection) connection - Target Connection.
   *    (String) challenge - current challenge to handle.
   *
   *  Returns:
   *    (String) Mechanism response.
   */
  /* jshint unused:false */
  onChallenge: function(connection, challenge) {
    throw new Error("You should implement challenge handling!");
  },
  /* jshint unused:true */

  /** PrivateFunction: onFailure
   *  Protocol informs mechanism implementation about SASL failure.
   */
  onFailure: function() {
    this._connection = null;
  },

  /** PrivateFunction: onSuccess
   *  Protocol informs mechanism implementation about SASL success.
   */
  onSuccess: function() {
    this._connection = null;
  }
};

  /** Constants: SASL mechanisms
   *  Available authentication mechanisms
   *
   *  Strophe.SASLAnonymous - SASL ANONYMOUS authentication.
   *  Strophe.SASLPlain - SASL PLAIN authentication.
   *  Strophe.SASLMD5 - SASL DIGEST-MD5 authentication
   *  Strophe.SASLSHA1 - SASL SCRAM-SHA1 authentication
   *  Strophe.SASLOAuthBearer - SASL OAuth Bearer authentication
   *  Strophe.SASLExternal - SASL EXTERNAL authentication
   */

// Building SASL callbacks

/** PrivateConstructor: SASLAnonymous
 *  SASL ANONYMOUS authentication.
 */
Strophe.SASLAnonymous = function() {};
Strophe.SASLAnonymous.prototype = new Strophe.SASLMechanism("ANONYMOUS", false, 20);

Strophe.SASLAnonymous.prototype.test = function(connection) {
    return connection.authcid === null;
};


/** PrivateConstructor: SASLPlain
 *  SASL PLAIN authentication.
 */
Strophe.SASLPlain = function() {};
Strophe.SASLPlain.prototype = new Strophe.SASLMechanism("PLAIN", true, 30);

Strophe.SASLPlain.prototype.test = function(connection) {
    return connection.authcid !== null;
};

Strophe.SASLPlain.prototype.onChallenge = function(connection) {
    var auth_str = connection.authzid;
    auth_str = auth_str + "\u0000";
    auth_str = auth_str + connection.authcid;
    auth_str = auth_str + "\u0000";
    auth_str = auth_str + connection.pass;
    return utils.utf16to8(auth_str);
};


/** PrivateConstructor: SASLSHA1
 *  SASL SCRAM SHA 1 authentication.
 */
Strophe.SASLSHA1 = function() {};
Strophe.SASLSHA1.prototype = new Strophe.SASLMechanism("SCRAM-SHA-1", true, 50);

Strophe.SASLSHA1.prototype.test = function(connection) {
    return connection.authcid !== null;
};

Strophe.SASLSHA1.prototype.onChallenge = function(connection, challenge, test_cnonce) {
  var cnonce = test_cnonce || MD5.hexdigest(Math.random() * 1234567890);
  var auth_str = "n=" + utils.utf16to8(connection.authcid);
  auth_str += ",r=";
  auth_str += cnonce;
  connection._sasl_data.cnonce = cnonce;
  connection._sasl_data["client-first-message-bare"] = auth_str;

  auth_str = "n,," + auth_str;

  this.onChallenge = function (connection, challenge) {
    var nonce, salt, iter, Hi, U, U_old, i, k, pass;
    var clientKey, serverKey, clientSignature;
    var responseText = "c=biws,";
    var authMessage = connection._sasl_data["client-first-message-bare"] + "," +
      challenge + ",";
    var cnonce = connection._sasl_data.cnonce;
    var attribMatch = /([a-z]+)=([^,]+)(,|$)/;

    while (challenge.match(attribMatch)) {
      var matches = challenge.match(attribMatch);
      challenge = challenge.replace(matches[0], "");
      switch (matches[1]) {
      case "r":
        nonce = matches[2];
        break;
      case "s":
        salt = matches[2];
        break;
      case "i":
        iter = matches[2];
        break;
      }
    }

    if (nonce.substr(0, cnonce.length) !== cnonce) {
      connection._sasl_data = {};
      return connection._sasl_failure_cb();
    }

    responseText += "r=" + nonce;
    authMessage += responseText;

    salt = atob(salt);
    salt += "\x00\x00\x00\x01";

    pass = utils.utf16to8(connection.pass);
    Hi = U_old = SHA1.core_hmac_sha1(pass, salt);
    for (i = 1; i < iter; i++) {
      U = SHA1.core_hmac_sha1(pass, SHA1.binb2str(U_old));
      for (k = 0; k < 5; k++) {
        Hi[k] ^= U[k];
      }
      U_old = U;
    }
    Hi = SHA1.binb2str(Hi);

    clientKey = SHA1.core_hmac_sha1(Hi, "Client Key");
    serverKey = SHA1.str_hmac_sha1(Hi, "Server Key");
    clientSignature = SHA1.core_hmac_sha1(SHA1.str_sha1(SHA1.binb2str(clientKey)), authMessage);
    connection._sasl_data["server-signature"] = SHA1.b64_hmac_sha1(serverKey, authMessage);

    for (k = 0; k < 5; k++) {
      clientKey[k] ^= clientSignature[k];
    }

    responseText += ",p=" + btoa(SHA1.binb2str(clientKey));
    return responseText;
  }.bind(this);

  return auth_str;
};


/** PrivateConstructor: SASLMD5
 *  SASL DIGEST MD5 authentication.
 */
Strophe.SASLMD5 = function() {};
Strophe.SASLMD5.prototype = new Strophe.SASLMechanism("DIGEST-MD5", false, 40);

Strophe.SASLMD5.prototype.test = function(connection) {
    return connection.authcid !== null;
};

/** PrivateFunction: _quote
 *  _Private_ utility function to backslash escape and quote strings.
 *
 *  Parameters:
 *    (String) str - The string to be quoted.
 *
 *  Returns:
 *    quoted string
 */
Strophe.SASLMD5.prototype._quote = function (str) {
    return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
    //" end string workaround for emacs
};

Strophe.SASLMD5.prototype.onChallenge = function(connection, challenge, test_cnonce) {
  var attribMatch = /([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/;
  var cnonce = test_cnonce || MD5.hexdigest("" + (Math.random() * 1234567890));
  var realm = "";
  var host = null;
  var nonce = "";
  var qop = "";
  var matches;

  while (challenge.match(attribMatch)) {
    matches = challenge.match(attribMatch);
    challenge = challenge.replace(matches[0], "");
    matches[2] = matches[2].replace(/^"(.+)"$/, "$1");
    switch (matches[1]) {
    case "realm":
      realm = matches[2];
      break;
    case "nonce":
      nonce = matches[2];
      break;
    case "qop":
      qop = matches[2];
      break;
    case "host":
      host = matches[2];
      break;
    }
  }

  var digest_uri = connection.servtype + "/" + connection.domain;
  if (host !== null) {
    digest_uri = digest_uri + "/" + host;
  }

  var cred = utils.utf16to8(connection.authcid + ":" + realm + ":" + this._connection.pass);
  var A1 = MD5.hash(cred) + ":" + nonce + ":" + cnonce;
  var A2 = 'AUTHENTICATE:' + digest_uri;

  var responseText = "";
  responseText += 'charset=utf-8,';
  responseText += 'username=' + this._quote(utils.utf16to8(connection.authcid)) + ',';
  responseText += 'realm=' + this._quote(realm) + ',';
  responseText += 'nonce=' + this._quote(nonce) + ',';
  responseText += 'nc=00000001,';
  responseText += 'cnonce=' + this._quote(cnonce) + ',';
  responseText += 'digest-uri=' + this._quote(digest_uri) + ',';
  responseText += 'response=' + MD5.hexdigest(MD5.hexdigest(A1) + ":" +
                                              nonce + ":00000001:" +
                                              cnonce + ":auth:" +
                                              MD5.hexdigest(A2)) + ",";
  responseText += 'qop=auth';

  this.onChallenge = function () {
      return "";
  };
  return responseText;
};


/** PrivateConstructor: SASLOAuthBearer
 *  SASL OAuth Bearer authentication.
 */
Strophe.SASLOAuthBearer = function() {};
Strophe.SASLOAuthBearer.prototype = new Strophe.SASLMechanism("OAUTHBEARER", true, 60);

Strophe.SASLOAuthBearer.prototype.test = function(connection) {
    return connection.pass !== null;
};

Strophe.SASLOAuthBearer.prototype.onChallenge = function(connection) {
    var auth_str = 'n,';
    if (connection.authcid !== null) {
      auth_str = auth_str + 'a=' + connection.authzid;
    }
    auth_str = auth_str + ',';
    auth_str = auth_str + "\u0001";
    auth_str = auth_str + 'auth=Bearer ';
    auth_str = auth_str + connection.pass;
    auth_str = auth_str + "\u0001";
    auth_str = auth_str + "\u0001";

    return utils.utf16to8(auth_str);
};


/** PrivateConstructor: SASLExternal
 *  SASL EXTERNAL authentication.
 *
 *  The EXTERNAL mechanism allows a client to request the server to use
 *  credentials established by means external to the mechanism to
 *  authenticate the client. The external means may be, for instance,
 *  TLS services.
 */
Strophe.SASLExternal = function() {};
Strophe.SASLExternal.prototype = new Strophe.SASLMechanism("EXTERNAL", true, 10);

Strophe.SASLExternal.prototype.onChallenge = function(connection) {
    /** According to XEP-178, an authzid SHOULD NOT be presented when the
     * authcid contained or implied in the client certificate is the JID (i.e.
     * authzid) with which the user wants to log in as.
     *
     * To NOT send the authzid, the user should therefore set the authcid equal
     * to the JID when instantiating a new Strophe.Connection object.
     */
    return connection.authcid === connection.authzid ? '' : connection.authzid;
};

return {
    'Strophe':         Strophe,
    '$build':          $build,
    '$iq':             $iq,
    '$msg':            $msg,
    '$pres':           $pres,
    'SHA1':            SHA1,
    'MD5':             MD5,
    'b64_hmac_sha1':   SHA1.b64_hmac_sha1,
    'b64_sha1':        SHA1.b64_sha1,
    'str_hmac_sha1':   SHA1.str_hmac_sha1,
    'str_sha1':        SHA1.str_sha1
};
}));

/*
    This program is distributed under the terms of the MIT license.
    Please see the LICENSE file for details.

    Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/* global define, window, setTimeout, clearTimeout, XMLHttpRequest, ActiveXObject, Strophe, $build */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-bosh',['strophe-core'], function (core) {
            return factory(
                core.Strophe,
                core.$build
            );
        });
    } else {
        // Browser globals
        return factory(Strophe, $build);
    }
}(this, function (Strophe, $build) {

/** PrivateClass: Strophe.Request
 *  _Private_ helper class that provides a cross implementation abstraction
 *  for a BOSH related XMLHttpRequest.
 *
 *  The Strophe.Request class is used internally to encapsulate BOSH request
 *  information.  It is not meant to be used from user's code.
 */

/** PrivateConstructor: Strophe.Request
 *  Create and initialize a new Strophe.Request object.
 *
 *  Parameters:
 *    (XMLElement) elem - The XML data to be sent in the request.
 *    (Function) func - The function that will be called when the
 *      XMLHttpRequest readyState changes.
 *    (Integer) rid - The BOSH rid attribute associated with this request.
 *    (Integer) sends - The number of times this same request has been sent.
 */
Strophe.Request = function (elem, func, rid, sends) {
    this.id = ++Strophe._requestId;
    this.xmlData = elem;
    this.data = Strophe.serialize(elem);
    // save original function in case we need to make a new request
    // from this one.
    this.origFunc = func;
    this.func = func;
    this.rid = rid;
    this.date = NaN;
    this.sends = sends || 0;
    this.abort = false;
    this.dead = null;

    this.age = function () {
        if (!this.date) { return 0; }
        var now = new Date();
        return (now - this.date) / 1000;
    };
    this.timeDead = function () {
        if (!this.dead) { return 0; }
        var now = new Date();
        return (now - this.dead) / 1000;
    };
    this.xhr = this._newXHR();
};

Strophe.Request.prototype = {
    /** PrivateFunction: getResponse
     *  Get a response from the underlying XMLHttpRequest.
     *
     *  This function attempts to get a response from the request and checks
     *  for errors.
     *
     *  Throws:
     *    "parsererror" - A parser error occured.
     *    "badformat" - The entity has sent XML that cannot be processed.
     *
     *  Returns:
     *    The DOM element tree of the response.
     */
    getResponse: function () {
        var node = null;
        if (this.xhr.responseXML && this.xhr.responseXML.documentElement) {
            node = this.xhr.responseXML.documentElement;
            if (node.tagName === "parsererror") {
                Strophe.error("invalid response received");
                Strophe.error("responseText: " + this.xhr.responseText);
                Strophe.error("responseXML: " +
                              Strophe.serialize(this.xhr.responseXML));
                throw "parsererror";
            }
        } else if (this.xhr.responseText) {
            Strophe.error("invalid response received");
            Strophe.error("responseText: " + this.xhr.responseText);
            throw "badformat";
        }

        return node;
    },

    /** PrivateFunction: _newXHR
     *  _Private_ helper function to create XMLHttpRequests.
     *
     *  This function creates XMLHttpRequests across all implementations.
     *
     *  Returns:
     *    A new XMLHttpRequest.
     */
    _newXHR: function () {
        var xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("text/xml; charset=utf-8");
            }
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        // use Function.bind() to prepend ourselves as an argument
        xhr.onreadystatechange = this.func.bind(null, this);
        return xhr;
    }
};

/** Class: Strophe.Bosh
 *  _Private_ helper class that handles BOSH Connections
 *
 *  The Strophe.Bosh class is used internally by Strophe.Connection
 *  to encapsulate BOSH sessions. It is not meant to be used from user's code.
 */

/** File: bosh.js
 *  A JavaScript library to enable BOSH in Strophejs.
 *
 *  this library uses Bidirectional-streams Over Synchronous HTTP (BOSH)
 *  to emulate a persistent, stateful, two-way connection to an XMPP server.
 *  More information on BOSH can be found in XEP 124.
 */

/** PrivateConstructor: Strophe.Bosh
 *  Create and initialize a Strophe.Bosh object.
 *
 *  Parameters:
 *    (Strophe.Connection) connection - The Strophe.Connection that will use BOSH.
 *
 *  Returns:
 *    A new Strophe.Bosh object.
 */
Strophe.Bosh = function(connection) {
    this._conn = connection;
    /* request id for body tags */
    this.rid = Math.floor(Math.random() * 4294967295);
    /* The current session ID. */
    this.sid = null;

    // default BOSH values
    this.hold = 1;
    this.wait = 60;
    this.window = 5;
    this.errors = 0;
    this.inactivity = null;

    this._requests = [];
};

Strophe.Bosh.prototype = {
    /** Variable: strip
     *
     *  BOSH-Connections will have all stanzas wrapped in a <body> tag when
     *  passed to <Strophe.Connection.xmlInput> or <Strophe.Connection.xmlOutput>.
     *  To strip this tag, User code can set <Strophe.Bosh.strip> to "body":
     *
     *  > Strophe.Bosh.prototype.strip = "body";
     *
     *  This will enable stripping of the body tag in both
     *  <Strophe.Connection.xmlInput> and <Strophe.Connection.xmlOutput>.
     */
    strip: null,

    /** PrivateFunction: _buildBody
     *  _Private_ helper function to generate the <body/> wrapper for BOSH.
     *
     *  Returns:
     *    A Strophe.Builder with a <body/> element.
     */
    _buildBody: function () {
        var bodyWrap = $build('body', {
            rid: this.rid++,
            xmlns: Strophe.NS.HTTPBIND
        });
        if (this.sid !== null) {
            bodyWrap.attrs({sid: this.sid});
        }
        if (this._conn.options.keepalive && this._conn._sessionCachingSupported()) {
            this._cacheSession();
        }
        return bodyWrap;
    },

    /** PrivateFunction: _reset
     *  Reset the connection.
     *
     *  This function is called by the reset function of the Strophe Connection
     */
    _reset: function () {
        this.rid = Math.floor(Math.random() * 4294967295);
        this.sid = null;
        this.errors = 0;
        if (this._conn._sessionCachingSupported()) {
            window.sessionStorage.removeItem('strophe-bosh-session');
        }

        this._conn.nextValidRid(this.rid);
    },

    /** PrivateFunction: _connect
     *  _Private_ function that initializes the BOSH connection.
     *
     *  Creates and sends the Request that initializes the BOSH connection.
     */
    _connect: function (wait, hold, route) {
        this.wait = wait || this.wait;
        this.hold = hold || this.hold;
        this.errors = 0;

        // build the body tag
        var body = this._buildBody().attrs({
            to: this._conn.domain,
            "xml:lang": "en",
            wait: this.wait,
            hold: this.hold,
            content: "text/xml; charset=utf-8",
            ver: "1.6",
            "xmpp:version": "1.0",
            "xmlns:xmpp": Strophe.NS.BOSH
        });

        if(route){
            body.attrs({
                route: route
            });
        }

        var _connect_cb = this._conn._connect_cb;

        this._requests.push(
            new Strophe.Request(body.tree(),
                                this._onRequestStateChange.bind(
                                    this, _connect_cb.bind(this._conn)),
                                body.tree().getAttribute("rid")));
        this._throttledRequestHandler();
    },

    /** PrivateFunction: _attach
     *  Attach to an already created and authenticated BOSH session.
     *
     *  This function is provided to allow Strophe to attach to BOSH
     *  sessions which have been created externally, perhaps by a Web
     *  application.  This is often used to support auto-login type features
     *  without putting user credentials into the page.
     *
     *  Parameters:
     *    (String) jid - The full JID that is bound by the session.
     *    (String) sid - The SID of the BOSH session.
     *    (String) rid - The current RID of the BOSH session.  This RID
     *      will be used by the next request.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
     */
    _attach: function (jid, sid, rid, callback, wait, hold, wind) {
        this._conn.jid = jid;
        this.sid = sid;
        this.rid = rid;

        this._conn.connect_callback = callback;

        this._conn.domain = Strophe.getDomainFromJid(this._conn.jid);

        this._conn.authenticated = true;
        this._conn.connected = true;

        this.wait = wait || this.wait;
        this.hold = hold || this.hold;
        this.window = wind || this.window;

        this._conn._changeConnectStatus(Strophe.Status.ATTACHED, null);
    },

    /** PrivateFunction: _restore
     *  Attempt to restore a cached BOSH session
     *
     *  Parameters:
     *    (String) jid - The full JID that is bound by the session.
     *      This parameter is optional but recommended, specifically in cases
     *      where prebinded BOSH sessions are used where it's important to know
     *      that the right session is being restored.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
     */
    _restore: function (jid, callback, wait, hold, wind) {
        var session = JSON.parse(window.sessionStorage.getItem('strophe-bosh-session'));
        if (typeof session !== "undefined" &&
                   session !== null &&
                   session.rid &&
                   session.sid &&
                   session.jid &&
                   (    typeof jid === "undefined" ||
                        jid === null ||
                        Strophe.getBareJidFromJid(session.jid) === Strophe.getBareJidFromJid(jid) ||
                        // If authcid is null, then it's an anonymous login, so
                        // we compare only the domains:
                        ((Strophe.getNodeFromJid(jid) === null) && (Strophe.getDomainFromJid(session.jid) === jid))
                    )
        ) {
            this._conn.restored = true;
            this._attach(session.jid, session.sid, session.rid, callback, wait, hold, wind);
        } else {
            throw { name: "StropheSessionError", message: "_restore: no restoreable session." };
        }
    },

    /** PrivateFunction: _cacheSession
     *  _Private_ handler for the beforeunload event.
     *
     *  This handler is used to process the Bosh-part of the initial request.
     *  Parameters:
     *    (Strophe.Request) bodyWrap - The received stanza.
     */
    _cacheSession: function () {
        if (this._conn.authenticated) {
            if (this._conn.jid && this.rid && this.sid) {
                window.sessionStorage.setItem('strophe-bosh-session', JSON.stringify({
                    'jid': this._conn.jid,
                    'rid': this.rid,
                    'sid': this.sid
                }));
            }
        } else {
            window.sessionStorage.removeItem('strophe-bosh-session');
        }
    },

    /** PrivateFunction: _connect_cb
     *  _Private_ handler for initial connection request.
     *
     *  This handler is used to process the Bosh-part of the initial request.
     *  Parameters:
     *    (Strophe.Request) bodyWrap - The received stanza.
     */
    _connect_cb: function (bodyWrap) {
        var typ = bodyWrap.getAttribute("type");
        var cond, conflict;
        if (typ !== null && typ === "terminate") {
            // an error occurred
            cond = bodyWrap.getAttribute("condition");
            Strophe.error("BOSH-Connection failed: " + cond);
            conflict = bodyWrap.getElementsByTagName("conflict");
            if (cond !== null) {
                if (cond === "remote-stream-error" && conflict.length > 0) {
                    cond = "conflict";
                }
                this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, cond);
            } else {
                this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown");
            }
            this._conn._doDisconnect(cond);
            return Strophe.Status.CONNFAIL;
        }

        // check to make sure we don't overwrite these if _connect_cb is
        // called multiple times in the case of missing stream:features
        if (!this.sid) {
            this.sid = bodyWrap.getAttribute("sid");
        }
        var wind = bodyWrap.getAttribute('requests');
        if (wind) { this.window = parseInt(wind, 10); }
        var hold = bodyWrap.getAttribute('hold');
        if (hold) { this.hold = parseInt(hold, 10); }
        var wait = bodyWrap.getAttribute('wait');
        if (wait) { this.wait = parseInt(wait, 10); }
        var inactivity = bodyWrap.getAttribute('inactivity');
        if (inactivity) { this.inactivity = parseInt(inactivity, 10); }
    },

    /** PrivateFunction: _disconnect
     *  _Private_ part of Connection.disconnect for Bosh
     *
     *  Parameters:
     *    (Request) pres - This stanza will be sent before disconnecting.
     */
    _disconnect: function (pres) {
        this._sendTerminate(pres);
    },

    /** PrivateFunction: _doDisconnect
     *  _Private_ function to disconnect.
     *
     *  Resets the SID and RID.
     */
    _doDisconnect: function () {
        this.sid = null;
        this.rid = Math.floor(Math.random() * 4294967295);
        if (this._conn._sessionCachingSupported()) {
            window.sessionStorage.removeItem('strophe-bosh-session');
        }

        this._conn.nextValidRid(this.rid);
    },

    /** PrivateFunction: _emptyQueue
     * _Private_ function to check if the Request queue is empty.
     *
     *  Returns:
     *    True, if there are no Requests queued, False otherwise.
     */
    _emptyQueue: function () {
        return this._requests.length === 0;
    },

    /** PrivateFunction: _callProtocolErrorHandlers
     *  _Private_ function to call error handlers registered for HTTP errors.
     *
     *  Parameters:
     *    (Strophe.Request) req - The request that is changing readyState.
     */
    _callProtocolErrorHandlers: function (req) {
        var reqStatus = this._getRequestStatus(req),
            err_callback;
        err_callback = this._conn.protocolErrorHandlers.HTTP[reqStatus];
        if (err_callback) {
            err_callback.call(this, reqStatus);
        }
    },

    /** PrivateFunction: _hitError
     *  _Private_ function to handle the error count.
     *
     *  Requests are resent automatically until their error count reaches
     *  5.  Each time an error is encountered, this function is called to
     *  increment the count and disconnect if the count is too high.
     *
     *  Parameters:
     *    (Integer) reqStatus - The request status.
     */
    _hitError: function (reqStatus) {
        this.errors++;
        Strophe.warn("request errored, status: " + reqStatus +
                     ", number of errors: " + this.errors);
        if (this.errors > 4) {
            this._conn._onDisconnectTimeout();
        }
    },

    /** PrivateFunction: _no_auth_received
     *
     * Called on stream start/restart when no stream:features
     * has been received and sends a blank poll request.
     */
    _no_auth_received: function (_callback) {
        if (_callback) {
            _callback = _callback.bind(this._conn);
        } else {
            _callback = this._conn._connect_cb.bind(this._conn);
        }
        var body = this._buildBody();
        this._requests.push(
                new Strophe.Request(body.tree(),
                    this._onRequestStateChange.bind(
                        this, _callback.bind(this._conn)),
                    body.tree().getAttribute("rid")));
        this._throttledRequestHandler();
    },

    /** PrivateFunction: _onDisconnectTimeout
     *  _Private_ timeout handler for handling non-graceful disconnection.
     *
     *  Cancels all remaining Requests and clears the queue.
     */
    _onDisconnectTimeout: function () {
        this._abortAllRequests();
    },

    /** PrivateFunction: _abortAllRequests
     *  _Private_ helper function that makes sure all pending requests are aborted.
     */
    _abortAllRequests: function _abortAllRequests() {
        var req;
        while (this._requests.length > 0) {
            req = this._requests.pop();
            req.abort = true;
            req.xhr.abort();
            // jslint complains, but this is fine. setting to empty func
            // is necessary for IE6
            req.xhr.onreadystatechange = function () {}; // jshint ignore:line
        }
    },

    /** PrivateFunction: _onIdle
     *  _Private_ handler called by Strophe.Connection._onIdle
     *
     *  Sends all queued Requests or polls with empty Request if there are none.
     */
    _onIdle: function () {
        var data = this._conn._data;
        // if no requests are in progress, poll
        if (this._conn.authenticated && this._requests.length === 0 &&
            data.length === 0 && !this._conn.disconnecting) {
            Strophe.info("no requests during idle cycle, sending " +
                         "blank request");
            data.push(null);
        }

        if (this._conn.paused) {
            return;
        }

        if (this._requests.length < 2 && data.length > 0) {
            var body = this._buildBody();
            for (var i = 0; i < data.length; i++) {
                if (data[i] !== null) {
                    if (data[i] === "restart") {
                        body.attrs({
                            to: this._conn.domain,
                            "xml:lang": "en",
                            "xmpp:restart": "true",
                            "xmlns:xmpp": Strophe.NS.BOSH
                        });
                    } else {
                        body.cnode(data[i]).up();
                    }
                }
            }
            delete this._conn._data;
            this._conn._data = [];
            this._requests.push(
                new Strophe.Request(body.tree(),
                                    this._onRequestStateChange.bind(
                                        this, this._conn._dataRecv.bind(this._conn)),
                                    body.tree().getAttribute("rid")));
            this._throttledRequestHandler();
        }

        if (this._requests.length > 0) {
            var time_elapsed = this._requests[0].age();
            if (this._requests[0].dead !== null) {
                if (this._requests[0].timeDead() >
                    Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait)) {
                    this._throttledRequestHandler();
                }
            }

            if (time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait)) {
                Strophe.warn("Request " +
                             this._requests[0].id +
                             " timed out, over " + Math.floor(Strophe.TIMEOUT * this.wait) +
                             " seconds since last activity");
                this._throttledRequestHandler();
            }
        }
    },

    /** PrivateFunction: _getRequestStatus
     *
     *  Returns the HTTP status code from a Strophe.Request
     *
     *  Parameters:
     *    (Strophe.Request) req - The Strophe.Request instance.
     *    (Integer) def - The default value that should be returned if no
     *          status value was found.
     */
    _getRequestStatus: function (req, def) {
        var reqStatus;
        if (req.xhr.readyState === 4) {
            try {
                reqStatus = req.xhr.status;
            } catch (e) {
                // ignore errors from undefined status attribute. Works
                // around a browser bug
                Strophe.error(
                    "Caught an error while retrieving a request's status, " +
                    "reqStatus: " + reqStatus);
            }
        }
        if (typeof(reqStatus) === "undefined") {
            reqStatus = typeof def === 'number' ? def : 0;
        }
        return reqStatus;
    },

    /** PrivateFunction: _onRequestStateChange
     *  _Private_ handler for Strophe.Request state changes.
     *
     *  This function is called when the XMLHttpRequest readyState changes.
     *  It contains a lot of error handling logic for the many ways that
     *  requests can fail, and calls the request callback when requests
     *  succeed.
     *
     *  Parameters:
     *    (Function) func - The handler for the request.
     *    (Strophe.Request) req - The request that is changing readyState.
     */
    _onRequestStateChange: function (func, req) {
        Strophe.debug("request id "+req.id+"."+req.sends+
                      " state changed to "+req.xhr.readyState);
        if (req.abort) {
            req.abort = false;
            return;
        }
        if (req.xhr.readyState !== 4) {
            // The request is not yet complete
            return;
        }
        var reqStatus = this._getRequestStatus(req);
        if (this.disconnecting && reqStatus >= 400) {
            this._hitError(reqStatus);
            this._callProtocolErrorHandlers(req);
            return;
        }

        var valid_request = reqStatus > 0 && reqStatus < 500;
        var too_many_retries = req.sends > this._conn.maxRetries;
        if (valid_request || too_many_retries) {
            // remove from internal queue
            this._removeRequest(req);
            Strophe.debug("request id "+req.id+" should now be removed");
        }

        if (reqStatus === 200) {
            // request succeeded
            var reqIs0 = (this._requests[0] === req);
            var reqIs1 = (this._requests[1] === req);
            // if request 1 finished, or request 0 finished and request
            // 1 is over Strophe.SECONDARY_TIMEOUT seconds old, we need to
            // restart the other - both will be in the first spot, as the
            // completed request has been removed from the queue already
            if (reqIs1 ||
                (reqIs0 && this._requests.length > 0 &&
                    this._requests[0].age() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait))) {
                this._restartRequest(0);
            }
            this._conn.nextValidRid(Number(req.rid) + 1);
            Strophe.debug("request id "+req.id+"."+req.sends+" got 200");
            func(req); // call handler
            this.errors = 0;
        } else if (reqStatus === 0 ||
                   (reqStatus >= 400 && reqStatus < 600) ||
                   reqStatus >= 12000) {
            // request failed
            Strophe.error("request id "+req.id+"."+req.sends+" error "+reqStatus+" happened");
            this._hitError(reqStatus);
            this._callProtocolErrorHandlers(req);
            if (reqStatus >= 400 && reqStatus < 500) {
                this._conn._changeConnectStatus(Strophe.Status.DISCONNECTING, null);
                this._conn._doDisconnect();
            }
        } else {
            Strophe.error("request id "+req.id+"."+req.sends+" error "+reqStatus+" happened");
        }

        if (!valid_request && !too_many_retries) {
            this._throttledRequestHandler();
        } else if (too_many_retries && !this._conn.connected) {
            this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "giving-up");
        }
    },

    /** PrivateFunction: _processRequest
     *  _Private_ function to process a request in the queue.
     *
     *  This function takes requests off the queue and sends them and
     *  restarts dead requests.
     *
     *  Parameters:
     *    (Integer) i - The index of the request in the queue.
     */
    _processRequest: function (i) {
        var self = this;
        var req = this._requests[i];
        var reqStatus = this._getRequestStatus(req, -1);

        // make sure we limit the number of retries
        if (req.sends > this._conn.maxRetries) {
            this._conn._onDisconnectTimeout();
            return;
        }

        var time_elapsed = req.age();
        var primaryTimeout = (!isNaN(time_elapsed) &&
                              time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait));
        var secondaryTimeout = (req.dead !== null &&
                                req.timeDead() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait));
        var requestCompletedWithServerError = (req.xhr.readyState === 4 &&
                                               (reqStatus < 1 || reqStatus >= 500));
        if (primaryTimeout || secondaryTimeout ||
            requestCompletedWithServerError) {
            if (secondaryTimeout) {
                Strophe.error("Request " + this._requests[i].id +
                              " timed out (secondary), restarting");
            }
            req.abort = true;
            req.xhr.abort();
            // setting to null fails on IE6, so set to empty function
            req.xhr.onreadystatechange = function () {};
            this._requests[i] = new Strophe.Request(req.xmlData,
                                                    req.origFunc,
                                                    req.rid,
                                                    req.sends);
            req = this._requests[i];
        }

        if (req.xhr.readyState === 0) {
            Strophe.debug("request id "+req.id+"."+req.sends+" posting");

            try {
                var contentType = this._conn.options.contentType || "text/xml; charset=utf-8";
                req.xhr.open("POST", this._conn.service, this._conn.options.sync ? false : true);
                if (typeof req.xhr.setRequestHeader !== 'undefined') {
                    // IE9 doesn't have setRequestHeader
                    req.xhr.setRequestHeader("Content-Type", contentType);
                }
                if (this._conn.options.withCredentials) {
                    req.xhr.withCredentials = true;
                }
            } catch (e2) {
                Strophe.error("XHR open failed: " + e2.toString());
                if (!this._conn.connected) {
                    this._conn._changeConnectStatus(
                            Strophe.Status.CONNFAIL, "bad-service");
                }
                this._conn.disconnect();
                return;
            }

            // Fires the XHR request -- may be invoked immediately
            // or on a gradually expanding retry window for reconnects
            var sendFunc = function () {
                req.date = new Date();
                if (self._conn.options.customHeaders){
                    var headers = self._conn.options.customHeaders;
                    for (var header in headers) {
                        if (headers.hasOwnProperty(header)) {
                            req.xhr.setRequestHeader(header, headers[header]);
                        }
                    }
                }
                req.xhr.send(req.data);
            };

            // Implement progressive backoff for reconnects --
            // First retry (send === 1) should also be instantaneous
            if (req.sends > 1) {
                // Using a cube of the retry number creates a nicely
                // expanding retry window
                var backoff = Math.min(Math.floor(Strophe.TIMEOUT * this.wait),
                                       Math.pow(req.sends, 3)) * 1000;
                setTimeout(function() {
                    // XXX: setTimeout should be called only with function expressions (23974bc1)
                    sendFunc();
                }, backoff);
            } else {
                sendFunc();
            }

            req.sends++;

            if (this._conn.xmlOutput !== Strophe.Connection.prototype.xmlOutput) {
                if (req.xmlData.nodeName === this.strip && req.xmlData.childNodes.length) {
                    this._conn.xmlOutput(req.xmlData.childNodes[0]);
                } else {
                    this._conn.xmlOutput(req.xmlData);
                }
            }
            if (this._conn.rawOutput !== Strophe.Connection.prototype.rawOutput) {
                this._conn.rawOutput(req.data);
            }
        } else {
            Strophe.debug("_processRequest: " +
                          (i === 0 ? "first" : "second") +
                          " request has readyState of " +
                          req.xhr.readyState);
        }
    },

    /** PrivateFunction: _removeRequest
     *  _Private_ function to remove a request from the queue.
     *
     *  Parameters:
     *    (Strophe.Request) req - The request to remove.
     */
    _removeRequest: function (req) {
        Strophe.debug("removing request");
        var i;
        for (i = this._requests.length - 1; i >= 0; i--) {
            if (req === this._requests[i]) {
                this._requests.splice(i, 1);
            }
        }
        // IE6 fails on setting to null, so set to empty function
        req.xhr.onreadystatechange = function () {};
        this._throttledRequestHandler();
    },

    /** PrivateFunction: _restartRequest
     *  _Private_ function to restart a request that is presumed dead.
     *
     *  Parameters:
     *    (Integer) i - The index of the request in the queue.
     */
    _restartRequest: function (i) {
        var req = this._requests[i];
        if (req.dead === null) {
            req.dead = new Date();
        }

        this._processRequest(i);
    },

    /** PrivateFunction: _reqToData
     * _Private_ function to get a stanza out of a request.
     *
     * Tries to extract a stanza out of a Request Object.
     * When this fails the current connection will be disconnected.
     *
     *  Parameters:
     *    (Object) req - The Request.
     *
     *  Returns:
     *    The stanza that was passed.
     */
    _reqToData: function (req) {
        try {
            return req.getResponse();
        } catch (e) {
            if (e !== "parsererror") { throw e; }
            this._conn.disconnect("strophe-parsererror");
        }
    },

    /** PrivateFunction: _sendTerminate
     *  _Private_ function to send initial disconnect sequence.
     *
     *  This is the first step in a graceful disconnect.  It sends
     *  the BOSH server a terminate body and includes an unavailable
     *  presence if authentication has completed.
     */
    _sendTerminate: function (pres) {
        Strophe.info("_sendTerminate was called");
        var body = this._buildBody().attrs({type: "terminate"});
        if (pres) {
            body.cnode(pres.tree());
        }
        var req = new Strophe.Request(
            body.tree(),
            this._onRequestStateChange.bind(
            this, this._conn._dataRecv.bind(this._conn)),
            body.tree().getAttribute("rid")
        );
        this._requests.push(req);
        this._throttledRequestHandler();
    },

    /** PrivateFunction: _send
     *  _Private_ part of the Connection.send function for BOSH
     *
     * Just triggers the RequestHandler to send the messages that are in the queue
     */
    _send: function () {
        clearTimeout(this._conn._idleTimeout);
        this._throttledRequestHandler();

        // XXX: setTimeout should be called only with function expressions (23974bc1)
        this._conn._idleTimeout = setTimeout(function() {
            this._onIdle();
        }.bind(this._conn), 100);
    },

    /** PrivateFunction: _sendRestart
     *
     *  Send an xmpp:restart stanza.
     */
    _sendRestart: function () {
        this._throttledRequestHandler();
        clearTimeout(this._conn._idleTimeout);
    },

    /** PrivateFunction: _throttledRequestHandler
     *  _Private_ function to throttle requests to the connection window.
     *
     *  This function makes sure we don't send requests so fast that the
     *  request ids overflow the connection window in the case that one
     *  request died.
     */
    _throttledRequestHandler: function () {
        if (!this._requests) {
            Strophe.debug("_throttledRequestHandler called with " +
                          "undefined requests");
        } else {
            Strophe.debug("_throttledRequestHandler called with " +
                          this._requests.length + " requests");
        }

        if (!this._requests || this._requests.length === 0) {
            return;
        }

        if (this._requests.length > 0) {
            this._processRequest(0);
        }

        if (this._requests.length > 1 &&
            Math.abs(this._requests[0].rid -
                     this._requests[1].rid) < this.window) {
            this._processRequest(1);
        }
    }
};
return Strophe;
}));

/*
    This program is distributed under the terms of the MIT license.
    Please see the LICENSE file for details.

    Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/* global define, window, clearTimeout, WebSocket, DOMParser, Strophe, $build */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-websocket',['strophe-core'], function (core) {
            return factory(
                core.Strophe,
                core.$build
            );
        });
    } else {
        // Browser globals
        return factory(Strophe, $build);
    }
}(this, function (Strophe, $build) {

/** Class: Strophe.WebSocket
 *  _Private_ helper class that handles WebSocket Connections
 *
 *  The Strophe.WebSocket class is used internally by Strophe.Connection
 *  to encapsulate WebSocket sessions. It is not meant to be used from user's code.
 */

/** File: websocket.js
 *  A JavaScript library to enable XMPP over Websocket in Strophejs.
 *
 *  This file implements XMPP over WebSockets for Strophejs.
 *  If a Connection is established with a Websocket url (ws://...)
 *  Strophe will use WebSockets.
 *  For more information on XMPP-over-WebSocket see RFC 7395:
 *  http://tools.ietf.org/html/rfc7395
 *
 *  WebSocket support implemented by Andreas Guth (andreas.guth@rwth-aachen.de)
 */

/** PrivateConstructor: Strophe.Websocket
 *  Create and initialize a Strophe.WebSocket object.
 *  Currently only sets the connection Object.
 *
 *  Parameters:
 *    (Strophe.Connection) connection - The Strophe.Connection that will use WebSockets.
 *
 *  Returns:
 *    A new Strophe.WebSocket object.
 */
Strophe.Websocket = function(connection) {
    this._conn = connection;
    this.strip = "wrapper";

    var service = connection.service;
    if (service.indexOf("ws:") !== 0 && service.indexOf("wss:") !== 0) {
        // If the service is not an absolute URL, assume it is a path and put the absolute
        // URL together from options, current URL and the path.
        var new_service = "";

        if (connection.options.protocol === "ws" && window.location.protocol !== "https:") {
            new_service += "ws";
        } else {
            new_service += "wss";
        }

        new_service += "://" + window.location.host;

        if (service.indexOf("/") !== 0) {
            new_service += window.location.pathname + service;
        } else {
            new_service += service;
        }

        connection.service = new_service;
    }
};

Strophe.Websocket.prototype = {
    /** PrivateFunction: _buildStream
     *  _Private_ helper function to generate the <stream> start tag for WebSockets
     *
     *  Returns:
     *    A Strophe.Builder with a <stream> element.
     */
    _buildStream: function () {
        return $build("open", {
            "xmlns": Strophe.NS.FRAMING,
            "to": this._conn.domain,
            "version": '1.0'
        });
    },

    /** PrivateFunction: _check_streamerror
     * _Private_ checks a message for stream:error
     *
     *  Parameters:
     *    (Strophe.Request) bodyWrap - The received stanza.
     *    connectstatus - The ConnectStatus that will be set on error.
     *  Returns:
     *     true if there was a streamerror, false otherwise.
     */
    _check_streamerror: function (bodyWrap, connectstatus) {
        var errors;
        if (bodyWrap.getElementsByTagNameNS) {
            errors = bodyWrap.getElementsByTagNameNS(Strophe.NS.STREAM, "error");
        } else {
            errors = bodyWrap.getElementsByTagName("stream:error");
        }
        if (errors.length === 0) {
            return false;
        }
        var error = errors[0];

        var condition = "";
        var text = "";

        var ns = "urn:ietf:params:xml:ns:xmpp-streams";
        for (var i = 0; i < error.childNodes.length; i++) {
            var e = error.childNodes[i];
            if (e.getAttribute("xmlns") !== ns) {
                break;
            } if (e.nodeName === "text") {
                text = e.textContent;
            } else {
                condition = e.nodeName;
            }
        }

        var errorString = "WebSocket stream error: ";

        if (condition) {
            errorString += condition;
        } else {
            errorString += "unknown";
        }

        if (text) {
            errorString += " - " + text;
        }

        Strophe.error(errorString);

        // close the connection on stream_error
        this._conn._changeConnectStatus(connectstatus, condition);
        this._conn._doDisconnect();
        return true;
    },

    /** PrivateFunction: _reset
     *  Reset the connection.
     *
     *  This function is called by the reset function of the Strophe Connection.
     *  Is not needed by WebSockets.
     */
    _reset: function () {
        return;
    },

    /** PrivateFunction: _connect
     *  _Private_ function called by Strophe.Connection.connect
     *
     *  Creates a WebSocket for a connection and assigns Callbacks to it.
     *  Does nothing if there already is a WebSocket.
     */
    _connect: function () {
        // Ensure that there is no open WebSocket from a previous Connection.
        this._closeSocket();

        // Create the new WobSocket
        this.socket = new WebSocket(this._conn.service, "xmpp");
        this.socket.onopen = this._onOpen.bind(this);
        this.socket.onerror = this._onError.bind(this);
        this.socket.onclose = this._onClose.bind(this);
        this.socket.onmessage = this._connect_cb_wrapper.bind(this);
    },

    /** PrivateFunction: _connect_cb
     *  _Private_ function called by Strophe.Connection._connect_cb
     *
     * checks for stream:error
     *
     *  Parameters:
     *    (Strophe.Request) bodyWrap - The received stanza.
     */
    _connect_cb: function(bodyWrap) {
        var error = this._check_streamerror(bodyWrap, Strophe.Status.CONNFAIL);
        if (error) {
            return Strophe.Status.CONNFAIL;
        }
    },

    /** PrivateFunction: _handleStreamStart
     * _Private_ function that checks the opening <open /> tag for errors.
     *
     * Disconnects if there is an error and returns false, true otherwise.
     *
     *  Parameters:
     *    (Node) message - Stanza containing the <open /> tag.
     */
    _handleStreamStart: function(message) {
        var error = false;

        // Check for errors in the <open /> tag
        var ns = message.getAttribute("xmlns");
        if (typeof ns !== "string") {
            error = "Missing xmlns in <open />";
        } else if (ns !== Strophe.NS.FRAMING) {
            error = "Wrong xmlns in <open />: " + ns;
        }

        var ver = message.getAttribute("version");
        if (typeof ver !== "string") {
            error = "Missing version in <open />";
        } else if (ver !== "1.0") {
            error = "Wrong version in <open />: " + ver;
        }

        if (error) {
            this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, error);
            this._conn._doDisconnect();
            return false;
        }

        return true;
    },

    /** PrivateFunction: _connect_cb_wrapper
     * _Private_ function that handles the first connection messages.
     *
     * On receiving an opening stream tag this callback replaces itself with the real
     * message handler. On receiving a stream error the connection is terminated.
     */
    _connect_cb_wrapper: function(message) {
        if (message.data.indexOf("<open ") === 0 || message.data.indexOf("<?xml") === 0) {
            // Strip the XML Declaration, if there is one
            var data = message.data.replace(/^(<\?.*?\?>\s*)*/, "");
            if (data === '') return;

            var streamStart = new DOMParser().parseFromString(data, "text/xml").documentElement;
            this._conn.xmlInput(streamStart);
            this._conn.rawInput(message.data);

            //_handleStreamSteart will check for XML errors and disconnect on error
            if (this._handleStreamStart(streamStart)) {
                //_connect_cb will check for stream:error and disconnect on error
                this._connect_cb(streamStart);
            }
        } else if (message.data.indexOf("<close ") === 0) { // <close xmlns="urn:ietf:params:xml:ns:xmpp-framing />
            this._conn.rawInput(message.data);
            this._conn.xmlInput(message);
            var see_uri = message.getAttribute("see-other-uri");
            if (see_uri) {
                this._conn._changeConnectStatus(
                    Strophe.Status.REDIRECT,
                    "Received see-other-uri, resetting connection"
                );
                this._conn.reset();
                this._conn.service = see_uri;
                this._connect();
            } else {
                this._conn._changeConnectStatus(
                    Strophe.Status.CONNFAIL,
                    "Received closing stream"
                );
                this._conn._doDisconnect();
            }
        } else {
            var string = this._streamWrap(message.data);
            var elem = new DOMParser().parseFromString(string, "text/xml").documentElement;
            this.socket.onmessage = this._onMessage.bind(this);
            this._conn._connect_cb(elem, null, message.data);
        }
    },

    /** PrivateFunction: _disconnect
     *  _Private_ function called by Strophe.Connection.disconnect
     *
     *  Disconnects and sends a last stanza if one is given
     *
     *  Parameters:
     *    (Request) pres - This stanza will be sent before disconnecting.
     */
    _disconnect: function (pres) {
        if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
            if (pres) {
                this._conn.send(pres);
            }
            var close = $build("close", { "xmlns": Strophe.NS.FRAMING });
            this._conn.xmlOutput(close);
            var closeString = Strophe.serialize(close);
            this._conn.rawOutput(closeString);
            try {
                this.socket.send(closeString);
            } catch (e) {
                Strophe.info("Couldn't send <close /> tag.");
            }
        }
        this._conn._doDisconnect();
    },

    /** PrivateFunction: _doDisconnect
     *  _Private_ function to disconnect.
     *
     *  Just closes the Socket for WebSockets
     */
    _doDisconnect: function () {
        Strophe.info("WebSockets _doDisconnect was called");
        this._closeSocket();
    },

    /** PrivateFunction _streamWrap
     *  _Private_ helper function to wrap a stanza in a <stream> tag.
     *  This is used so Strophe can process stanzas from WebSockets like BOSH
     */
    _streamWrap: function (stanza) {
        return "<wrapper>" + stanza + '</wrapper>';
    },


    /** PrivateFunction: _closeSocket
     *  _Private_ function to close the WebSocket.
     *
     *  Closes the socket if it is still open and deletes it
     */
    _closeSocket: function () {
        if (this.socket) { try {
            this.socket.close();
        } catch (e) {} }
        this.socket = null;
    },

    /** PrivateFunction: _emptyQueue
     * _Private_ function to check if the message queue is empty.
     *
     *  Returns:
     *    True, because WebSocket messages are send immediately after queueing.
     */
    _emptyQueue: function () {
        return true;
    },

    /** PrivateFunction: _onClose
     * _Private_ function to handle websockets closing.
     *
     * Nothing to do here for WebSockets
     */
    _onClose: function(e) {
        if(this._conn.connected && !this._conn.disconnecting) {
            Strophe.error("Websocket closed unexpectedly");
            this._conn._doDisconnect();
        } else if (e && e.code === 1006 && !this._conn.connected && this.socket) {
            // in case the onError callback was not called (Safari 10 does not
            // call onerror when the initial connection fails) we need to
            // dispatch a CONNFAIL status update to be consistent with the
            // behavior on other browsers.
            Strophe.error("Websocket closed unexcectedly");
            this._conn._changeConnectStatus(
                Strophe.Status.CONNFAIL,
                "The WebSocket connection could not be established or was disconnected."
            );
            this._conn._doDisconnect();
        } else {
            Strophe.info("Websocket closed");
        }
    },

    /** PrivateFunction: _no_auth_received
     *
     * Called on stream start/restart when no stream:features
     * has been received.
     */
    _no_auth_received: function (_callback) {
        Strophe.error("Server did not send any auth methods");
        this._conn._changeConnectStatus(
            Strophe.Status.CONNFAIL,
            "Server did not send any auth methods"
        );
        if (_callback) {
            _callback = _callback.bind(this._conn);
            _callback();
        }
        this._conn._doDisconnect();
    },

    /** PrivateFunction: _onDisconnectTimeout
     *  _Private_ timeout handler for handling non-graceful disconnection.
     *
     *  This does nothing for WebSockets
     */
    _onDisconnectTimeout: function () {},

    /** PrivateFunction: _abortAllRequests
     *  _Private_ helper function that makes sure all pending requests are aborted.
     */
    _abortAllRequests: function () {},

    /** PrivateFunction: _onError
     * _Private_ function to handle websockets errors.
     *
     * Parameters:
     * (Object) error - The websocket error.
     */
    _onError: function(error) {
        Strophe.error("Websocket error " + error);
        this._conn._changeConnectStatus(
            Strophe.Status.CONNFAIL,
            "The WebSocket connection could not be established or was disconnected."
        );
        this._disconnect();
    },

    /** PrivateFunction: _onIdle
     *  _Private_ function called by Strophe.Connection._onIdle
     *
     *  sends all queued stanzas
     */
    _onIdle: function () {
        var data = this._conn._data;
        if (data.length > 0 && !this._conn.paused) {
            for (var i = 0; i < data.length; i++) {
                if (data[i] !== null) {
                    var stanza, rawStanza;
                    if (data[i] === "restart") {
                        stanza = this._buildStream().tree();
                    } else {
                        stanza = data[i];
                    }
                    rawStanza = Strophe.serialize(stanza);
                    this._conn.xmlOutput(stanza);
                    this._conn.rawOutput(rawStanza);
                    this.socket.send(rawStanza);
                }
            }
            this._conn._data = [];
        }
    },

    /** PrivateFunction: _onMessage
     * _Private_ function to handle websockets messages.
     *
     * This function parses each of the messages as if they are full documents.
     * [TODO : We may actually want to use a SAX Push parser].
     *
     * Since all XMPP traffic starts with
     *  <stream:stream version='1.0'
     *                 xml:lang='en'
     *                 xmlns='jabber:client'
     *                 xmlns:stream='http://etherx.jabber.org/streams'
     *                 id='3697395463'
     *                 from='SERVER'>
     *
     * The first stanza will always fail to be parsed.
     *
     * Additionally, the seconds stanza will always be <stream:features> with
     * the stream NS defined in the previous stanza, so we need to 'force'
     * the inclusion of the NS in this stanza.
     *
     * Parameters:
     * (string) message - The websocket message.
     */
    _onMessage: function(message) {
        var elem, data;
        // check for closing stream
        var close = '<close xmlns="urn:ietf:params:xml:ns:xmpp-framing" />';
        if (message.data === close) {
            this._conn.rawInput(close);
            this._conn.xmlInput(message);
            if (!this._conn.disconnecting) {
                this._conn._doDisconnect();
            }
            return;
        } else if (message.data.search("<open ") === 0) {
            // This handles stream restarts
            elem = new DOMParser().parseFromString(message.data, "text/xml").documentElement;
            if (!this._handleStreamStart(elem)) {
                return;
            }
        } else {
            data = this._streamWrap(message.data);
            elem = new DOMParser().parseFromString(data, "text/xml").documentElement;
        }

        if (this._check_streamerror(elem, Strophe.Status.ERROR)) {
            return;
        }

        //handle unavailable presence stanza before disconnecting
        if (this._conn.disconnecting &&
                elem.firstChild.nodeName === "presence" &&
                elem.firstChild.getAttribute("type") === "unavailable") {
            this._conn.xmlInput(elem);
            this._conn.rawInput(Strophe.serialize(elem));
            // if we are already disconnecting we will ignore the unavailable stanza and
            // wait for the </stream:stream> tag before we close the connection
            return;
        }
        this._conn._dataRecv(elem, message.data);
    },

    /** PrivateFunction: _onOpen
     * _Private_ function to handle websockets connection setup.
     *
     * The opening stream tag is sent here.
     */
    _onOpen: function() {
        Strophe.info("Websocket open");
        var start = this._buildStream();
        this._conn.xmlOutput(start.tree());

        var startString = Strophe.serialize(start);
        this._conn.rawOutput(startString);
        this.socket.send(startString);
    },

    /** PrivateFunction: _reqToData
     * _Private_ function to get a stanza out of a request.
     *
     * WebSockets don't use requests, so the passed argument is just returned.
     *
     *  Parameters:
     *    (Object) stanza - The stanza.
     *
     *  Returns:
     *    The stanza that was passed.
     */
    _reqToData: function (stanza) {
        return stanza;
    },

    /** PrivateFunction: _send
     *  _Private_ part of the Connection.send function for WebSocket
     *
     * Just flushes the messages that are in the queue
     */
    _send: function () {
        this._conn.flush();
    },

    /** PrivateFunction: _sendRestart
     *
     *  Send an xmpp:restart stanza.
     */
    _sendRestart: function () {
        clearTimeout(this._conn._idleTimeout);
        this._conn._onIdle.bind(this._conn)();
    }
};
return Strophe;
}));

(function(root){
    if(typeof define === 'function' && define.amd){
        define('strophe',[
            "strophe-core",
            "strophe-bosh",
            "strophe-websocket"
        ], function (wrapper) {
            return wrapper;
        });
    }
})(this);


require(["strophe-polyfill"]);
/* jshint ignore:start */
    //The modules for your project will be inlined above
    //this snippet. Ask almond to synchronously require the
    //module value for 'main' here and return it as the
    //value to use for the public API for the built file.
    return require('strophe');
}));
/* jshint ignore:end */





//****************************************************************************************************************
//****************************************************************************************************************
//****************************************************************************************************************



'use strict';
var Config = {};
Config.Emoji = {
    "00a9": ["\u00A9", ["copyright"]],
    "00ae": ["\u00AE", ["registered"]],
    "203c": ["\u203C", ["bangbang"]],
    "2049": ["\u2049", ["interrobang"]],
    "2122": ["\u2122", ["tm"]],
    "2139": ["\u2139", ["information_source"]],
    "2194": ["\u2194", ["left_right_arrow"]],
    "2195": ["\u2195", ["arrow_up_down"]],
    "2196": ["\u2196", ["arrow_upper_left"]],
    "2197": ["\u2197", ["arrow_upper_right"]],
    "2198": ["\u2198", ["arrow_lower_right"]],
    "2199": ["\u2199", ["arrow_lower_left"]],
    "21a9": ["\u21A9", ["leftwards_arrow_with_hook"]],
    "21aa": ["\u21AA", ["arrow_right_hook"]],
    "231a": ["\u231A", ["watch"]],
    "231b": ["\u231B", ["hourglass"]],
    "23e9": ["\u23E9", ["fast_forward"]],
    "23ea": ["\u23EA", ["rewind"]],
    "23eb": ["\u23EB", ["arrow_double_up"]],
    "23ec": ["\u23EC", ["arrow_double_down"]],
    "23f0": ["\u23F0", ["alarm_clock"]],
    "23f3": ["\u23F3", ["hourglass_flowing_sand"]],
    "24c2": ["\u24C2", ["m"]],
    "25aa": ["\u25AA", ["black_small_square"]],
    "25ab": ["\u25AB", ["white_small_square"]],
    "25b6": ["\u25B6", ["arrow_forward"]],
    "25c0": ["\u25C0", ["arrow_backward"]],
    "25fb": ["\u25FB", ["white_medium_square"]],
    "25fc": ["\u25FC", ["black_medium_square"]],
    "25fd": ["\u25FD", ["white_medium_small_square"]],
    "25fe": ["\u25FE", ["black_medium_small_square"]],
    "2600": ["\u2600", ["sunny"]],
    "2601": ["\u2601", ["cloud"]],
    "260e": ["\u260E", ["phone", "telephone"]],
    "2611": ["\u2611", ["ballot_box_with_check"]],
    "2614": ["\u2614", ["umbrella"]],
    "2615": ["\u2615", ["coffee"]],
    "261d": ["\u261D", ["point_up"]],
    "263a": ["\u263A", ["relaxed"]],
    "2648": ["\u2648", ["aries"]],
    "2649": ["\u2649", ["taurus"]],
    "264a": ["\u264A", ["gemini"]],
    "264b": ["\u264B", ["cancer"]],
    "264c": ["\u264C", ["leo"]],
    "264d": ["\u264D", ["virgo"]],
    "264e": ["\u264E", ["libra"]],
    "264f": ["\u264F", ["scorpius"]],
    "2650": ["\u2650", ["sagittarius"]],
    "2651": ["\u2651", ["capricorn"]],
    "2652": ["\u2652", ["aquarius"]],
    "2653": ["\u2653", ["pisces"]],
    "2660": ["\u2660", ["spades"]],
    "2663": ["\u2663", ["clubs"]],
    "2665": ["\u2665", ["hearts"]],
    "2666": ["\u2666", ["diamonds"]],
    "2668": ["\u2668", ["hotsprings"]],
    "267b": ["\u267B", ["recycle"]],
    "267f": ["\u267F", ["wheelchair"]],
    "2693": ["\u2693", ["anchor"]],
    "26a0": ["\u26A0", ["warning"]],
    "26a1": ["\u26A1", ["zap"]],
    "26aa": ["\u26AA", ["white_circle"]],
    "26ab": ["\u26AB", ["black_circle"]],
    "26bd": ["\u26BD", ["soccer"]],
    "26be": ["\u26BE", ["baseball"]],
    "26c4": ["\u26C4", ["snowman"]],
    "26c5": ["\u26C5", ["partly_sunny"]],
    "26ce": ["\u26CE", ["ophiuchus"]],
    "26d4": ["\u26D4", ["no_entry"]],
    "26ea": ["\u26EA", ["church"]],
    "26f2": ["\u26F2", ["fountain"]],
    "26f3": ["\u26F3", ["golf"]],
    "26f5": ["\u26F5", ["boat", "sailboat"]],
    "26fa": ["\u26FA", ["tent"]],
    "26fd": ["\u26FD", ["fuelpump"]],
    "2702": ["\u2702", ["scissors"]],
    "2705": ["\u2705", ["white_check_mark"]],
    "2708": ["\u2708", ["airplane"]],
    "2709": ["\u2709", ["email", "envelope"]],
    "270a": ["\u270A", ["fist"]],
    "270b": ["\u270B", ["hand", "raised_hand"]],
    "270c": ["\u270C", ["v"]],
    "270f": ["\u270F", ["pencil2"]],
    "2712": ["\u2712", ["black_nib"]],
    "2714": ["\u2714", ["heavy_check_mark"]],
    "2716": ["\u2716", ["heavy_multiplication_x"]],
    "2728": ["\u2728", ["sparkles"]],
    "2733": ["\u2733", ["eight_spoked_asterisk"]],
    "2734": ["\u2734", ["eight_pointed_black_star"]],
    "2744": ["\u2744", ["snowflake"]],
    "2747": ["\u2747", ["sparkle"]],
    "274c": ["\u274C", ["x"]],
    "274e": ["\u274E", ["negative_squared_cross_mark"]],
    "2753": ["\u2753", ["question"]],
    "2754": ["\u2754", ["grey_question"]],
    "2755": ["\u2755", ["grey_exclamation"]],
    "2757": ["\u2757", ["exclamation", "heavy_exclamation_mark"]],
    "2764": ["\u2764", ["heart"], "<3"],
    "2795": ["\u2795", ["heavy_plus_sign"]],
    "2796": ["\u2796", ["heavy_minus_sign"]],
    "2797": ["\u2797", ["heavy_division_sign"]],
    "27a1": ["\u27A1", ["arrow_right"]],
    "27b0": ["\u27B0", ["curly_loop"]],
    "27bf": ["\u27BF", ["loop"]],
    "2934": ["\u2934", ["arrow_heading_up"]],
    "2935": ["\u2935", ["arrow_heading_down"]],
    "2b05": ["\u2B05", ["arrow_left"]],
    "2b06": ["\u2B06", ["arrow_up"]],
    "2b07": ["\u2B07", ["arrow_down"]],
    "2b1b": ["\u2B1B", ["black_large_square"]],
    "2b1c": ["\u2B1C", ["white_large_square"]],
    "2b50": ["\u2B50", ["star"]],
    "2b55": ["\u2B55", ["o"]],
    "3030": ["\u3030", ["wavy_dash"]],
    "303d": ["\u303D", ["part_alternation_mark"]],
    "3297": ["\u3297", ["congratulations"]],
    "3299": ["\u3299", ["secret"]],
    "1f004": ["\uD83C\uDC04", ["mahjong"]],
    "1f0cf": ["\uD83C\uDCCF", ["black_joker"]],
    "1f170": ["\uD83C\uDD70", ["a"]],
    "1f171": ["\uD83C\uDD71", ["b"]],
    "1f17e": ["\uD83C\uDD7E", ["o2"]],
    "1f17f": ["\uD83C\uDD7F", ["parking"]],
    "1f18e": ["\uD83C\uDD8E", ["ab"]],
    "1f191": ["\uD83C\uDD91", ["cl"]],
    "1f192": ["\uD83C\uDD92", ["cool"]],
    "1f193": ["\uD83C\uDD93", ["free"]],
    "1f194": ["\uD83C\uDD94", ["id"]],
    "1f195": ["\uD83C\uDD95", ["new"]],
    "1f196": ["\uD83C\uDD96", ["ng"]],
    "1f197": ["\uD83C\uDD97", ["ok"]],
    "1f198": ["\uD83C\uDD98", ["sos"]],
    "1f199": ["\uD83C\uDD99", ["up"]],
    "1f19a": ["\uD83C\uDD9A", ["vs"]],
    "1f201": ["\uD83C\uDE01", ["koko"]],
    "1f202": ["\uD83C\uDE02", ["sa"]],
    "1f21a": ["\uD83C\uDE1A", ["u7121"]],
    "1f22f": ["\uD83C\uDE2F", ["u6307"]],
    "1f232": ["\uD83C\uDE32", ["u7981"]],
    "1f233": ["\uD83C\uDE33", ["u7a7a"]],
    "1f234": ["\uD83C\uDE34", ["u5408"]],
    "1f235": ["\uD83C\uDE35", ["u6e80"]],
    "1f236": ["\uD83C\uDE36", ["u6709"]],
    "1f237": ["\uD83C\uDE37", ["u6708"]],
    "1f238": ["\uD83C\uDE38", ["u7533"]],
    "1f239": ["\uD83C\uDE39", ["u5272"]],
    "1f23a": ["\uD83C\uDE3A", ["u55b6"]],
    "1f250": ["\uD83C\uDE50", ["ideograph_advantage"]],
    "1f251": ["\uD83C\uDE51", ["accept"]],
    "1f300": ["\uD83C\uDF00", ["cyclone"]],
    "1f301": ["\uD83C\uDF01", ["foggy"]],
    "1f302": ["\uD83C\uDF02", ["closed_umbrella"]],
    "1f303": ["\uD83C\uDF03", ["night_with_stars"]],
    "1f304": ["\uD83C\uDF04", ["sunrise_over_mountains"]],
    "1f305": ["\uD83C\uDF05", ["sunrise"]],
    "1f306": ["\uD83C\uDF06", ["city_sunset"]],
    "1f307": ["\uD83C\uDF07", ["city_sunrise"]],
    "1f308": ["\uD83C\uDF08", ["rainbow"]],
    "1f309": ["\uD83C\uDF09", ["bridge_at_night"]],
    "1f30a": ["\uD83C\uDF0A", ["ocean"]],
    "1f30b": ["\uD83C\uDF0B", ["volcano"]],
    "1f30c": ["\uD83C\uDF0C", ["milky_way"]],
    "1f30d": ["\uD83C\uDF0D", ["earth_africa"]],
    "1f30e": ["\uD83C\uDF0E", ["earth_americas"]],
    "1f30f": ["\uD83C\uDF0F", ["earth_asia"]],
    "1f310": ["\uD83C\uDF10", ["globe_with_meridians"]],
    "1f311": ["\uD83C\uDF11", ["new_moon"]],
    "1f312": ["\uD83C\uDF12", ["waxing_crescent_moon"]],
    "1f313": ["\uD83C\uDF13", ["first_quarter_moon"]],
    "1f314": ["\uD83C\uDF14", ["moon", "waxing_gibbous_moon"]],
    "1f315": ["\uD83C\uDF15", ["full_moon"]],
    "1f316": ["\uD83C\uDF16", ["waning_gibbous_moon"]],
    "1f317": ["\uD83C\uDF17", ["last_quarter_moon"]],
    "1f318": ["\uD83C\uDF18", ["waning_crescent_moon"]],
    "1f319": ["\uD83C\uDF19", ["crescent_moon"]],
    "1f320": ["\uD83C\uDF20", ["stars"]],
    "1f31a": ["\uD83C\uDF1A", ["new_moon_with_face"]],
    "1f31b": ["\uD83C\uDF1B", ["first_quarter_moon_with_face"]],
    "1f31c": ["\uD83C\uDF1C", ["last_quarter_moon_with_face"]],
    "1f31d": ["\uD83C\uDF1D", ["full_moon_with_face"]],
    "1f31e": ["\uD83C\uDF1E", ["sun_with_face"]],
    "1f31f": ["\uD83C\uDF1F", ["star2"]],
    "1f330": ["\uD83C\uDF30", ["chestnut"]],
    "1f331": ["\uD83C\uDF31", ["seedling"]],
    "1f332": ["\uD83C\uDF32", ["evergreen_tree"]],
    "1f333": ["\uD83C\uDF33", ["deciduous_tree"]],
    "1f334": ["\uD83C\uDF34", ["palm_tree"]],
    "1f335": ["\uD83C\uDF35", ["cactus"]],
    "1f337": ["\uD83C\uDF37", ["tulip"]],
    "1f338": ["\uD83C\uDF38", ["cherry_blossom"]],
    "1f339": ["\uD83C\uDF39", ["rose"]],
    "1f33a": ["\uD83C\uDF3A", ["hibiscus"]],
    "1f33b": ["\uD83C\uDF3B", ["sunflower"]],
    "1f33c": ["\uD83C\uDF3C", ["blossom"]],
    "1f33d": ["\uD83C\uDF3D", ["corn"]],
    "1f33e": ["\uD83C\uDF3E", ["ear_of_rice"]],
    "1f33f": ["\uD83C\uDF3F", ["herb"]],
    "1f340": ["\uD83C\uDF40", ["four_leaf_clover"]],
    "1f341": ["\uD83C\uDF41", ["maple_leaf"]],
    "1f342": ["\uD83C\uDF42", ["fallen_leaf"]],
    "1f343": ["\uD83C\uDF43", ["leaves"]],
    "1f344": ["\uD83C\uDF44", ["mushroom"]],
    "1f345": ["\uD83C\uDF45", ["tomato"]],
    "1f346": ["\uD83C\uDF46", ["eggplant"]],
    "1f347": ["\uD83C\uDF47", ["grapes"]],
    "1f348": ["\uD83C\uDF48", ["melon"]],
    "1f349": ["\uD83C\uDF49", ["watermelon"]],
    "1f34a": ["\uD83C\uDF4A", ["tangerine"]],
    "1f34b": ["\uD83C\uDF4B", ["lemon"]],
    "1f34c": ["\uD83C\uDF4C", ["banana"]],
    "1f34d": ["\uD83C\uDF4D", ["pineapple"]],
    "1f34e": ["\uD83C\uDF4E", ["apple"]],
    "1f34f": ["\uD83C\uDF4F", ["green_apple"]],
    "1f350": ["\uD83C\uDF50", ["pear"]],
    "1f351": ["\uD83C\uDF51", ["peach"]],
    "1f352": ["\uD83C\uDF52", ["cherries"]],
    "1f353": ["\uD83C\uDF53", ["strawberry"]],
    "1f354": ["\uD83C\uDF54", ["hamburger"]],
    "1f355": ["\uD83C\uDF55", ["pizza"]],
    "1f356": ["\uD83C\uDF56", ["meat_on_bone"]],
    "1f357": ["\uD83C\uDF57", ["poultry_leg"]],
    "1f358": ["\uD83C\uDF58", ["rice_cracker"]],
    "1f359": ["\uD83C\uDF59", ["rice_ball"]],
    "1f35a": ["\uD83C\uDF5A", ["rice"]],
    "1f35b": ["\uD83C\uDF5B", ["curry"]],
    "1f35c": ["\uD83C\uDF5C", ["ramen"]],
    "1f35d": ["\uD83C\uDF5D", ["spaghetti"]],
    "1f35e": ["\uD83C\uDF5E", ["bread"]],
    "1f35f": ["\uD83C\uDF5F", ["fries"]],
    "1f360": ["\uD83C\uDF60", ["sweet_potato"]],
    "1f361": ["\uD83C\uDF61", ["dango"]],
    "1f362": ["\uD83C\uDF62", ["oden"]],
    "1f363": ["\uD83C\uDF63", ["sushi"]],
    "1f364": ["\uD83C\uDF64", ["fried_shrimp"]],
    "1f365": ["\uD83C\uDF65", ["fish_cake"]],
    "1f366": ["\uD83C\uDF66", ["icecream"]],
    "1f367": ["\uD83C\uDF67", ["shaved_ice"]],
    "1f368": ["\uD83C\uDF68", ["ice_cream"]],
    "1f369": ["\uD83C\uDF69", ["doughnut"]],
    "1f36a": ["\uD83C\uDF6A", ["cookie"]],
    "1f36b": ["\uD83C\uDF6B", ["chocolate_bar"]],
    "1f36c": ["\uD83C\uDF6C", ["candy"]],
    "1f36d": ["\uD83C\uDF6D", ["lollipop"]],
    "1f36e": ["\uD83C\uDF6E", ["custard"]],
    "1f36f": ["\uD83C\uDF6F", ["honey_pot"]],
    "1f370": ["\uD83C\uDF70", ["cake"]],
    "1f371": ["\uD83C\uDF71", ["bento"]],
    "1f372": ["\uD83C\uDF72", ["stew"]],
    "1f373": ["\uD83C\uDF73", ["egg"]],
    "1f374": ["\uD83C\uDF74", ["fork_and_knife"]],
    "1f375": ["\uD83C\uDF75", ["tea"]],
    "1f376": ["\uD83C\uDF76", ["sake"]],
    "1f377": ["\uD83C\uDF77", ["wine_glass"]],
    "1f378": ["\uD83C\uDF78", ["cocktail"]],
    "1f379": ["\uD83C\uDF79", ["tropical_drink"]],
    "1f37a": ["\uD83C\uDF7A", ["beer"]],
    "1f37b": ["\uD83C\uDF7B", ["beers"]],
    "1f37c": ["\uD83C\uDF7C", ["baby_bottle"]],
    "1f380": ["\uD83C\uDF80", ["ribbon"]],
    "1f381": ["\uD83C\uDF81", ["gift"]],
    "1f382": ["\uD83C\uDF82", ["birthday"]],
    "1f383": ["\uD83C\uDF83", ["jack_o_lantern"]],
    "1f384": ["\uD83C\uDF84", ["christmas_tree"]],
    "1f385": ["\uD83C\uDF85", ["santa"]],
    "1f386": ["\uD83C\uDF86", ["fireworks"]],
    "1f387": ["\uD83C\uDF87", ["sparkler"]],
    "1f388": ["\uD83C\uDF88", ["balloon"]],
    "1f389": ["\uD83C\uDF89", ["tada"]],
    "1f38a": ["\uD83C\uDF8A", ["confetti_ball"]],
    "1f38b": ["\uD83C\uDF8B", ["tanabata_tree"]],
    "1f38c": ["\uD83C\uDF8C", ["crossed_flags"]],
    "1f38d": ["\uD83C\uDF8D", ["bamboo"]],
    "1f38e": ["\uD83C\uDF8E", ["dolls"]],
    "1f38f": ["\uD83C\uDF8F", ["flags"]],
    "1f390": ["\uD83C\uDF90", ["wind_chime"]],
    "1f391": ["\uD83C\uDF91", ["rice_scene"]],
    "1f392": ["\uD83C\uDF92", ["school_satchel"]],
    "1f393": ["\uD83C\uDF93", ["mortar_board"]],
    "1f3a0": ["\uD83C\uDFA0", ["carousel_horse"]],
    "1f3a1": ["\uD83C\uDFA1", ["ferris_wheel"]],
    "1f3a2": ["\uD83C\uDFA2", ["roller_coaster"]],
    "1f3a3": ["\uD83C\uDFA3", ["fishing_pole_and_fish"]],
    "1f3a4": ["\uD83C\uDFA4", ["microphone"]],
    "1f3a5": ["\uD83C\uDFA5", ["movie_camera"]],
    "1f3a6": ["\uD83C\uDFA6", ["cinema"]],
    "1f3a7": ["\uD83C\uDFA7", ["headphones"]],
    "1f3a8": ["\uD83C\uDFA8", ["art"]],
    "1f3a9": ["\uD83C\uDFA9", ["tophat"]],
    "1f3aa": ["\uD83C\uDFAA", ["circus_tent"]],
    "1f3ab": ["\uD83C\uDFAB", ["ticket"]],
    "1f3ac": ["\uD83C\uDFAC", ["clapper"]],
    "1f3ad": ["\uD83C\uDFAD", ["performing_arts"]],
    "1f3ae": ["\uD83C\uDFAE", ["video_game"]],
    "1f3af": ["\uD83C\uDFAF", ["dart"]],
    "1f3b0": ["\uD83C\uDFB0", ["slot_machine"]],
    "1f3b1": ["\uD83C\uDFB1", ["8ball"]],
    "1f3b2": ["\uD83C\uDFB2", ["game_die"]],
    "1f3b3": ["\uD83C\uDFB3", ["bowling"]],
    "1f3b4": ["\uD83C\uDFB4", ["flower_playing_cards"]],
    "1f3b5": ["\uD83C\uDFB5", ["musical_note"]],
    "1f3b6": ["\uD83C\uDFB6", ["notes"]],
    "1f3b7": ["\uD83C\uDFB7", ["saxophone"]],
    "1f3b8": ["\uD83C\uDFB8", ["guitar"]],
    "1f3b9": ["\uD83C\uDFB9", ["musical_keyboard"]],
    "1f3ba": ["\uD83C\uDFBA", ["trumpet"]],
    "1f3bb": ["\uD83C\uDFBB", ["violin"]],
    "1f3bc": ["\uD83C\uDFBC", ["musical_score"]],
    "1f3bd": ["\uD83C\uDFBD", ["running_shirt_with_sash"]],
    "1f3be": ["\uD83C\uDFBE", ["tennis"]],
    "1f3bf": ["\uD83C\uDFBF", ["ski"]],
    "1f3c0": ["\uD83C\uDFC0", ["basketball"]],
    "1f3c1": ["\uD83C\uDFC1", ["checkered_flag"]],
    "1f3c2": ["\uD83C\uDFC2", ["snowboarder"]],
    "1f3c3": ["\uD83C\uDFC3", ["runner", "running"]],
    "1f3c4": ["\uD83C\uDFC4", ["surfer"]],
    "1f3c6": ["\uD83C\uDFC6", ["trophy"]],
    "1f3c7": ["\uD83C\uDFC7", ["horse_racing"]],
    "1f3c8": ["\uD83C\uDFC8", ["football"]],
    "1f3c9": ["\uD83C\uDFC9", ["rugby_football"]],
    "1f3ca": ["\uD83C\uDFCA", ["swimmer"]],
    "1f3e0": ["\uD83C\uDFE0", ["house"]],
    "1f3e1": ["\uD83C\uDFE1", ["house_with_garden"]],
    "1f3e2": ["\uD83C\uDFE2", ["office"]],
    "1f3e3": ["\uD83C\uDFE3", ["post_office"]],
    "1f3e4": ["\uD83C\uDFE4", ["european_post_office"]],
    "1f3e5": ["\uD83C\uDFE5", ["hospital"]],
    "1f3e6": ["\uD83C\uDFE6", ["bank"]],
    "1f3e7": ["\uD83C\uDFE7", ["atm"]],
    "1f3e8": ["\uD83C\uDFE8", ["hotel"]],
    "1f3e9": ["\uD83C\uDFE9", ["love_hotel"]],
    "1f3ea": ["\uD83C\uDFEA", ["convenience_store"]],
    "1f3eb": ["\uD83C\uDFEB", ["school"]],
    "1f3ec": ["\uD83C\uDFEC", ["department_store"]],
    "1f3ed": ["\uD83C\uDFED", ["factory"]],
    "1f3ee": ["\uD83C\uDFEE", ["izakaya_lantern", "lantern"]],
    "1f3ef": ["\uD83C\uDFEF", ["japanese_castle"]],
    "1f3f0": ["\uD83C\uDFF0", ["european_castle"]],
    "1f400": ["\uD83D\uDC00", ["rat"]],
    "1f401": ["\uD83D\uDC01", ["mouse2"]],
    "1f402": ["\uD83D\uDC02", ["ox"]],
    "1f403": ["\uD83D\uDC03", ["water_buffalo"]],
    "1f404": ["\uD83D\uDC04", ["cow2"]],
    "1f405": ["\uD83D\uDC05", ["tiger2"]],
    "1f406": ["\uD83D\uDC06", ["leopard"]],
    "1f407": ["\uD83D\uDC07", ["rabbit2"]],
    "1f408": ["\uD83D\uDC08", ["cat2"]],
    "1f409": ["\uD83D\uDC09", ["dragon"]],
    "1f40a": ["\uD83D\uDC0A", ["crocodile"]],
    "1f40b": ["\uD83D\uDC0B", ["whale2"]],
    "1f40c": ["\uD83D\uDC0C", ["snail"]],
    "1f40d": ["\uD83D\uDC0D", ["snake"]],
    "1f40e": ["\uD83D\uDC0E", ["racehorse"]],
    "1f40f": ["\uD83D\uDC0F", ["ram"]],
    "1f410": ["\uD83D\uDC10", ["goat"]],
    "1f411": ["\uD83D\uDC11", ["sheep"]],
    "1f412": ["\uD83D\uDC12", ["monkey"]],
    "1f413": ["\uD83D\uDC13", ["rooster"]],
    "1f414": ["\uD83D\uDC14", ["chicken"]],
    "1f415": ["\uD83D\uDC15", ["dog2"]],
    "1f416": ["\uD83D\uDC16", ["pig2"]],
    "1f417": ["\uD83D\uDC17", ["boar"]],
    "1f418": ["\uD83D\uDC18", ["elephant"]],
    "1f419": ["\uD83D\uDC19", ["octopus"]],
    "1f41a": ["\uD83D\uDC1A", ["shell"]],
    "1f41b": ["\uD83D\uDC1B", ["bug"]],
    "1f41c": ["\uD83D\uDC1C", ["ant"]],
    "1f41d": ["\uD83D\uDC1D", ["bee", "honeybee"]],
    "1f41e": ["\uD83D\uDC1E", ["beetle"]],
    "1f41f": ["\uD83D\uDC1F", ["fish"]],
    "1f420": ["\uD83D\uDC20", ["tropical_fish"]],
    "1f421": ["\uD83D\uDC21", ["blowfish"]],
    "1f422": ["\uD83D\uDC22", ["turtle"]],
    "1f423": ["\uD83D\uDC23", ["hatching_chick"]],
    "1f424": ["\uD83D\uDC24", ["baby_chick"]],
    "1f425": ["\uD83D\uDC25", ["hatched_chick"]],
    "1f426": ["\uD83D\uDC26", ["bird"]],
    "1f427": ["\uD83D\uDC27", ["penguin"]],
    "1f428": ["\uD83D\uDC28", ["koala"]],
    "1f429": ["\uD83D\uDC29", ["poodle"]],
    "1f42a": ["\uD83D\uDC2A", ["dromedary_camel"]],
    "1f42b": ["\uD83D\uDC2B", ["camel"]],
    "1f42c": ["\uD83D\uDC2C", ["dolphin", "flipper"]],
    "1f42d": ["\uD83D\uDC2D", ["mouse"]],
    "1f42e": ["\uD83D\uDC2E", ["cow"]],
    "1f42f": ["\uD83D\uDC2F", ["tiger"]],
    "1f430": ["\uD83D\uDC30", ["rabbit"]],
    "1f431": ["\uD83D\uDC31", ["cat"]],
    "1f432": ["\uD83D\uDC32", ["dragon_face"]],
    "1f433": ["\uD83D\uDC33", ["whale"]],
    "1f434": ["\uD83D\uDC34", ["horse"]],
    "1f435": ["\uD83D\uDC35", ["monkey_face"]],
    "1f436": ["\uD83D\uDC36", ["dog"]],
    "1f437": ["\uD83D\uDC37", ["pig"]],
    "1f438": ["\uD83D\uDC38", ["frog"]],
    "1f439": ["\uD83D\uDC39", ["hamster"]],
    "1f43a": ["\uD83D\uDC3A", ["wolf"]],
    "1f43b": ["\uD83D\uDC3B", ["bear"]],
    "1f43c": ["\uD83D\uDC3C", ["panda_face"]],
    "1f43d": ["\uD83D\uDC3D", ["pig_nose"]],
    "1f43e": ["\uD83D\uDC3E", ["feet", "paw_prints"]],
    "1f440": ["\uD83D\uDC40", ["eyes"]],
    "1f442": ["\uD83D\uDC42", ["ear"]],
    "1f443": ["\uD83D\uDC43", ["nose"]],
    "1f444": ["\uD83D\uDC44", ["lips"]],
    "1f445": ["\uD83D\uDC45", ["tongue"]],
    "1f446": ["\uD83D\uDC46", ["point_up_2"]],
    "1f447": ["\uD83D\uDC47", ["point_down"]],
    "1f448": ["\uD83D\uDC48", ["point_left"]],
    "1f449": ["\uD83D\uDC49", ["point_right"]],
    "1f44a": ["\uD83D\uDC4A", ["facepunch", "punch"]],
    "1f44b": ["\uD83D\uDC4B", ["wave"]],
    "1f44c": ["\uD83D\uDC4C", ["ok_hand"]],
    "1f44d": ["\uD83D\uDC4D", ["+1", "thumbsup"]],
    "1f44e": ["\uD83D\uDC4E", ["-1", "thumbsdown"]],
    "1f44f": ["\uD83D\uDC4F", ["clap"]],
    "1f450": ["\uD83D\uDC50", ["open_hands"]],
    "1f451": ["\uD83D\uDC51", ["crown"]],
    "1f452": ["\uD83D\uDC52", ["womans_hat"]],
    "1f453": ["\uD83D\uDC53", ["eyeglasses"]],
    "1f454": ["\uD83D\uDC54", ["necktie"]],
    "1f455": ["\uD83D\uDC55", ["shirt", "tshirt"]],
    "1f456": ["\uD83D\uDC56", ["jeans"]],
    "1f457": ["\uD83D\uDC57", ["dress"]],
    "1f458": ["\uD83D\uDC58", ["kimono"]],
    "1f459": ["\uD83D\uDC59", ["bikini"]],
    "1f45a": ["\uD83D\uDC5A", ["womans_clothes"]],
    "1f45b": ["\uD83D\uDC5B", ["purse"]],
    "1f45c": ["\uD83D\uDC5C", ["handbag"]],
    "1f45d": ["\uD83D\uDC5D", ["pouch"]],
    "1f45e": ["\uD83D\uDC5E", ["mans_shoe", "shoe"]],
    "1f45f": ["\uD83D\uDC5F", ["athletic_shoe"]],
    "1f460": ["\uD83D\uDC60", ["high_heel"]],
    "1f461": ["\uD83D\uDC61", ["sandal"]],
    "1f462": ["\uD83D\uDC62", ["boot"]],
    "1f463": ["\uD83D\uDC63", ["footprints"]],
    "1f464": ["\uD83D\uDC64", ["bust_in_silhouette"]],
    "1f465": ["\uD83D\uDC65", ["busts_in_silhouette"]],
    "1f466": ["\uD83D\uDC66", ["boy"]],
    "1f467": ["\uD83D\uDC67", ["girl"]],
    "1f468": ["\uD83D\uDC68", ["man"]],
    "1f469": ["\uD83D\uDC69", ["woman"]],
    "1f46a": ["\uD83D\uDC6A", ["family"]],
    "1f46b": ["\uD83D\uDC6B", ["couple"]],
    "1f46c": ["\uD83D\uDC6C", ["two_men_holding_hands"]],
    "1f46d": ["\uD83D\uDC6D", ["two_women_holding_hands"]],
    "1f46e": ["\uD83D\uDC6E", ["cop"]],
    "1f46f": ["\uD83D\uDC6F", ["dancers"]],
    "1f470": ["\uD83D\uDC70", ["bride_with_veil"]],
    "1f471": ["\uD83D\uDC71", ["person_with_blond_hair"]],
    "1f472": ["\uD83D\uDC72", ["man_with_gua_pi_mao"]],
    "1f473": ["\uD83D\uDC73", ["man_with_turban"]],
    "1f474": ["\uD83D\uDC74", ["older_man"]],
    "1f475": ["\uD83D\uDC75", ["older_woman"]],
    "1f476": ["\uD83D\uDC76", ["baby"]],
    "1f477": ["\uD83D\uDC77", ["construction_worker"]],
    "1f478": ["\uD83D\uDC78", ["princess"]],
    "1f479": ["\uD83D\uDC79", ["japanese_ogre"]],
    "1f47a": ["\uD83D\uDC7A", ["japanese_goblin"]],
    "1f47b": ["\uD83D\uDC7B", ["ghost"]],
    "1f47c": ["\uD83D\uDC7C", ["angel"]],
    "1f47d": ["\uD83D\uDC7D", ["alien"]],
    "1f47e": ["\uD83D\uDC7E", ["space_invader"]],
    "1f47f": ["\uD83D\uDC7F", ["imp"]],
    "1f480": ["\uD83D\uDC80", ["skull"]],
    "1f481": ["\uD83D\uDC81", ["information_desk_person"]],
    "1f482": ["\uD83D\uDC82", ["guardsman"]],
    "1f483": ["\uD83D\uDC83", ["dancer"]],
    "1f484": ["\uD83D\uDC84", ["lipstick"]],
    "1f485": ["\uD83D\uDC85", ["nail_care"]],
    "1f486": ["\uD83D\uDC86", ["massage"]],
    "1f487": ["\uD83D\uDC87", ["haircut"]],
    "1f488": ["\uD83D\uDC88", ["barber"]],
    "1f489": ["\uD83D\uDC89", ["syringe"]],
    "1f48a": ["\uD83D\uDC8A", ["pill"]],
    "1f48b": ["\uD83D\uDC8B", ["kiss"]],
    "1f48c": ["\uD83D\uDC8C", ["love_letter"]],
    "1f48d": ["\uD83D\uDC8D", ["ring"]],
    "1f48e": ["\uD83D\uDC8E", ["gem"]],
    "1f48f": ["\uD83D\uDC8F", ["couplekiss"]],
    "1f490": ["\uD83D\uDC90", ["bouquet"]],
    "1f491": ["\uD83D\uDC91", ["couple_with_heart"]],
    "1f492": ["\uD83D\uDC92", ["wedding"]],
    "1f493": ["\uD83D\uDC93", ["heartbeat"]],
    "1f494": ["\uD83D\uDC94", ["broken_heart"], "<\/3"],
    "1f495": ["\uD83D\uDC95", ["two_hearts"]],
    "1f496": ["\uD83D\uDC96", ["sparkling_heart"]],
    "1f497": ["\uD83D\uDC97", ["heartpulse"]],
    "1f498": ["\uD83D\uDC98", ["cupid"]],
    "1f499": ["\uD83D\uDC99", ["blue_heart"], "<3"],
    "1f49a": ["\uD83D\uDC9A", ["green_heart"], "<3"],
    "1f49b": ["\uD83D\uDC9B", ["yellow_heart"], "<3"],
    "1f49c": ["\uD83D\uDC9C", ["purple_heart"], "<3"],
    "1f49d": ["\uD83D\uDC9D", ["gift_heart"]],
    "1f49e": ["\uD83D\uDC9E", ["revolving_hearts"]],
    "1f49f": ["\uD83D\uDC9F", ["heart_decoration"]],
    "1f4a0": ["\uD83D\uDCA0", ["diamond_shape_with_a_dot_inside"]],
    "1f4a1": ["\uD83D\uDCA1", ["bulb"]],
    "1f4a2": ["\uD83D\uDCA2", ["anger"]],
    "1f4a3": ["\uD83D\uDCA3", ["bomb"]],
    "1f4a4": ["\uD83D\uDCA4", ["zzz"]],
    "1f4a5": ["\uD83D\uDCA5", ["boom", "collision"]],
    "1f4a6": ["\uD83D\uDCA6", ["sweat_drops"]],
    "1f4a7": ["\uD83D\uDCA7", ["droplet"]],
    "1f4a8": ["\uD83D\uDCA8", ["dash"]],
    "1f4a9": ["\uD83D\uDCA9", ["hankey", "poop", "shit"]],
    "1f4aa": ["\uD83D\uDCAA", ["muscle"]],
    "1f4ab": ["\uD83D\uDCAB", ["dizzy"]],
    "1f4ac": ["\uD83D\uDCAC", ["speech_balloon"]],
    "1f4ad": ["\uD83D\uDCAD", ["thought_balloon"]],
    "1f4ae": ["\uD83D\uDCAE", ["white_flower"]],
    "1f4af": ["\uD83D\uDCAF", ["100"]],
    "1f4b0": ["\uD83D\uDCB0", ["moneybag"]],
    "1f4b1": ["\uD83D\uDCB1", ["currency_exchange"]],
    "1f4b2": ["\uD83D\uDCB2", ["heavy_dollar_sign"]],
    "1f4b3": ["\uD83D\uDCB3", ["credit_card"]],
    "1f4b4": ["\uD83D\uDCB4", ["yen"]],
    "1f4b5": ["\uD83D\uDCB5", ["dollar"]],
    "1f4b6": ["\uD83D\uDCB6", ["euro"]],
    "1f4b7": ["\uD83D\uDCB7", ["pound"]],
    "1f4b8": ["\uD83D\uDCB8", ["money_with_wings"]],
    "1f4b9": ["\uD83D\uDCB9", ["chart"]],
    "1f4ba": ["\uD83D\uDCBA", ["seat"]],
    "1f4bb": ["\uD83D\uDCBB", ["computer"]],
    "1f4bc": ["\uD83D\uDCBC", ["briefcase"]],
    "1f4bd": ["\uD83D\uDCBD", ["minidisc"]],
    "1f4be": ["\uD83D\uDCBE", ["floppy_disk"]],
    "1f4bf": ["\uD83D\uDCBF", ["cd"]],
    "1f4c0": ["\uD83D\uDCC0", ["dvd"]],
    "1f4c1": ["\uD83D\uDCC1", ["file_folder"]],
    "1f4c2": ["\uD83D\uDCC2", ["open_file_folder"]],
    "1f4c3": ["\uD83D\uDCC3", ["page_with_curl"]],
    "1f4c4": ["\uD83D\uDCC4", ["page_facing_up"]],
    "1f4c5": ["\uD83D\uDCC5", ["date"]],
    "1f4c6": ["\uD83D\uDCC6", ["calendar"]],
    "1f4c7": ["\uD83D\uDCC7", ["card_index"]],
    "1f4c8": ["\uD83D\uDCC8", ["chart_with_upwards_trend"]],
    "1f4c9": ["\uD83D\uDCC9", ["chart_with_downwards_trend"]],
    "1f4ca": ["\uD83D\uDCCA", ["bar_chart"]],
    "1f4cb": ["\uD83D\uDCCB", ["clipboard"]],
    "1f4cc": ["\uD83D\uDCCC", ["pushpin"]],
    "1f4cd": ["\uD83D\uDCCD", ["round_pushpin"]],
    "1f4ce": ["\uD83D\uDCCE", ["paperclip"]],
    "1f4cf": ["\uD83D\uDCCF", ["straight_ruler"]],
    "1f4d0": ["\uD83D\uDCD0", ["triangular_ruler"]],
    "1f4d1": ["\uD83D\uDCD1", ["bookmark_tabs"]],
    "1f4d2": ["\uD83D\uDCD2", ["ledger"]],
    "1f4d3": ["\uD83D\uDCD3", ["notebook"]],
    "1f4d4": ["\uD83D\uDCD4", ["notebook_with_decorative_cover"]],
    "1f4d5": ["\uD83D\uDCD5", ["closed_book"]],
    "1f4d6": ["\uD83D\uDCD6", ["book", "open_book"]],
    "1f4d7": ["\uD83D\uDCD7", ["green_book"]],
    "1f4d8": ["\uD83D\uDCD8", ["blue_book"]],
    "1f4d9": ["\uD83D\uDCD9", ["orange_book"]],
    "1f4da": ["\uD83D\uDCDA", ["books"]],
    "1f4db": ["\uD83D\uDCDB", ["name_badge"]],
    "1f4dc": ["\uD83D\uDCDC", ["scroll"]],
    "1f4dd": ["\uD83D\uDCDD", ["memo", "pencil"]],
    "1f4de": ["\uD83D\uDCDE", ["telephone_receiver"]],
    "1f4df": ["\uD83D\uDCDF", ["pager"]],
    "1f4e0": ["\uD83D\uDCE0", ["fax"]],
    "1f4e1": ["\uD83D\uDCE1", ["satellite"]],
    "1f4e2": ["\uD83D\uDCE2", ["loudspeaker"]],
    "1f4e3": ["\uD83D\uDCE3", ["mega"]],
    "1f4e4": ["\uD83D\uDCE4", ["outbox_tray"]],
    "1f4e5": ["\uD83D\uDCE5", ["inbox_tray"]],
    "1f4e6": ["\uD83D\uDCE6", ["package"]],
    "1f4e7": ["\uD83D\uDCE7", ["e-mail"]],
    "1f4e8": ["\uD83D\uDCE8", ["incoming_envelope"]],
    "1f4e9": ["\uD83D\uDCE9", ["envelope_with_arrow"]],
    "1f4ea": ["\uD83D\uDCEA", ["mailbox_closed"]],
    "1f4eb": ["\uD83D\uDCEB", ["mailbox"]],
    "1f4ec": ["\uD83D\uDCEC", ["mailbox_with_mail"]],
    "1f4ed": ["\uD83D\uDCED", ["mailbox_with_no_mail"]],
    "1f4ee": ["\uD83D\uDCEE", ["postbox"]],
    "1f4ef": ["\uD83D\uDCEF", ["postal_horn"]],
    "1f4f0": ["\uD83D\uDCF0", ["newspaper"]],
    "1f4f1": ["\uD83D\uDCF1", ["iphone"]],
    "1f4f2": ["\uD83D\uDCF2", ["calling"]],
    "1f4f3": ["\uD83D\uDCF3", ["vibration_mode"]],
    "1f4f4": ["\uD83D\uDCF4", ["mobile_phone_off"]],
    "1f4f5": ["\uD83D\uDCF5", ["no_mobile_phones"]],
    "1f4f6": ["\uD83D\uDCF6", ["signal_strength"]],
    "1f4f7": ["\uD83D\uDCF7", ["camera"]],
    "1f4f9": ["\uD83D\uDCF9", ["video_camera"]],
    "1f4fa": ["\uD83D\uDCFA", ["tv"]],
    "1f4fb": ["\uD83D\uDCFB", ["radio"]],
    "1f4fc": ["\uD83D\uDCFC", ["vhs"]],
    "1f500": ["\uD83D\uDD00", ["twisted_rightwards_arrows"]],
    "1f501": ["\uD83D\uDD01", ["repeat"]],
    "1f502": ["\uD83D\uDD02", ["repeat_one"]],
    "1f503": ["\uD83D\uDD03", ["arrows_clockwise"]],
    "1f504": ["\uD83D\uDD04", ["arrows_counterclockwise"]],
    "1f505": ["\uD83D\uDD05", ["low_brightness"]],
    "1f506": ["\uD83D\uDD06", ["high_brightness"]],
    "1f507": ["\uD83D\uDD07", ["mute"]],
    "1f508": ["\uD83D\uDD09", ["speaker"]],
    "1f509": ["\uD83D\uDD09", ["sound"]],
    "1f50a": ["\uD83D\uDD0A", ["loud_sound"]],
    "1f50b": ["\uD83D\uDD0B", ["battery"]],
    "1f50c": ["\uD83D\uDD0C", ["electric_plug"]],
    "1f50d": ["\uD83D\uDD0D", ["mag"]],
    "1f50e": ["\uD83D\uDD0E", ["mag_right"]],
    "1f50f": ["\uD83D\uDD0F", ["lock_with_ink_pen"]],
    "1f510": ["\uD83D\uDD10", ["closed_lock_with_key"]],
    "1f511": ["\uD83D\uDD11", ["key"]],
    "1f512": ["\uD83D\uDD12", ["lock"]],
    "1f513": ["\uD83D\uDD13", ["unlock"]],
    "1f514": ["\uD83D\uDD14", ["bell"]],
    "1f515": ["\uD83D\uDD15", ["no_bell"]],
    "1f516": ["\uD83D\uDD16", ["bookmark"]],
    "1f517": ["\uD83D\uDD17", ["link"]],
    "1f518": ["\uD83D\uDD18", ["radio_button"]],
    "1f519": ["\uD83D\uDD19", ["back"]],
    "1f51a": ["\uD83D\uDD1A", ["end"]],
    "1f51b": ["\uD83D\uDD1B", ["on"]],
    "1f51c": ["\uD83D\uDD1C", ["soon"]],
    "1f51d": ["\uD83D\uDD1D", ["top"]],
    "1f51e": ["\uD83D\uDD1E", ["underage"]],
    "1f51f": ["\uD83D\uDD1F", ["keycap_ten"]],
    "1f520": ["\uD83D\uDD20", ["capital_abcd"]],
    "1f521": ["\uD83D\uDD21", ["abcd"]],
    "1f522": ["\uD83D\uDD22", ["1234"]],
    "1f523": ["\uD83D\uDD23", ["symbols"]],
    "1f524": ["\uD83D\uDD24", ["abc"]],
    "1f525": ["\uD83D\uDD25", ["fire"]],
    "1f526": ["\uD83D\uDD26", ["flashlight"]],
    "1f527": ["\uD83D\uDD27", ["wrench"]],
    "1f528": ["\uD83D\uDD28", ["hammer"]],
    "1f529": ["\uD83D\uDD29", ["nut_and_bolt"]],
    "1f52a": ["\uD83D\uDD2A", ["hocho"]],
    "1f52b": ["\uD83D\uDD2B", ["gun"]],
    "1f52c": ["\uD83D\uDD2C", ["microscope"]],
    "1f52d": ["\uD83D\uDD2D", ["telescope"]],
    "1f52e": ["\uD83D\uDD2E", ["crystal_ball"]],
    "1f52f": ["\uD83D\uDD2F", ["six_pointed_star"]],
    "1f530": ["\uD83D\uDD30", ["beginner"]],
    "1f531": ["\uD83D\uDD31", ["trident"]],
    "1f532": ["\uD83D\uDD32", ["black_square_button"]],
    "1f533": ["\uD83D\uDD33", ["white_square_button"]],
    "1f534": ["\uD83D\uDD34", ["red_circle"]],
    "1f535": ["\uD83D\uDD35", ["large_blue_circle"]],
    "1f536": ["\uD83D\uDD36", ["large_orange_diamond"]],
    "1f537": ["\uD83D\uDD37", ["large_blue_diamond"]],
    "1f538": ["\uD83D\uDD38", ["small_orange_diamond"]],
    "1f539": ["\uD83D\uDD39", ["small_blue_diamond"]],
    "1f53a": ["\uD83D\uDD3A", ["small_red_triangle"]],
    "1f53b": ["\uD83D\uDD3B", ["small_red_triangle_down"]],
    "1f53c": ["\uD83D\uDD3C", ["arrow_up_small"]],
    "1f53d": ["\uD83D\uDD3D", ["arrow_down_small"]],
    "1f550": ["\uD83D\uDD50", ["clock1"]],
    "1f551": ["\uD83D\uDD51", ["clock2"]],
    "1f552": ["\uD83D\uDD52", ["clock3"]],
    "1f553": ["\uD83D\uDD53", ["clock4"]],
    "1f554": ["\uD83D\uDD54", ["clock5"]],
    "1f555": ["\uD83D\uDD55", ["clock6"]],
    "1f556": ["\uD83D\uDD56", ["clock7"]],
    "1f557": ["\uD83D\uDD57", ["clock8"]],
    "1f558": ["\uD83D\uDD58", ["clock9"]],
    "1f559": ["\uD83D\uDD59", ["clock10"]],
    "1f55a": ["\uD83D\uDD5A", ["clock11"]],
    "1f55b": ["\uD83D\uDD5B", ["clock12"]],
    "1f55c": ["\uD83D\uDD5C", ["clock130"]],
    "1f55d": ["\uD83D\uDD5D", ["clock230"]],
    "1f55e": ["\uD83D\uDD5E", ["clock330"]],
    "1f55f": ["\uD83D\uDD5F", ["clock430"]],
    "1f560": ["\uD83D\uDD60", ["clock530"]],
    "1f561": ["\uD83D\uDD61", ["clock630"]],
    "1f562": ["\uD83D\uDD62", ["clock730"]],
    "1f563": ["\uD83D\uDD63", ["clock830"]],
    "1f564": ["\uD83D\uDD64", ["clock930"]],
    "1f565": ["\uD83D\uDD65", ["clock1030"]],
    "1f566": ["\uD83D\uDD66", ["clock1130"]],
    "1f567": ["\uD83D\uDD67", ["clock1230"]],
    "1f5fb": ["\uD83D\uDDFB", ["mount_fuji"]],
    "1f5fc": ["\uD83D\uDDFC", ["tokyo_tower"]],
    "1f5fd": ["\uD83D\uDDFD", ["statue_of_liberty"]],
    "1f5fe": ["\uD83D\uDDFE", ["japan"]],
    "1f5ff": ["\uD83D\uDDFF", ["moyai"]],
    "1f600": ["\uD83D\uDE00", ["grinning"]],
    "1f601": ["\uD83D\uDE01", ["grin"]],
    "1f602": ["\uD83D\uDE02", ["joy"]],
    "1f603": ["\uD83D\uDE03", ["smiley"], ":)"],
    "1f604": ["\uD83D\uDE04", ["smile"], ":)"],
    "1f605": ["\uD83D\uDE05", ["sweat_smile"]],
    "1f606": ["\uD83D\uDE06", ["satisfied"]],
    "1f607": ["\uD83D\uDE07", ["innocent"]],
    "1f608": ["\uD83D\uDE08", ["smiling_imp"]],
    "1f609": ["\uD83D\uDE09", ["wink"], ";)"],
    "1f60a": ["\uD83D\uDE0A", ["blush"]],
    "1f60b": ["\uD83D\uDE0B", ["yum"]],
    "1f60c": ["\uD83D\uDE0C", ["relieved"]],
    "1f60d": ["\uD83D\uDE0D", ["heart_eyes"]],
    "1f60e": ["\uD83D\uDE0E", ["sunglasses"]],
    "1f60f": ["\uD83D\uDE0F", ["smirk"]],
    "1f610": ["\uD83D\uDE10", ["neutral_face"]],
    "1f611": ["\uD83D\uDE11", ["expressionless"]],
    "1f612": ["\uD83D\uDE12", ["unamused"]],
    "1f613": ["\uD83D\uDE13", ["sweat"]],
    "1f614": ["\uD83D\uDE14", ["pensive"]],
    "1f615": ["\uD83D\uDE15", ["confused"]],
    "1f616": ["\uD83D\uDE16", ["confounded"]],
    "1f617": ["\uD83D\uDE17", ["kissing"]],
    "1f618": ["\uD83D\uDE18", ["kissing_heart"]],
    "1f619": ["\uD83D\uDE19", ["kissing_smiling_eyes"]],
    "1f61a": ["\uD83D\uDE1A", ["kissing_closed_eyes"]],
    "1f61b": ["\uD83D\uDE1B", ["stuck_out_tongue"]],
    "1f61c": ["\uD83D\uDE1C", ["stuck_out_tongue_winking_eye"], ";p"],
    "1f61d": ["\uD83D\uDE1D", ["stuck_out_tongue_closed_eyes"]],
    "1f61e": ["\uD83D\uDE1E", ["disappointed"], ":("],
    "1f61f": ["\uD83D\uDE1F", ["worried"]],
    "1f620": ["\uD83D\uDE20", ["angry"]],
    "1f621": ["\uD83D\uDE21", ["rage"]],
    "1f622": ["\uD83D\uDE22", ["cry"], ":'("],
    "1f623": ["\uD83D\uDE23", ["persevere"]],
    "1f624": ["\uD83D\uDE24", ["triumph"]],
    "1f625": ["\uD83D\uDE25", ["disappointed_relieved"]],
    "1f626": ["\uD83D\uDE26", ["frowning"]],
    "1f627": ["\uD83D\uDE27", ["anguished"]],
    "1f628": ["\uD83D\uDE28", ["fearful"]],
    "1f629": ["\uD83D\uDE29", ["weary"]],
    "1f62a": ["\uD83D\uDE2A", ["sleepy"]],
    "1f62b": ["\uD83D\uDE2B", ["tired_face"]],
    "1f62c": ["\uD83D\uDE2C", ["grimacing"]],
    "1f62d": ["\uD83D\uDE2D", ["sob"], ":'("],
    "1f62e": ["\uD83D\uDE2E", ["open_mouth"]],
    "1f62f": ["\uD83D\uDE2F", ["hushed"]],
    "1f630": ["\uD83D\uDE30", ["cold_sweat"]],
    "1f631": ["\uD83D\uDE31", ["scream"]],
    "1f632": ["\uD83D\uDE32", ["astonished"]],
    "1f633": ["\uD83D\uDE33", ["flushed"]],
    "1f634": ["\uD83D\uDE34", ["sleeping"]],
    "1f635": ["\uD83D\uDE35", ["dizzy_face"]],
    "1f636": ["\uD83D\uDE36", ["no_mouth"]],
    "1f637": ["\uD83D\uDE37", ["mask"]],
    "1f638": ["\uD83D\uDE38", ["smile_cat"]],
    "1f639": ["\uD83D\uDE39", ["joy_cat"]],
    "1f63a": ["\uD83D\uDE3A", ["smiley_cat"]],
    "1f63b": ["\uD83D\uDE3B", ["heart_eyes_cat"]],
    "1f63c": ["\uD83D\uDE3C", ["smirk_cat"]],
    "1f63d": ["\uD83D\uDE3D", ["kissing_cat"]],
    "1f63e": ["\uD83D\uDE3E", ["pouting_cat"]],
    "1f63f": ["\uD83D\uDE3F", ["crying_cat_face"]],
    "1f640": ["\uD83D\uDE40", ["scream_cat"]],
    "1f645": ["\uD83D\uDE45", ["no_good"]],
    "1f646": ["\uD83D\uDE46", ["ok_woman"]],
    "1f647": ["\uD83D\uDE47", ["bow"]],
    "1f648": ["\uD83D\uDE48", ["see_no_evil"]],
    "1f649": ["\uD83D\uDE49", ["hear_no_evil"]],
    "1f64a": ["\uD83D\uDE4A", ["speak_no_evil"]],
    "1f64b": ["\uD83D\uDE4B", ["raising_hand"]],
    "1f64c": ["\uD83D\uDE4C", ["raised_hands"]],
    "1f64d": ["\uD83D\uDE4D", ["person_frowning"]],
    "1f64e": ["\uD83D\uDE4E", ["person_with_pouting_face"]],
    "1f64f": ["\uD83D\uDE4F", ["pray"]],
    "1f680": ["\uD83D\uDE80", ["rocket"]],
    "1f681": ["\uD83D\uDE81", ["helicopter"]],
    "1f682": ["\uD83D\uDE82", ["steam_locomotive"]],
    "1f683": ["\uD83D\uDE83", ["railway_car"]],
    "1f68b": ["\uD83D\uDE8B", ["train"]],
    "1f684": ["\uD83D\uDE84", ["bullettrain_side"]],
    "1f685": ["\uD83D\uDE85", ["bullettrain_front"]],
    "1f686": ["\uD83D\uDE86", ["train2"]],
    "1f687": ["\uD83D\uDE87", ["metro"]],
    "1f688": ["\uD83D\uDE88", ["light_rail"]],
    "1f689": ["\uD83D\uDE89", ["station"]],
    "1f68a": ["\uD83D\uDE8A", ["tram"]],
    "1f68c": ["\uD83D\uDE8C", ["bus"]],
    "1f68d": ["\uD83D\uDE8D", ["oncoming_bus"]],
    "1f68e": ["\uD83D\uDE8E", ["trolleybus"]],
    "1f68f": ["\uD83D\uDE8F", ["busstop"]],
    "1f690": ["\uD83D\uDE90", ["minibus"]],
    "1f691": ["\uD83D\uDE91", ["ambulance"]],
    "1f692": ["\uD83D\uDE92", ["fire_engine"]],
    "1f693": ["\uD83D\uDE93", ["police_car"]],
    "1f694": ["\uD83D\uDE94", ["oncoming_police_car"]],
    "1f695": ["\uD83D\uDE95", ["taxi"]],
    "1f696": ["\uD83D\uDE96", ["oncoming_taxi"]],
    "1f697": ["\uD83D\uDE97", ["car", "red_car"]],
    "1f698": ["\uD83D\uDE98", ["oncoming_automobile"]],
    "1f699": ["\uD83D\uDE99", ["blue_car"]],
    "1f69a": ["\uD83D\uDE9A", ["truck"]],
    "1f69b": ["\uD83D\uDE9B", ["articulated_lorry"]],
    "1f69c": ["\uD83D\uDE9C", ["tractor"]],
    "1f69d": ["\uD83D\uDE9D", ["monorail"]],
    "1f69e": ["\uD83D\uDE9E", ["mountain_railway"]],
    "1f69f": ["\uD83D\uDE9F", ["suspension_railway"]],
    "1f6a0": ["\uD83D\uDEA0", ["mountain_cableway"]],
    "1f6a1": ["\uD83D\uDEA1", ["aerial_tramway"]],
    "1f6a2": ["\uD83D\uDEA2", ["ship"]],
    "1f6a3": ["\uD83D\uDEA3", ["rowboat"]],
    "1f6a4": ["\uD83D\uDEA4", ["speedboat"]],
    "1f6a5": ["\uD83D\uDEA5", ["traffic_light"]],
    "1f6a6": ["\uD83D\uDEA6", ["vertical_traffic_light"]],
    "1f6a7": ["\uD83D\uDEA7", ["construction"]],
    "1f6a8": ["\uD83D\uDEA8", ["rotating_light"]],
    "1f6a9": ["\uD83D\uDEA9", ["triangular_flag_on_post"]],
    "1f6aa": ["\uD83D\uDEAA", ["door"]],
    "1f6ab": ["\uD83D\uDEAB", ["no_entry_sign"]],
    "1f6ac": ["\uD83D\uDEAC", ["smoking"]],
    "1f6ad": ["\uD83D\uDEAD", ["no_smoking"]],
    "1f6ae": ["\uD83D\uDEAE", ["put_litter_in_its_place"]],
    "1f6af": ["\uD83D\uDEAF", ["do_not_litter"]],
    "1f6b0": ["\uD83D\uDEB0", ["potable_water"]],
    "1f6b1": ["\uD83D\uDEB1", ["non-potable_water"]],
    "1f6b2": ["\uD83D\uDEB2", ["bike"]],
    "1f6b3": ["\uD83D\uDEB3", ["no_bicycles"]],
    "1f6b4": ["\uD83D\uDEB4", ["bicyclist"]],
    "1f6b5": ["\uD83D\uDEB5", ["mountain_bicyclist"]],
    "1f6b6": ["\uD83D\uDEB6", ["walking"]],
    "1f6b7": ["\uD83D\uDEB7", ["no_pedestrians"]],
    "1f6b8": ["\uD83D\uDEB8", ["children_crossing"]],
    "1f6b9": ["\uD83D\uDEB9", ["mens"]],
    "1f6ba": ["\uD83D\uDEBA", ["womens"]],
    "1f6bb": ["\uD83D\uDEBB", ["restroom"]],
    "1f6bc": ["\uD83D\uDEBC", ["baby_symbol"]],
    "1f6bd": ["\uD83D\uDEBD", ["toilet"]],
    "1f6be": ["\uD83D\uDEBE", ["wc"]],
    "1f6bf": ["\uD83D\uDEBF", ["shower"]],
    "1f6c0": ["\uD83D\uDEC0", ["bath"]],
    "1f6c1": ["\uD83D\uDEC1", ["bathtub"]],
    "1f6c2": ["\uD83D\uDEC2", ["passport_control"]],
    "1f6c3": ["\uD83D\uDEC3", ["customs"]],
    "1f6c4": ["\uD83D\uDEC4", ["baggage_claim"]],
    "1f6c5": ["\uD83D\uDEC5", ["left_luggage"]],
    "0023": ["\u0023\u20E3", ["hash"]],
    "0030": ["\u0030\u20E3", ["zero"]],
    "0031": ["\u0031\u20E3", ["one"]],
    "0032": ["\u0032\u20E3", ["two"]],
    "0033": ["\u0033\u20E3", ["three"]],
    "0034": ["\u0034\u20E3", ["four"]],
    "0035": ["\u0035\u20E3", ["five"]],
    "0036": ["\u0036\u20E3", ["six"]],
    "0037": ["\u0037\u20E3", ["seven"]],
    "0038": ["\u0038\u20E3", ["eight"]],
    "0039": ["\u0039\u20E3", ["nine"]],
    "1f1e8-1f1f3": ["\uD83C\uDDE8\uD83C\uDDF3", ["cn"]],
    "1f1e9-1f1ea": ["\uD83C\uDDE9\uD83C\uDDEA", ["de"]],
    "1f1ea-1f1f8": ["\uD83C\uDDEA\uD83C\uDDF8", ["es"]],
    "1f1eb-1f1f7": ["\uD83C\uDDEB\uD83C\uDDF7", ["fr"]],
    "1f1ec-1f1e7": ["\uD83C\uDDEC\uD83C\uDDE7", ["gb", "uk"]],
    "1f1ee-1f1f9": ["\uD83C\uDDEE\uD83C\uDDF9", ["it"]],
    "1f1ef-1f1f5": ["\uD83C\uDDEF\uD83C\uDDF5", ["jp"]],
    "1f1f0-1f1f7": ["\uD83C\uDDF0\uD83C\uDDF7", ["kr"]],
    "1f1f7-1f1fa": ["\uD83C\uDDF7\uD83C\uDDFA", ["ru"]],
    "1f1fa-1f1f8": ["\uD83C\uDDFA\uD83C\uDDF8", ["us"]]
}

Config.EmojiCategories = [
    ["1f604", "1f603", "1f600", "1f60a", "263a", "1f609", "1f60d", "1f618", "1f61a", "1f617", "1f619", "1f61c", "1f61d", "1f61b", "1f633", "1f601", "1f614", "1f60c", "1f612", "1f61e", "1f623", "1f622", "1f602", "1f62d", "1f62a", "1f625", "1f630", "1f605", "1f613", "1f629", "1f62b", "1f628", "1f631", "1f620", "1f621", "1f624", "1f616", "1f606", "1f60b", "1f637", "1f60e", "1f634", "1f635", "1f632", "1f61f", "1f626", "1f627", "1f608", "1f47f", "1f62e", "1f62c", "1f610", "1f615", "1f62f", "1f636", "1f607", "1f60f", "1f611", "1f472", "1f473", "1f46e", "1f477", "1f482", "1f476", "1f466", "1f467", "1f468", "1f469", "1f474", "1f475", "1f471", "1f47c", "1f478", "1f63a", "1f638", "1f63b", "1f63d", "1f63c", "1f640", "1f63f", "1f639", "1f63e", "1f479", "1f47a", "1f648", "1f649", "1f64a", "1f480", "1f47d", "1f4a9", "1f525", "2728", "1f31f", "1f4ab", "1f4a5", "1f4a2", "1f4a6", "1f4a7", "1f4a4", "1f4a8", "1f442", "1f440", "1f443", "1f445", "1f444", "1f44d", "1f44e", "1f44c", "1f44a", "270a", "270c", "1f44b", "270b", "1f450", "1f446", "1f447", "1f449", "1f448", "1f64c", "1f64f", "261d", "1f44f", "1f4aa", "1f6b6", "1f3c3", "1f483", "1f46b", "1f46a", "1f46c", "1f46d", "1f48f", "1f491", "1f46f", "1f646", "1f645", "1f481", "1f64b", "1f486", "1f487", "1f485", "1f470", "1f64e", "1f64d", "1f647", "1f3a9", "1f451", "1f452", "1f45f", "1f45e", "1f461", "1f460", "1f462", "1f455", "1f454", "1f45a", "1f457", "1f3bd", "1f456", "1f458", "1f459", "1f4bc", "1f45c", "1f45d", "1f45b", "1f453", "1f380", "1f302", "1f484", "1f49b", "1f499", "1f49c", "1f49a", "2764", "1f494", "1f497", "1f493", "1f495", "1f496", "1f49e", "1f498", "1f48c", "1f48b", "1f48d", "1f48e", "1f464", "1f465", "1f4ac", "1f463", "1f4ad"],
    ["1f436", "1f43a", "1f431", "1f42d", "1f439", "1f430", "1f438", "1f42f", "1f428", "1f43b", "1f437", "1f43d", "1f42e", "1f417", "1f435", "1f412", "1f434", "1f411", "1f418", "1f43c", "1f427", "1f426", "1f424", "1f425", "1f423", "1f414", "1f40d", "1f422", "1f41b", "1f41d", "1f41c", "1f41e", "1f40c", "1f419", "1f41a", "1f420", "1f41f", "1f42c", "1f433", "1f40b", "1f404", "1f40f", "1f400", "1f403", "1f405", "1f407", "1f409", "1f40e", "1f410", "1f413", "1f415", "1f416", "1f401", "1f402", "1f432", "1f421", "1f40a", "1f42b", "1f42a", "1f406", "1f408", "1f429", "1f43e", "1f490", "1f338", "1f337", "1f340", "1f339", "1f33b", "1f33a", "1f341", "1f343", "1f342", "1f33f", "1f33e", "1f344", "1f335", "1f334", "1f332", "1f333", "1f330", "1f331", "1f33c", "1f310", "1f31e", "1f31d", "1f31a", "1f311", "1f312", "1f313", "1f314", "1f315", "1f316", "1f317", "1f318", "1f31c", "1f31b", "1f319", "1f30d", "1f30e", "1f30f", "1f30b", "1f30c", "1f320", "2b50", "2600", "26c5", "2601", "26a1", "2614", "2744", "26c4", "1f300", "1f301", "1f308", "1f30a"],
    ["1f38d", "1f49d", "1f38e", "1f392", "1f393", "1f38f", "1f386", "1f387", "1f390", "1f391", "1f383", "1f47b", "1f385", "1f384", "1f381", "1f38b", "1f389", "1f38a", "1f388", "1f38c", "1f52e", "1f3a5", "1f4f7", "1f4f9", "1f4fc", "1f4bf", "1f4c0", "1f4bd", "1f4be", "1f4bb", "1f4f1", "260e", "1f4de", "1f4df", "1f4e0", "1f4e1", "1f4fa", "1f4fb", "1f50a", "1f509", "1f508", "1f507", "1f514", "1f515", "1f4e3", "1f4e2", "23f3", "231b", "23f0", "231a", "1f513", "1f512", "1f50f", "1f510", "1f511", "1f50e", "1f4a1", "1f526", "1f506", "1f505", "1f50c", "1f50b", "1f50d", "1f6c0", "1f6c1", "1f6bf", "1f6bd", "1f527", "1f529", "1f528", "1f6aa", "1f6ac", "1f4a3", "1f52b", "1f52a", "1f48a", "1f489", "1f4b0", "1f4b4", "1f4b5", "1f4b7", "1f4b6", "1f4b3", "1f4b8", "1f4f2", "1f4e7", "1f4e5", "1f4e4", "2709", "1f4e9", "1f4e8", "1f4ef", "1f4eb", "1f4ea", "1f4ec", "1f4ed", "1f4ee", "1f4e6", "1f4dd", "1f4c4", "1f4c3", "1f4d1", "1f4ca", "1f4c8", "1f4c9", "1f4dc", "1f4cb", "1f4c5", "1f4c6", "1f4c7", "1f4c1", "1f4c2", "2702", "1f4cc", "1f4ce", "2712", "270f", "1f4cf", "1f4d0", "1f4d5", "1f4d7", "1f4d8", "1f4d9", "1f4d3", "1f4d4", "1f4d2", "1f4da", "1f4d6", "1f516", "1f4db", "1f52c", "1f52d", "1f4f0", "1f3a8", "1f3ac", "1f3a4", "1f3a7", "1f3bc", "1f3b5", "1f3b6", "1f3b9", "1f3bb", "1f3ba", "1f3b7", "1f3b8", "1f47e", "1f3ae", "1f0cf", "1f3b4", "1f004", "1f3b2", "1f3af", "1f3c8", "1f3c0", "26bd", "26be", "1f3be", "1f3b1", "1f3c9", "1f3b3", "26f3", "1f6b5", "1f6b4", "1f3c1", "1f3c7", "1f3c6", "1f3bf", "1f3c2", "1f3ca", "1f3c4", "1f3a3", "2615", "1f375", "1f376", "1f37c", "1f37a", "1f37b", "1f378", "1f379", "1f377", "1f374", "1f355", "1f354", "1f35f", "1f357", "1f356", "1f35d", "1f35b", "1f364", "1f371", "1f363", "1f365", "1f359", "1f358", "1f35a", "1f35c", "1f372", "1f362", "1f361", "1f373", "1f35e", "1f369", "1f36e", "1f366", "1f368", "1f367", "1f382", "1f370", "1f36a", "1f36b", "1f36c", "1f36d", "1f36f", "1f34e", "1f34f", "1f34a", "1f34b", "1f352", "1f347", "1f349", "1f353", "1f351", "1f348", "1f34c", "1f350", "1f34d", "1f360", "1f346", "1f345", "1f33d"],
    ["1f3e0", "1f3e1", "1f3eb", "1f3e2", "1f3e3", "1f3e5", "1f3e6", "1f3ea", "1f3e9", "1f3e8", "1f492", "26ea", "1f3ec", "1f3e4", "1f307", "1f306", "1f3ef", "1f3f0", "26fa", "1f3ed", "1f5fc", "1f5fe", "1f5fb", "1f304", "1f305", "1f303", "1f5fd", "1f309", "1f3a0", "1f3a1", "26f2", "1f3a2", "1f6a2", "26f5", "1f6a4", "1f6a3", "2693", "1f680", "2708", "1f4ba", "1f681", "1f682", "1f68a", "1f689", "1f69e", "1f686", "1f684", "1f685", "1f688", "1f687", "1f69d", "1f683", "1f68b", "1f68e", "1f68c", "1f68d", "1f699", "1f698", "1f697", "1f695", "1f696", "1f69b", "1f69a", "1f6a8", "1f693", "1f694", "1f692", "1f691", "1f690", "1f6b2", "1f6a1", "1f69f", "1f6a0", "1f69c", "1f488", "1f68f", "1f3ab", "1f6a6", "1f6a5", "26a0", "1f6a7", "1f530", "26fd", "1f3ee", "1f3b0", "2668", "1f5ff", "1f3aa", "1f3ad", "1f4cd", "1f6a9", "1f1ef-1f1f5", "1f1f0-1f1f7", "1f1e9-1f1ea", "1f1e8-1f1f3", "1f1fa-1f1f8", "1f1eb-1f1f7", "1f1ea-1f1f8", "1f1ee-1f1f9", "1f1f7-1f1fa", "1f1ec-1f1e7"],
    ["0031", "0032", "0033", "0034", "0035", "0036", "0037", "0038", "0039", "0030", "1f51f", "1f522", "0023", "1f523", "2b06", "2b07", "2b05", "27a1", "1f520", "1f521", "1f524", "2197", "2196", "2198", "2199", "2194", "2195", "1f504", "25c0", "25b6", "1f53c", "1f53d", "21a9", "21aa", "2139", "23ea", "23e9", "23eb", "23ec", "2935", "2934", "1f197", "1f500", "1f501", "1f502", "1f195", "1f199", "1f192", "1f193", "1f196", "1f4f6", "1f3a6", "1f201", "1f22f", "1f233", "1f235", "1f234", "1f232", "1f250", "1f239", "1f23a", "1f236", "1f21a", "1f6bb", "1f6b9", "1f6ba", "1f6bc", "1f6be", "1f6b0", "1f6ae", "1f17f", "267f", "1f6ad", "1f237", "1f238", "1f202", "24c2", "1f6c2", "1f6c4", "1f6c5", "1f6c3", "1f251", "3299", "3297", "1f191", "1f198", "1f194", "1f6ab", "1f51e", "1f4f5", "1f6af", "1f6b1", "1f6b3", "1f6b7", "1f6b8", "26d4", "2733", "2747", "274e", "2705", "2734", "1f49f", "1f19a", "1f4f3", "1f4f4", "1f170", "1f171", "1f18e", "1f17e", "1f4a0", "27bf", "267b", "2648", "2649", "264a", "264b", "264c", "264d", "264e", "264f", "2650", "2651", "2652", "2653", "26ce", "1f52f", "1f3e7", "1f4b9", "1f4b2", "1f4b1", "00a9", "00ae", "2122", "274c", "203c", "2049", "2757", "2753", "2755", "2754", "2b55", "1f51d", "1f51a", "1f519", "1f51b", "1f51c", "1f503", "1f55b", "1f567", "1f550", "1f55c", "1f551", "1f55d", "1f552", "1f55e", "1f553", "1f55f", "1f554", "1f560", "1f555", "1f556", "1f557", "1f558", "1f559", "1f55a", "1f561", "1f562", "1f563", "1f564", "1f565", "1f566", "2716", "2795", "2796", "2797", "2660", "2665", "2663", "2666", "1f4ae", "1f4af", "2714", "2611", "1f518", "1f517", "27b0", "3030", "303d", "1f531", "25fc", "25fb", "25fe", "25fd", "25aa", "25ab", "1f53a", "1f532", "1f533", "26ab", "26aa", "1f534", "1f535", "1f53b", "2b1c", "2b1b", "1f536", "1f537", "1f538", "1f539"]
];



Config.EmojiCategorySpritesheetDimens = [
    [7, 27],
    [4, 29],
    [7, 33],
    [3, 34],
    [7, 34]
];


Config.emoji_data = {
    "00a9": [
        ["\u00A9"], "\uE24E", "\uDBBA\uDF29", ["copyright"], 0, 0
    ],
    "00ae": [
        ["\u00AE"], "\uE24F", "\uDBBA\uDF2D", ["registered"], 0, 1
    ],
    "203c": [
        ["\u203C\uFE0F", "\u203C"], "", "\uDBBA\uDF06", ["bangbang"], 0, 2
    ],
    "2049": [
        ["\u2049\uFE0F", "\u2049"], "", "\uDBBA\uDF05", ["interrobang"], 0, 3
    ],
    "2122": [
        ["\u2122"], "\uE537", "\uDBBA\uDF2A", ["tm"], 0, 4
    ],
    "2139": [
        ["\u2139\uFE0F", "\u2139"], "", "\uDBBA\uDF47", ["information_source"], 0, 5
    ],
    "2194": [
        ["\u2194\uFE0F", "\u2194"], "", "\uDBBA\uDEF6", ["left_right_arrow"], 0, 6
    ],
    "2195": [
        ["\u2195\uFE0F", "\u2195"], "", "\uDBBA\uDEF7", ["arrow_up_down"], 0, 7
    ],
    "2196": [
        ["\u2196\uFE0F", "\u2196"], "\uE237", "\uDBBA\uDEF2", ["arrow_upper_left"], 0, 8
    ],
    "2197": [
        ["\u2197\uFE0F", "\u2197"], "\uE236", "\uDBBA\uDEF0", ["arrow_upper_right"], 0, 9
    ],
    "2198": [
        ["\u2198\uFE0F", "\u2198"], "\uE238", "\uDBBA\uDEF1", ["arrow_lower_right"], 0, 10
    ],
    "2199": [
        ["\u2199\uFE0F", "\u2199"], "\uE239", "\uDBBA\uDEF3", ["arrow_lower_left"], 0, 11
    ],
    "21a9": [
        ["\u21A9\uFE0F", "\u21A9"], "", "\uDBBA\uDF83", ["leftwards_arrow_with_hook"], 0, 12
    ],
    "21aa": [
        ["\u21AA\uFE0F", "\u21AA"], "", "\uDBBA\uDF88", ["arrow_right_hook"], 0, 13
    ],
    "231a": [
        ["\u231A\uFE0F", "\u231A"], "", "\uDBB8\uDC1D", ["watch"], 0, 14
    ],
    "231b": [
        ["\u231B\uFE0F", "\u231B"], "", "\uDBB8\uDC1C", ["hourglass"], 0, 15
    ],
    "23e9": [
        ["\u23E9"], "\uE23C", "\uDBBA\uDEFE", ["fast_forward"], 0, 16
    ],
    "23ea": [
        ["\u23EA"], "\uE23D", "\uDBBA\uDEFF", ["rewind"], 0, 17
    ],
    "23eb": [
        ["\u23EB"], "", "\uDBBA\uDF03", ["arrow_double_up"], 0, 18
    ],
    "23ec": [
        ["\u23EC"], "", "\uDBBA\uDF02", ["arrow_double_down"], 0, 19
    ],
    "23f0": [
        ["\u23F0"], "\uE02D", "\uDBB8\uDC2A", ["alarm_clock"], 0, 20
    ],
    "23f3": [
        ["\u23F3"], "", "\uDBB8\uDC1B", ["hourglass_flowing_sand"], 0, 21
    ],
    "24c2": [
        ["\u24C2\uFE0F", "\u24C2"], "\uE434", "\uDBB9\uDFE1", ["m"], 0, 22
    ],
    "25aa": [
        ["\u25AA\uFE0F", "\u25AA"], "\uE21A", "\uDBBA\uDF6E", ["black_small_square"], 0, 23
    ],
    "25ab": [
        ["\u25AB\uFE0F", "\u25AB"], "\uE21B", "\uDBBA\uDF6D", ["white_small_square"], 0, 24
    ],
    "25b6": [
        ["\u25B6\uFE0F", "\u25B6"], "\uE23A", "\uDBBA\uDEFC", ["arrow_forward"], 0, 25
    ],
    "25c0": [
        ["\u25C0\uFE0F", "\u25C0"], "\uE23B", "\uDBBA\uDEFD", ["arrow_backward"], 0, 26
    ],
    "25fb": [
        ["\u25FB\uFE0F", "\u25FB"], "\uE21B", "\uDBBA\uDF71", ["white_medium_square"], 0, 27
    ],
    "25fc": [
        ["\u25FC\uFE0F", "\u25FC"], "\uE21A", "\uDBBA\uDF72", ["black_medium_square"], 0, 28
    ],
    "25fd": [
        ["\u25FD\uFE0F", "\u25FD"], "\uE21B", "\uDBBA\uDF6F", ["white_medium_small_square"], 0, 29
    ],
    "25fe": [
        ["\u25FE\uFE0F", "\u25FE"], "\uE21A", "\uDBBA\uDF70", ["black_medium_small_square"], 1, 0
    ],
    "2600": [
        ["\u2600\uFE0F", "\u2600"], "\uE04A", "\uDBB8\uDC00", ["sunny"], 1, 1
    ],
    "2601": [
        ["\u2601\uFE0F", "\u2601"], "\uE049", "\uDBB8\uDC01", ["cloud"], 1, 2
    ],
    "260e": [
        ["\u260E\uFE0F", "\u260E"], "\uE009", "\uDBB9\uDD23", ["phone", "telephone"], 1, 3
    ],
    "2611": [
        ["\u2611\uFE0F", "\u2611"], "", "\uDBBA\uDF8B", ["ballot_box_with_check"], 1, 4
    ],
    "2614": [
        ["\u2614\uFE0F", "\u2614"], "\uE04B", "\uDBB8\uDC02", ["umbrella"], 1, 5
    ],
    "2615": [
        ["\u2615\uFE0F", "\u2615"], "\uE045", "\uDBBA\uDD81", ["coffee"], 1, 6
    ],
    "261d": [
        ["\u261D\uFE0F", "\u261D"], "\uE00F", "\uDBBA\uDF98", ["point_up"], 1, 7
    ],
    "263a": [
        ["\u263A\uFE0F", "\u263A"], "\uE414", "\uDBB8\uDF36", ["relaxed"], 1, 8
    ],
    "2648": [
        ["\u2648\uFE0F", "\u2648"], "\uE23F", "\uDBB8\uDC2B", ["aries"], 1, 9
    ],
    "2649": [
        ["\u2649\uFE0F", "\u2649"], "\uE240", "\uDBB8\uDC2C", ["taurus"], 1, 10
    ],
    "264a": [
        ["\u264A\uFE0F", "\u264A"], "\uE241", "\uDBB8\uDC2D", ["gemini"], 1, 11
    ],
    "264b": [
        ["\u264B\uFE0F", "\u264B"], "\uE242", "\uDBB8\uDC2E", ["cancer"], 1, 12
    ],
    "264c": [
        ["\u264C\uFE0F", "\u264C"], "\uE243", "\uDBB8\uDC2F", ["leo"], 1, 13
    ],
    "264d": [
        ["\u264D\uFE0F", "\u264D"], "\uE244", "\uDBB8\uDC30", ["virgo"], 1, 14
    ],
    "264e": [
        ["\u264E\uFE0F", "\u264E"], "\uE245", "\uDBB8\uDC31", ["libra"], 1, 15
    ],
    "264f": [
        ["\u264F\uFE0F", "\u264F"], "\uE246", "\uDBB8\uDC32", ["scorpius"], 1, 16
    ],
    "2650": [
        ["\u2650\uFE0F", "\u2650"], "\uE247", "\uDBB8\uDC33", ["sagittarius"], 1, 17
    ],
    "2651": [
        ["\u2651\uFE0F", "\u2651"], "\uE248", "\uDBB8\uDC34", ["capricorn"], 1, 18
    ],
    "2652": [
        ["\u2652\uFE0F", "\u2652"], "\uE249", "\uDBB8\uDC35", ["aquarius"], 1, 19
    ],
    "2653": [
        ["\u2653\uFE0F", "\u2653"], "\uE24A", "\uDBB8\uDC36", ["pisces"], 1, 20
    ],
    "2660": [
        ["\u2660\uFE0F", "\u2660"], "\uE20E", "\uDBBA\uDF1B", ["spades"], 1, 21
    ],
    "2663": [
        ["\u2663\uFE0F", "\u2663"], "\uE20F", "\uDBBA\uDF1D", ["clubs"], 1, 22
    ],
    "2665": [
        ["\u2665\uFE0F", "\u2665"], "\uE20C", "\uDBBA\uDF1A", ["hearts"], 1, 23
    ],
    "2666": [
        ["\u2666\uFE0F", "\u2666"], "\uE20D", "\uDBBA\uDF1C", ["diamonds"], 1, 24
    ],
    "2668": [
        ["\u2668\uFE0F", "\u2668"], "\uE123", "\uDBB9\uDFFA", ["hotsprings"], 1, 25
    ],
    "267b": [
        ["\u267B\uFE0F", "\u267B"], "", "\uDBBA\uDF2C", ["recycle"], 1, 26
    ],
    "267f": [
        ["\u267F\uFE0F", "\u267F"], "\uE20A", "\uDBBA\uDF20", ["wheelchair"], 1, 27
    ],
    "2693": [
        ["\u2693\uFE0F", "\u2693"], "\uE202", "\uDBB9\uDCC1", ["anchor"], 1, 28
    ],
    "26a0": [
        ["\u26A0\uFE0F", "\u26A0"], "\uE252", "\uDBBA\uDF23", ["warning"], 1, 29
    ],
    "26a1": [
        ["\u26A1\uFE0F", "\u26A1"], "\uE13D", "\uDBB8\uDC04", ["zap"], 2, 0
    ],
    "26aa": [
        ["\u26AA\uFE0F", "\u26AA"], "\uE219", "\uDBBA\uDF65", ["white_circle"], 2, 1
    ],
    "26ab": [
        ["\u26AB\uFE0F", "\u26AB"], "\uE219", "\uDBBA\uDF66", ["black_circle"], 2, 2
    ],
    "26bd": [
        ["\u26BD\uFE0F", "\u26BD"], "\uE018", "\uDBB9\uDFD4", ["soccer"], 2, 3
    ],
    "26be": [
        ["\u26BE\uFE0F", "\u26BE"], "\uE016", "\uDBB9\uDFD1", ["baseball"], 2, 4
    ],
    "26c4": [
        ["\u26C4\uFE0F", "\u26C4"], "\uE048", "\uDBB8\uDC03", ["snowman"], 2, 5
    ],
    "26c5": [
        ["\u26C5\uFE0F", "\u26C5"], "\uE04A\uE049", "\uDBB8\uDC0F", ["partly_sunny"], 2, 6
    ],
    "26ce": [
        ["\u26CE"], "\uE24B", "\uDBB8\uDC37", ["ophiuchus"], 2, 7
    ],
    "26d4": [
        ["\u26D4\uFE0F", "\u26D4"], "\uE137", "\uDBBA\uDF26", ["no_entry"], 2, 8
    ],
    "26ea": [
        ["\u26EA\uFE0F", "\u26EA"], "\uE037", "\uDBB9\uDCBB", ["church"], 2, 9
    ],
    "26f2": [
        ["\u26F2\uFE0F", "\u26F2"], "\uE121", "\uDBB9\uDCBC", ["fountain"], 2, 10
    ],
    "26f3": [
        ["\u26F3\uFE0F", "\u26F3"], "\uE014", "\uDBB9\uDFD2", ["golf"], 2, 11
    ],
    "26f5": [
        ["\u26F5\uFE0F", "\u26F5"], "\uE01C", "\uDBB9\uDFEA", ["boat", "sailboat"], 2, 12
    ],
    "26fa": [
        ["\u26FA\uFE0F", "\u26FA"], "\uE122", "\uDBB9\uDFFB", ["tent"], 2, 13
    ],
    "26fd": [
        ["\u26FD\uFE0F", "\u26FD"], "\uE03A", "\uDBB9\uDFF5", ["fuelpump"], 2, 14
    ],
    "2702": [
        ["\u2702\uFE0F", "\u2702"], "\uE313", "\uDBB9\uDD3E", ["scissors"], 2, 15
    ],
    "2705": [
        ["\u2705"], "", "\uDBBA\uDF4A", ["white_check_mark"], 2, 16
    ],
    "2708": [
        ["\u2708\uFE0F", "\u2708"], "\uE01D", "\uDBB9\uDFE9", ["airplane"], 2, 17
    ],
    "2709": [
        ["\u2709\uFE0F", "\u2709"], "\uE103", "\uDBB9\uDD29", ["email", "envelope"], 2, 18
    ],
    "270a": [
        ["\u270A"], "\uE010", "\uDBBA\uDF93", ["fist"], 2, 19
    ],
    "270b": [
        ["\u270B"], "\uE012", "\uDBBA\uDF95", ["hand", "raised_hand"], 2, 20
    ],
    "270c": [
        ["\u270C\uFE0F", "\u270C"], "\uE011", "\uDBBA\uDF94", ["v"], 2, 21
    ],
    "270f": [
        ["\u270F\uFE0F", "\u270F"], "\uE301", "\uDBB9\uDD39", ["pencil2"], 2, 22
    ],
    "2712": [
        ["\u2712\uFE0F", "\u2712"], "", "\uDBB9\uDD36", ["black_nib"], 2, 23
    ],
    "2714": [
        ["\u2714\uFE0F", "\u2714"], "", "\uDBBA\uDF49", ["heavy_check_mark"], 2, 24
    ],
    "2716": [
        ["\u2716\uFE0F", "\u2716"], "\uE333", "\uDBBA\uDF53", ["heavy_multiplication_x"], 2, 25
    ],
    "2728": [
        ["\u2728"], "\uE32E", "\uDBBA\uDF60", ["sparkles"], 2, 26
    ],
    "2733": [
        ["\u2733\uFE0F", "\u2733"], "\uE206", "\uDBBA\uDF62", ["eight_spoked_asterisk"], 2, 27
    ],
    "2734": [
        ["\u2734\uFE0F", "\u2734"], "\uE205", "\uDBBA\uDF61", ["eight_pointed_black_star"], 2, 28
    ],
    "2744": [
        ["\u2744\uFE0F", "\u2744"], "", "\uDBB8\uDC0E", ["snowflake"], 2, 29
    ],
    "2747": [
        ["\u2747\uFE0F", "\u2747"], "\uE32E", "\uDBBA\uDF77", ["sparkle"], 3, 0
    ],
    "274c": [
        ["\u274C"], "\uE333", "\uDBBA\uDF45", ["x"], 3, 1
    ],
    "274e": [
        ["\u274E"], "\uE333", "\uDBBA\uDF46", ["negative_squared_cross_mark"], 3, 2
    ],
    "2753": [
        ["\u2753"], "\uE020", "\uDBBA\uDF09", ["question"], 3, 3
    ],
    "2754": [
        ["\u2754"], "\uE336", "\uDBBA\uDF0A", ["grey_question"], 3, 4
    ],
    "2755": [
        ["\u2755"], "\uE337", "\uDBBA\uDF0B", ["grey_exclamation"], 3, 5
    ],
    "2757": [
        ["\u2757\uFE0F", "\u2757"], "\uE021", "\uDBBA\uDF04", ["exclamation", "heavy_exclamation_mark"], 3, 6
    ],
    "2764": [
        ["\u2764\uFE0F", "\u2764"], "\uE022", "\uDBBA\uDF0C", ["heart"], 3, 7, "<3"
    ],
    "2795": [
        ["\u2795"], "", "\uDBBA\uDF51", ["heavy_plus_sign"], 3, 8
    ],
    "2796": [
        ["\u2796"], "", "\uDBBA\uDF52", ["heavy_minus_sign"], 3, 9
    ],
    "2797": [
        ["\u2797"], "", "\uDBBA\uDF54", ["heavy_division_sign"], 3, 10
    ],
    "27a1": [
        ["\u27A1\uFE0F", "\u27A1"], "\uE234", "\uDBBA\uDEFA", ["arrow_right"], 3, 11
    ],
    "27b0": [
        ["\u27B0"], "", "\uDBBA\uDF08", ["curly_loop"], 3, 12
    ],
    "27bf": [
        ["\u27BF"], "\uE211", "\uDBBA\uDC2B", ["loop"], 3, 13
    ],
    "2934": [
        ["\u2934\uFE0F", "\u2934"], "\uE236", "\uDBBA\uDEF4", ["arrow_heading_up"], 3, 14
    ],
    "2935": [
        ["\u2935\uFE0F", "\u2935"], "\uE238", "\uDBBA\uDEF5", ["arrow_heading_down"], 3, 15
    ],
    "2b05": [
        ["\u2B05\uFE0F", "\u2B05"], "\uE235", "\uDBBA\uDEFB", ["arrow_left"], 3, 16
    ],
    "2b06": [
        ["\u2B06\uFE0F", "\u2B06"], "\uE232", "\uDBBA\uDEF8", ["arrow_up"], 3, 17
    ],
    "2b07": [
        ["\u2B07\uFE0F", "\u2B07"], "\uE233", "\uDBBA\uDEF9", ["arrow_down"], 3, 18
    ],
    "2b1b": [
        ["\u2B1B\uFE0F", "\u2B1B"], "\uE21A", "\uDBBA\uDF6C", ["black_large_square"], 3, 19
    ],
    "2b1c": [
        ["\u2B1C\uFE0F", "\u2B1C"], "\uE21B", "\uDBBA\uDF6B", ["white_large_square"], 3, 20
    ],
    "2b50": [
        ["\u2B50\uFE0F", "\u2B50"], "\uE32F", "\uDBBA\uDF68", ["star"], 3, 21
    ],
    "2b55": [
        ["\u2B55\uFE0F", "\u2B55"], "\uE332", "\uDBBA\uDF44", ["o"], 3, 22
    ],
    "3030": [
        ["\u3030"], "", "\uDBBA\uDF07", ["wavy_dash"], 3, 23
    ],
    "303d": [
        ["\u303D\uFE0F", "\u303D"], "\uE12C", "\uDBBA\uDC1B", ["part_alternation_mark"], 3, 24
    ],
    "3297": [
        ["\u3297\uFE0F", "\u3297"], "\uE30D", "\uDBBA\uDF43", ["congratulations"], 3, 25
    ],
    "3299": [
        ["\u3299\uFE0F", "\u3299"], "\uE315", "\uDBBA\uDF2B", ["secret"], 3, 26
    ],
    "1f004": [
        ["\uD83C\uDC04\uFE0F", "\uD83C\uDC04"], "\uE12D", "\uDBBA\uDC0B", ["mahjong"], 3, 27
    ],
    "1f0cf": [
        ["\uD83C\uDCCF"], "", "\uDBBA\uDC12", ["black_joker"], 3, 28
    ],
    "1f170": [
        ["\uD83C\uDD70"], "\uE532", "\uDBB9\uDD0B", ["a"], 3, 29
    ],
    "1f171": [
        ["\uD83C\uDD71"], "\uE533", "\uDBB9\uDD0C", ["b"], 4, 0
    ],
    "1f17e": [
        ["\uD83C\uDD7E"], "\uE535", "\uDBB9\uDD0E", ["o2"], 4, 1
    ],
    "1f17f": [
        ["\uD83C\uDD7F\uFE0F", "\uD83C\uDD7F"], "\uE14F", "\uDBB9\uDFF6", ["parking"], 4, 2
    ],
    "1f18e": [
        ["\uD83C\uDD8E"], "\uE534", "\uDBB9\uDD0D", ["ab"], 4, 3
    ],
    "1f191": [
        ["\uD83C\uDD91"], "", "\uDBBA\uDF84", ["cl"], 4, 4
    ],
    "1f192": [
        ["\uD83C\uDD92"], "\uE214", "\uDBBA\uDF38", ["cool"], 4, 5
    ],
    "1f193": [
        ["\uD83C\uDD93"], "", "\uDBBA\uDF21", ["free"], 4, 6
    ],
    "1f194": [
        ["\uD83C\uDD94"], "\uE229", "\uDBBA\uDF81", ["id"], 4, 7
    ],
    "1f195": [
        ["\uD83C\uDD95"], "\uE212", "\uDBBA\uDF36", ["new"], 4, 8
    ],
    "1f196": [
        ["\uD83C\uDD96"], "", "\uDBBA\uDF28", ["ng"], 4, 9
    ],
    "1f197": [
        ["\uD83C\uDD97"], "\uE24D", "\uDBBA\uDF27", ["ok"], 4, 10
    ],
    "1f198": [
        ["\uD83C\uDD98"], "", "\uDBBA\uDF4F", ["sos"], 4, 11
    ],
    "1f199": [
        ["\uD83C\uDD99"], "\uE213", "\uDBBA\uDF37", ["up"], 4, 12
    ],
    "1f19a": [
        ["\uD83C\uDD9A"], "\uE12E", "\uDBBA\uDF32", ["vs"], 4, 13
    ],
    "1f201": [
        ["\uD83C\uDE01"], "\uE203", "\uDBBA\uDF24", ["koko"], 4, 14
    ],
    "1f202": [
        ["\uD83C\uDE02"], "\uE228", "\uDBBA\uDF3F", ["sa"], 4, 15
    ],
    "1f21a": [
        ["\uD83C\uDE1A\uFE0F", "\uD83C\uDE1A"], "\uE216", "\uDBBA\uDF3A", ["u7121"], 4, 16
    ],
    "1f22f": [
        ["\uD83C\uDE2F\uFE0F", "\uD83C\uDE2F"], "\uE22C", "\uDBBA\uDF40", ["u6307"], 4, 17
    ],
    "1f232": [
        ["\uD83C\uDE32"], "", "\uDBBA\uDF2E", ["u7981"], 4, 18
    ],
    "1f233": [
        ["\uD83C\uDE33"], "\uE22B", "\uDBBA\uDF2F", ["u7a7a"], 4, 19
    ],
    "1f234": [
        ["\uD83C\uDE34"], "", "\uDBBA\uDF30", ["u5408"], 4, 20
    ],
    "1f235": [
        ["\uD83C\uDE35"], "\uE22A", "\uDBBA\uDF31", ["u6e80"], 4, 21
    ],
    "1f236": [
        ["\uD83C\uDE36"], "\uE215", "\uDBBA\uDF39", ["u6709"], 4, 22
    ],
    "1f237": [
        ["\uD83C\uDE37"], "\uE217", "\uDBBA\uDF3B", ["u6708"], 4, 23
    ],
    "1f238": [
        ["\uD83C\uDE38"], "\uE218", "\uDBBA\uDF3C", ["u7533"], 4, 24
    ],
    "1f239": [
        ["\uD83C\uDE39"], "\uE227", "\uDBBA\uDF3E", ["u5272"], 4, 25
    ],
    "1f23a": [
        ["\uD83C\uDE3A"], "\uE22D", "\uDBBA\uDF41", ["u55b6"], 4, 26
    ],
    "1f250": [
        ["\uD83C\uDE50"], "\uE226", "\uDBBA\uDF3D", ["ideograph_advantage"], 4, 27
    ],
    "1f251": [
        ["\uD83C\uDE51"], "", "\uDBBA\uDF50", ["accept"], 4, 28
    ],
    "1f300": [
        ["\uD83C\uDF00"], "\uE443", "\uDBB8\uDC05", ["cyclone"], 4, 29
    ],
    "1f301": [
        ["\uD83C\uDF01"], "", "\uDBB8\uDC06", ["foggy"], 5, 0
    ],
    "1f302": [
        ["\uD83C\uDF02"], "\uE43C", "\uDBB8\uDC07", ["closed_umbrella"], 5, 1
    ],
    "1f303": [
        ["\uD83C\uDF03"], "\uE44B", "\uDBB8\uDC08", ["night_with_stars"], 5, 2
    ],
    "1f304": [
        ["\uD83C\uDF04"], "\uE04D", "\uDBB8\uDC09", ["sunrise_over_mountains"], 5, 3
    ],
    "1f305": [
        ["\uD83C\uDF05"], "\uE449", "\uDBB8\uDC0A", ["sunrise"], 5, 4
    ],
    "1f306": [
        ["\uD83C\uDF06"], "\uE146", "\uDBB8\uDC0B", ["city_sunset"], 5, 5
    ],
    "1f307": [
        ["\uD83C\uDF07"], "\uE44A", "\uDBB8\uDC0C", ["city_sunrise"], 5, 6
    ],
    "1f308": [
        ["\uD83C\uDF08"], "\uE44C", "\uDBB8\uDC0D", ["rainbow"], 5, 7
    ],
    "1f309": [
        ["\uD83C\uDF09"], "\uE44B", "\uDBB8\uDC10", ["bridge_at_night"], 5, 8
    ],
    "1f30a": [
        ["\uD83C\uDF0A"], "\uE43E", "\uDBB8\uDC38", ["ocean"], 5, 9
    ],
    "1f30b": [
        ["\uD83C\uDF0B"], "", "\uDBB8\uDC3A", ["volcano"], 5, 10
    ],
    "1f30c": [
        ["\uD83C\uDF0C"], "\uE44B", "\uDBB8\uDC3B", ["milky_way"], 5, 11
    ],
    "1f30d": [
        ["\uD83C\uDF0D"], "", "", ["earth_africa"], 5, 12
    ],
    "1f30e": [
        ["\uD83C\uDF0E"], "", "", ["earth_americas"], 5, 13
    ],
    "1f30f": [
        ["\uD83C\uDF0F"], "", "\uDBB8\uDC39", ["earth_asia"], 5, 14
    ],
    "1f310": [
        ["\uD83C\uDF10"], "", "", ["globe_with_meridians"], 5, 15
    ],
    "1f311": [
        ["\uD83C\uDF11"], "", "\uDBB8\uDC11", ["new_moon"], 5, 16
    ],
    "1f312": [
        ["\uD83C\uDF12"], "", "", ["waxing_crescent_moon"], 5, 17
    ],
    "1f313": [
        ["\uD83C\uDF13"], "\uE04C", "\uDBB8\uDC13", ["first_quarter_moon"], 5, 18
    ],
    "1f314": [
        ["\uD83C\uDF14"], "\uE04C", "\uDBB8\uDC12", ["moon", "waxing_gibbous_moon"], 5, 19
    ],
    "1f315": [
        ["\uD83C\uDF15"], "", "\uDBB8\uDC15", ["full_moon"], 5, 20
    ],
    "1f316": [
        ["\uD83C\uDF16"], "", "", ["waning_gibbous_moon"], 5, 21
    ],
    "1f317": [
        ["\uD83C\uDF17"], "", "", ["last_quarter_moon"], 5, 22
    ],
    "1f318": [
        ["\uD83C\uDF18"], "", "", ["waning_crescent_moon"], 5, 23
    ],
    "1f319": [
        ["\uD83C\uDF19"], "\uE04C", "\uDBB8\uDC14", ["crescent_moon"], 5, 24
    ],
    "1f31a": [
        ["\uD83C\uDF1A"], "", "", ["new_moon_with_face"], 5, 25
    ],
    "1f31b": [
        ["\uD83C\uDF1B"], "\uE04C", "\uDBB8\uDC16", ["first_quarter_moon_with_face"], 5, 26
    ],
    "1f31c": [
        ["\uD83C\uDF1C"], "", "", ["last_quarter_moon_with_face"], 5, 27
    ],
    "1f31d": [
        ["\uD83C\uDF1D"], "", "", ["full_moon_with_face"], 5, 28
    ],
    "1f31e": [
        ["\uD83C\uDF1E"], "", "", ["sun_with_face"], 5, 29
    ],
    "1f31f": [
        ["\uD83C\uDF1F"], "\uE335", "\uDBBA\uDF69", ["star2"], 6, 0
    ],
    "1f320": [
        ["\uD83C\uDF20"], "", "\uDBBA\uDF6A", ["stars"], 6, 1
    ],
    "1f330": [
        ["\uD83C\uDF30"], "", "\uDBB8\uDC4C", ["chestnut"], 6, 2
    ],
    "1f331": [
        ["\uD83C\uDF31"], "\uE110", "\uDBB8\uDC3E", ["seedling"], 6, 3
    ],
    "1f332": [
        ["\uD83C\uDF32"], "", "", ["evergreen_tree"], 6, 4
    ],
    "1f333": [
        ["\uD83C\uDF33"], "", "", ["deciduous_tree"], 6, 5
    ],
    "1f334": [
        ["\uD83C\uDF34"], "\uE307", "\uDBB8\uDC47", ["palm_tree"], 6, 6
    ],
    "1f335": [
        ["\uD83C\uDF35"], "\uE308", "\uDBB8\uDC48", ["cactus"], 6, 7
    ],
    "1f337": [
        ["\uD83C\uDF37"], "\uE304", "\uDBB8\uDC3D", ["tulip"], 6, 8
    ],
    "1f338": [
        ["\uD83C\uDF38"], "\uE030", "\uDBB8\uDC40", ["cherry_blossom"], 6, 9
    ],
    "1f339": [
        ["\uD83C\uDF39"], "\uE032", "\uDBB8\uDC41", ["rose"], 6, 10
    ],
    "1f33a": [
        ["\uD83C\uDF3A"], "\uE303", "\uDBB8\uDC45", ["hibiscus"], 6, 11
    ],
    "1f33b": [
        ["\uD83C\uDF3B"], "\uE305", "\uDBB8\uDC46", ["sunflower"], 6, 12
    ],
    "1f33c": [
        ["\uD83C\uDF3C"], "\uE305", "\uDBB8\uDC4D", ["blossom"], 6, 13
    ],
    "1f33d": [
        ["\uD83C\uDF3D"], "", "\uDBB8\uDC4A", ["corn"], 6, 14
    ],
    "1f33e": [
        ["\uD83C\uDF3E"], "\uE444", "\uDBB8\uDC49", ["ear_of_rice"], 6, 15
    ],
    "1f33f": [
        ["\uD83C\uDF3F"], "\uE110", "\uDBB8\uDC4E", ["herb"], 6, 16
    ],
    "1f340": [
        ["\uD83C\uDF40"], "\uE110", "\uDBB8\uDC3C", ["four_leaf_clover"], 6, 17
    ],
    "1f341": [
        ["\uD83C\uDF41"], "\uE118", "\uDBB8\uDC3F", ["maple_leaf"], 6, 18
    ],
    "1f342": [
        ["\uD83C\uDF42"], "\uE119", "\uDBB8\uDC42", ["fallen_leaf"], 6, 19
    ],
    "1f343": [
        ["\uD83C\uDF43"], "\uE447", "\uDBB8\uDC43", ["leaves"], 6, 20
    ],
    "1f344": [
        ["\uD83C\uDF44"], "", "\uDBB8\uDC4B", ["mushroom"], 6, 21
    ],
    "1f345": [
        ["\uD83C\uDF45"], "\uE349", "\uDBB8\uDC55", ["tomato"], 6, 22
    ],
    "1f346": [
        ["\uD83C\uDF46"], "\uE34A", "\uDBB8\uDC56", ["eggplant"], 6, 23
    ],
    "1f347": [
        ["\uD83C\uDF47"], "", "\uDBB8\uDC59", ["grapes"], 6, 24
    ],
    "1f348": [
        ["\uD83C\uDF48"], "", "\uDBB8\uDC57", ["melon"], 6, 25
    ],
    "1f349": [
        ["\uD83C\uDF49"], "\uE348", "\uDBB8\uDC54", ["watermelon"], 6, 26
    ],
    "1f34a": [
        ["\uD83C\uDF4A"], "\uE346", "\uDBB8\uDC52", ["tangerine"], 6, 27
    ],
    "1f34b": [
        ["\uD83C\uDF4B"], "", "", ["lemon"], 6, 28
    ],
    "1f34c": [
        ["\uD83C\uDF4C"], "", "\uDBB8\uDC50", ["banana"], 6, 29
    ],
    "1f34d": [
        ["\uD83C\uDF4D"], "", "\uDBB8\uDC58", ["pineapple"], 7, 0
    ],
    "1f34e": [
        ["\uD83C\uDF4E"], "\uE345", "\uDBB8\uDC51", ["apple"], 7, 1
    ],
    "1f34f": [
        ["\uD83C\uDF4F"], "\uE345", "\uDBB8\uDC5B", ["green_apple"], 7, 2
    ],
    "1f350": [
        ["\uD83C\uDF50"], "", "", ["pear"], 7, 3
    ],
    "1f351": [
        ["\uD83C\uDF51"], "", "\uDBB8\uDC5A", ["peach"], 7, 4
    ],
    "1f352": [
        ["\uD83C\uDF52"], "", "\uDBB8\uDC4F", ["cherries"], 7, 5
    ],
    "1f353": [
        ["\uD83C\uDF53"], "\uE347", "\uDBB8\uDC53", ["strawberry"], 7, 6
    ],
    "1f354": [
        ["\uD83C\uDF54"], "\uE120", "\uDBBA\uDD60", ["hamburger"], 7, 7
    ],
    "1f355": [
        ["\uD83C\uDF55"], "", "\uDBBA\uDD75", ["pizza"], 7, 8
    ],
    "1f356": [
        ["\uD83C\uDF56"], "", "\uDBBA\uDD72", ["meat_on_bone"], 7, 9
    ],
    "1f357": [
        ["\uD83C\uDF57"], "", "\uDBBA\uDD76", ["poultry_leg"], 7, 10
    ],
    "1f358": [
        ["\uD83C\uDF58"], "\uE33D", "\uDBBA\uDD69", ["rice_cracker"], 7, 11
    ],
    "1f359": [
        ["\uD83C\uDF59"], "\uE342", "\uDBBA\uDD61", ["rice_ball"], 7, 12
    ],
    "1f35a": [
        ["\uD83C\uDF5A"], "\uE33E", "\uDBBA\uDD6A", ["rice"], 7, 13
    ],
    "1f35b": [
        ["\uD83C\uDF5B"], "\uE341", "\uDBBA\uDD6C", ["curry"], 7, 14
    ],
    "1f35c": [
        ["\uD83C\uDF5C"], "\uE340", "\uDBBA\uDD63", ["ramen"], 7, 15
    ],
    "1f35d": [
        ["\uD83C\uDF5D"], "\uE33F", "\uDBBA\uDD6B", ["spaghetti"], 7, 16
    ],
    "1f35e": [
        ["\uD83C\uDF5E"], "\uE339", "\uDBBA\uDD64", ["bread"], 7, 17
    ],
    "1f35f": [
        ["\uD83C\uDF5F"], "\uE33B", "\uDBBA\uDD67", ["fries"], 7, 18
    ],
    "1f360": [
        ["\uD83C\uDF60"], "", "\uDBBA\uDD74", ["sweet_potato"], 7, 19
    ],
    "1f361": [
        ["\uD83C\uDF61"], "\uE33C", "\uDBBA\uDD68", ["dango"], 7, 20
    ],
    "1f362": [
        ["\uD83C\uDF62"], "\uE343", "\uDBBA\uDD6D", ["oden"], 7, 21
    ],
    "1f363": [
        ["\uD83C\uDF63"], "\uE344", "\uDBBA\uDD6E", ["sushi"], 7, 22
    ],
    "1f364": [
        ["\uD83C\uDF64"], "", "\uDBBA\uDD7F", ["fried_shrimp"], 7, 23
    ],
    "1f365": [
        ["\uD83C\uDF65"], "", "\uDBBA\uDD73", ["fish_cake"], 7, 24
    ],
    "1f366": [
        ["\uD83C\uDF66"], "\uE33A", "\uDBBA\uDD66", ["icecream"], 7, 25
    ],
    "1f367": [
        ["\uD83C\uDF67"], "\uE43F", "\uDBBA\uDD71", ["shaved_ice"], 7, 26
    ],
    "1f368": [
        ["\uD83C\uDF68"], "", "\uDBBA\uDD77", ["ice_cream"], 7, 27
    ],
    "1f369": [
        ["\uD83C\uDF69"], "", "\uDBBA\uDD78", ["doughnut"], 7, 28
    ],
    "1f36a": [
        ["\uD83C\uDF6A"], "", "\uDBBA\uDD79", ["cookie"], 7, 29
    ],
    "1f36b": [
        ["\uD83C\uDF6B"], "", "\uDBBA\uDD7A", ["chocolate_bar"], 8, 0
    ],
    "1f36c": [
        ["\uD83C\uDF6C"], "", "\uDBBA\uDD7B", ["candy"], 8, 1
    ],
    "1f36d": [
        ["\uD83C\uDF6D"], "", "\uDBBA\uDD7C", ["lollipop"], 8, 2
    ],
    "1f36e": [
        ["\uD83C\uDF6E"], "", "\uDBBA\uDD7D", ["custard"], 8, 3
    ],
    "1f36f": [
        ["\uD83C\uDF6F"], "", "\uDBBA\uDD7E", ["honey_pot"], 8, 4
    ],
    "1f370": [
        ["\uD83C\uDF70"], "\uE046", "\uDBBA\uDD62", ["cake"], 8, 5
    ],
    "1f371": [
        ["\uD83C\uDF71"], "\uE34C", "\uDBBA\uDD6F", ["bento"], 8, 6
    ],
    "1f372": [
        ["\uD83C\uDF72"], "\uE34D", "\uDBBA\uDD70", ["stew"], 8, 7
    ],
    "1f373": [
        ["\uD83C\uDF73"], "\uE147", "\uDBBA\uDD65", ["egg"], 8, 8
    ],
    "1f374": [
        ["\uD83C\uDF74"], "\uE043", "\uDBBA\uDD80", ["fork_and_knife"], 8, 9
    ],
    "1f375": [
        ["\uD83C\uDF75"], "\uE338", "\uDBBA\uDD84", ["tea"], 8, 10
    ],
    "1f376": [
        ["\uD83C\uDF76"], "\uE30B", "\uDBBA\uDD85", ["sake"], 8, 11
    ],
    "1f377": [
        ["\uD83C\uDF77"], "\uE044", "\uDBBA\uDD86", ["wine_glass"], 8, 12
    ],
    "1f378": [
        ["\uD83C\uDF78"], "\uE044", "\uDBBA\uDD82", ["cocktail"], 8, 13
    ],
    "1f379": [
        ["\uD83C\uDF79"], "\uE044", "\uDBBA\uDD88", ["tropical_drink"], 8, 14
    ],
    "1f37a": [
        ["\uD83C\uDF7A"], "\uE047", "\uDBBA\uDD83", ["beer"], 8, 15
    ],
    "1f37b": [
        ["\uD83C\uDF7B"], "\uE30C", "\uDBBA\uDD87", ["beers"], 8, 16
    ],
    "1f37c": [
        ["\uD83C\uDF7C"], "", "", ["baby_bottle"], 8, 17
    ],
    "1f380": [
        ["\uD83C\uDF80"], "\uE314", "\uDBB9\uDD0F", ["ribbon"], 8, 18
    ],
    "1f381": [
        ["\uD83C\uDF81"], "\uE112", "\uDBB9\uDD10", ["gift"], 8, 19
    ],
    "1f382": [
        ["\uD83C\uDF82"], "\uE34B", "\uDBB9\uDD11", ["birthday"], 8, 20
    ],
    "1f383": [
        ["\uD83C\uDF83"], "\uE445", "\uDBB9\uDD1F", ["jack_o_lantern"], 8, 21
    ],
    "1f384": [
        ["\uD83C\uDF84"], "\uE033", "\uDBB9\uDD12", ["christmas_tree"], 8, 22
    ],
    "1f385": [
        ["\uD83C\uDF85"], "\uE448", "\uDBB9\uDD13", ["santa"], 8, 23
    ],
    "1f386": [
        ["\uD83C\uDF86"], "\uE117", "\uDBB9\uDD15", ["fireworks"], 8, 24
    ],
    "1f387": [
        ["\uD83C\uDF87"], "\uE440", "\uDBB9\uDD1D", ["sparkler"], 8, 25
    ],
    "1f388": [
        ["\uD83C\uDF88"], "\uE310", "\uDBB9\uDD16", ["balloon"], 8, 26
    ],
    "1f389": [
        ["\uD83C\uDF89"], "\uE312", "\uDBB9\uDD17", ["tada"], 8, 27
    ],
    "1f38a": [
        ["\uD83C\uDF8A"], "", "\uDBB9\uDD20", ["confetti_ball"], 8, 28
    ],
    "1f38b": [
        ["\uD83C\uDF8B"], "", "\uDBB9\uDD21", ["tanabata_tree"], 8, 29
    ],
    "1f38c": [
        ["\uD83C\uDF8C"], "\uE143", "\uDBB9\uDD14", ["crossed_flags"], 9, 0
    ],
    "1f38d": [
        ["\uD83C\uDF8D"], "\uE436", "\uDBB9\uDD18", ["bamboo"], 9, 1
    ],
    "1f38e": [
        ["\uD83C\uDF8E"], "\uE438", "\uDBB9\uDD19", ["dolls"], 9, 2
    ],
    "1f38f": [
        ["\uD83C\uDF8F"], "\uE43B", "\uDBB9\uDD1C", ["flags"], 9, 3
    ],
    "1f390": [
        ["\uD83C\uDF90"], "\uE442", "\uDBB9\uDD1E", ["wind_chime"], 9, 4
    ],
    "1f391": [
        ["\uD83C\uDF91"], "\uE446", "\uDBB8\uDC17", ["rice_scene"], 9, 5
    ],
    "1f392": [
        ["\uD83C\uDF92"], "\uE43A", "\uDBB9\uDD1B", ["school_satchel"], 9, 6
    ],
    "1f393": [
        ["\uD83C\uDF93"], "\uE439", "\uDBB9\uDD1A", ["mortar_board"], 9, 7
    ],
    "1f3a0": [
        ["\uD83C\uDFA0"], "", "\uDBB9\uDFFC", ["carousel_horse"], 9, 8
    ],
    "1f3a1": [
        ["\uD83C\uDFA1"], "\uE124", "\uDBB9\uDFFD", ["ferris_wheel"], 9, 9
    ],
    "1f3a2": [
        ["\uD83C\uDFA2"], "\uE433", "\uDBB9\uDFFE", ["roller_coaster"], 9, 10
    ],
    "1f3a3": [
        ["\uD83C\uDFA3"], "\uE019", "\uDBB9\uDFFF", ["fishing_pole_and_fish"], 9, 11
    ],
    "1f3a4": [
        ["\uD83C\uDFA4"], "\uE03C", "\uDBBA\uDC00", ["microphone"], 9, 12
    ],
    "1f3a5": [
        ["\uD83C\uDFA5"], "\uE03D", "\uDBBA\uDC01", ["movie_camera"], 9, 13
    ],
    "1f3a6": [
        ["\uD83C\uDFA6"], "\uE507", "\uDBBA\uDC02", ["cinema"], 9, 14
    ],
    "1f3a7": [
        ["\uD83C\uDFA7"], "\uE30A", "\uDBBA\uDC03", ["headphones"], 9, 15
    ],
    "1f3a8": [
        ["\uD83C\uDFA8"], "\uE502", "\uDBBA\uDC04", ["art"], 9, 16
    ],
    "1f3a9": [
        ["\uD83C\uDFA9"], "\uE503", "\uDBBA\uDC05", ["tophat"], 9, 17
    ],
    "1f3aa": [
        ["\uD83C\uDFAA"], "", "\uDBBA\uDC06", ["circus_tent"], 9, 18
    ],
    "1f3ab": [
        ["\uD83C\uDFAB"], "\uE125", "\uDBBA\uDC07", ["ticket"], 9, 19
    ],
    "1f3ac": [
        ["\uD83C\uDFAC"], "\uE324", "\uDBBA\uDC08", ["clapper"], 9, 20
    ],
    "1f3ad": [
        ["\uD83C\uDFAD"], "\uE503", "\uDBBA\uDC09", ["performing_arts"], 9, 21
    ],
    "1f3ae": [
        ["\uD83C\uDFAE"], "", "\uDBBA\uDC0A", ["video_game"], 9, 22
    ],
    "1f3af": [
        ["\uD83C\uDFAF"], "\uE130", "\uDBBA\uDC0C", ["dart"], 9, 23
    ],
    "1f3b0": [
        ["\uD83C\uDFB0"], "\uE133", "\uDBBA\uDC0D", ["slot_machine"], 9, 24
    ],
    "1f3b1": [
        ["\uD83C\uDFB1"], "\uE42C", "\uDBBA\uDC0E", ["8ball"], 9, 25
    ],
    "1f3b2": [
        ["\uD83C\uDFB2"], "", "\uDBBA\uDC0F", ["game_die"], 9, 26
    ],
    "1f3b3": [
        ["\uD83C\uDFB3"], "", "\uDBBA\uDC10", ["bowling"], 9, 27
    ],
    "1f3b4": [
        ["\uD83C\uDFB4"], "", "\uDBBA\uDC11", ["flower_playing_cards"], 9, 28
    ],
    "1f3b5": [
        ["\uD83C\uDFB5"], "\uE03E", "\uDBBA\uDC13", ["musical_note"], 9, 29
    ],
    "1f3b6": [
        ["\uD83C\uDFB6"], "\uE326", "\uDBBA\uDC14", ["notes"], 10, 0
    ],
    "1f3b7": [
        ["\uD83C\uDFB7"], "\uE040", "\uDBBA\uDC15", ["saxophone"], 10, 1
    ],
    "1f3b8": [
        ["\uD83C\uDFB8"], "\uE041", "\uDBBA\uDC16", ["guitar"], 10, 2
    ],
    "1f3b9": [
        ["\uD83C\uDFB9"], "", "\uDBBA\uDC17", ["musical_keyboard"], 10, 3
    ],
    "1f3ba": [
        ["\uD83C\uDFBA"], "\uE042", "\uDBBA\uDC18", ["trumpet"], 10, 4
    ],
    "1f3bb": [
        ["\uD83C\uDFBB"], "", "\uDBBA\uDC19", ["violin"], 10, 5
    ],
    "1f3bc": [
        ["\uD83C\uDFBC"], "\uE326", "\uDBBA\uDC1A", ["musical_score"], 10, 6
    ],
    "1f3bd": [
        ["\uD83C\uDFBD"], "", "\uDBB9\uDFD0", ["running_shirt_with_sash"], 10, 7
    ],
    "1f3be": [
        ["\uD83C\uDFBE"], "\uE015", "\uDBB9\uDFD3", ["tennis"], 10, 8
    ],
    "1f3bf": [
        ["\uD83C\uDFBF"], "\uE013", "\uDBB9\uDFD5", ["ski"], 10, 9
    ],
    "1f3c0": [
        ["\uD83C\uDFC0"], "\uE42A", "\uDBB9\uDFD6", ["basketball"], 10, 10
    ],
    "1f3c1": [
        ["\uD83C\uDFC1"], "\uE132", "\uDBB9\uDFD7", ["checkered_flag"], 10, 11
    ],
    "1f3c2": [
        ["\uD83C\uDFC2"], "", "\uDBB9\uDFD8", ["snowboarder"], 10, 12
    ],
    "1f3c3": [
        ["\uD83C\uDFC3"], "\uE115", "\uDBB9\uDFD9", ["runner", "running"], 10, 13
    ],
    "1f3c4": [
        ["\uD83C\uDFC4"], "\uE017", "\uDBB9\uDFDA", ["surfer"], 10, 14
    ],
    "1f3c6": [
        ["\uD83C\uDFC6"], "\uE131", "\uDBB9\uDFDB", ["trophy"], 10, 15
    ],
    "1f3c7": [
        ["\uD83C\uDFC7"], "", "", ["horse_racing"], 10, 16
    ],
    "1f3c8": [
        ["\uD83C\uDFC8"], "\uE42B", "\uDBB9\uDFDD", ["football"], 10, 17
    ],
    "1f3c9": [
        ["\uD83C\uDFC9"], "", "", ["rugby_football"], 10, 18
    ],
    "1f3ca": [
        ["\uD83C\uDFCA"], "\uE42D", "\uDBB9\uDFDE", ["swimmer"], 10, 19
    ],
    "1f3e0": [
        ["\uD83C\uDFE0"], "\uE036", "\uDBB9\uDCB0", ["house"], 10, 20
    ],
    "1f3e1": [
        ["\uD83C\uDFE1"], "\uE036", "\uDBB9\uDCB1", ["house_with_garden"], 10, 21
    ],
    "1f3e2": [
        ["\uD83C\uDFE2"], "\uE038", "\uDBB9\uDCB2", ["office"], 10, 22
    ],
    "1f3e3": [
        ["\uD83C\uDFE3"], "\uE153", "\uDBB9\uDCB3", ["post_office"], 10, 23
    ],
    "1f3e4": [
        ["\uD83C\uDFE4"], "", "", ["european_post_office"], 10, 24
    ],
    "1f3e5": [
        ["\uD83C\uDFE5"], "\uE155", "\uDBB9\uDCB4", ["hospital"], 10, 25
    ],
    "1f3e6": [
        ["\uD83C\uDFE6"], "\uE14D", "\uDBB9\uDCB5", ["bank"], 10, 26
    ],
    "1f3e7": [
        ["\uD83C\uDFE7"], "\uE154", "\uDBB9\uDCB6", ["atm"], 10, 27
    ],
    "1f3e8": [
        ["\uD83C\uDFE8"], "\uE158", "\uDBB9\uDCB7", ["hotel"], 10, 28
    ],
    "1f3e9": [
        ["\uD83C\uDFE9"], "\uE501", "\uDBB9\uDCB8", ["love_hotel"], 10, 29
    ],
    "1f3ea": [
        ["\uD83C\uDFEA"], "\uE156", "\uDBB9\uDCB9", ["convenience_store"], 11, 0
    ],
    "1f3eb": [
        ["\uD83C\uDFEB"], "\uE157", "\uDBB9\uDCBA", ["school"], 11, 1
    ],
    "1f3ec": [
        ["\uD83C\uDFEC"], "\uE504", "\uDBB9\uDCBD", ["department_store"], 11, 2
    ],
    "1f3ed": [
        ["\uD83C\uDFED"], "\uE508", "\uDBB9\uDCC0", ["factory"], 11, 3
    ],
    "1f3ee": [
        ["\uD83C\uDFEE"], "\uE30B", "\uDBB9\uDCC2", ["izakaya_lantern", "lantern"], 11, 4
    ],
    "1f3ef": [
        ["\uD83C\uDFEF"], "\uE505", "\uDBB9\uDCBE", ["japanese_castle"], 11, 5
    ],
    "1f3f0": [
        ["\uD83C\uDFF0"], "\uE506", "\uDBB9\uDCBF", ["european_castle"], 11, 6
    ],
    "1f400": [
        ["\uD83D\uDC00"], "", "", ["rat"], 11, 7
    ],
    "1f401": [
        ["\uD83D\uDC01"], "", "", ["mouse2"], 11, 8
    ],
    "1f402": [
        ["\uD83D\uDC02"], "", "", ["ox"], 11, 9
    ],
    "1f403": [
        ["\uD83D\uDC03"], "", "", ["water_buffalo"], 11, 10
    ],
    "1f404": [
        ["\uD83D\uDC04"], "", "", ["cow2"], 11, 11
    ],
    "1f405": [
        ["\uD83D\uDC05"], "", "", ["tiger2"], 11, 12
    ],
    "1f406": [
        ["\uD83D\uDC06"], "", "", ["leopard"], 11, 13
    ],
    "1f407": [
        ["\uD83D\uDC07"], "", "", ["rabbit2"], 11, 14
    ],
    "1f408": [
        ["\uD83D\uDC08"], "", "", ["cat2"], 11, 15
    ],
    "1f409": [
        ["\uD83D\uDC09"], "", "", ["dragon"], 11, 16
    ],
    "1f40a": [
        ["\uD83D\uDC0A"], "", "", ["crocodile"], 11, 17
    ],
    "1f40b": [
        ["\uD83D\uDC0B"], "", "", ["whale2"], 11, 18
    ],
    "1f40c": [
        ["\uD83D\uDC0C"], "", "\uDBB8\uDDB9", ["snail"], 11, 19
    ],
    "1f40d": [
        ["\uD83D\uDC0D"], "\uE52D", "\uDBB8\uDDD3", ["snake"], 11, 20
    ],
    "1f40e": [
        ["\uD83D\uDC0E"], "\uE134", "\uDBB9\uDFDC", ["racehorse"], 11, 21
    ],
    "1f40f": [
        ["\uD83D\uDC0F"], "", "", ["ram"], 11, 22
    ],
    "1f410": [
        ["\uD83D\uDC10"], "", "", ["goat"], 11, 23
    ],
    "1f411": [
        ["\uD83D\uDC11"], "\uE529", "\uDBB8\uDDCF", ["sheep"], 11, 24
    ],
    "1f412": [
        ["\uD83D\uDC12"], "\uE528", "\uDBB8\uDDCE", ["monkey"], 11, 25
    ],
    "1f413": [
        ["\uD83D\uDC13"], "", "", ["rooster"], 11, 26
    ],
    "1f414": [
        ["\uD83D\uDC14"], "\uE52E", "\uDBB8\uDDD4", ["chicken"], 11, 27
    ],
    "1f415": [
        ["\uD83D\uDC15"], "", "", ["dog2"], 11, 28
    ],
    "1f416": [
        ["\uD83D\uDC16"], "", "", ["pig2"], 11, 29
    ],
    "1f417": [
        ["\uD83D\uDC17"], "\uE52F", "\uDBB8\uDDD5", ["boar"], 12, 0
    ],
    "1f418": [
        ["\uD83D\uDC18"], "\uE526", "\uDBB8\uDDCC", ["elephant"], 12, 1
    ],
    "1f419": [
        ["\uD83D\uDC19"], "\uE10A", "\uDBB8\uDDC5", ["octopus"], 12, 2
    ],
    "1f41a": [
        ["\uD83D\uDC1A"], "\uE441", "\uDBB8\uDDC6", ["shell"], 12, 3
    ],
    "1f41b": [
        ["\uD83D\uDC1B"], "\uE525", "\uDBB8\uDDCB", ["bug"], 12, 4
    ],
    "1f41c": [
        ["\uD83D\uDC1C"], "", "\uDBB8\uDDDA", ["ant"], 12, 5
    ],
    "1f41d": [
        ["\uD83D\uDC1D"], "", "\uDBB8\uDDE1", ["bee", "honeybee"], 12, 6
    ],
    "1f41e": [
        ["\uD83D\uDC1E"], "", "\uDBB8\uDDE2", ["beetle"], 12, 7
    ],
    "1f41f": [
        ["\uD83D\uDC1F"], "\uE019", "\uDBB8\uDDBD", ["fish"], 12, 8
    ],
    "1f420": [
        ["\uD83D\uDC20"], "\uE522", "\uDBB8\uDDC9", ["tropical_fish"], 12, 9
    ],
    "1f421": [
        ["\uD83D\uDC21"], "\uE019", "\uDBB8\uDDD9", ["blowfish"], 12, 10
    ],
    "1f422": [
        ["\uD83D\uDC22"], "", "\uDBB8\uDDDC", ["turtle"], 12, 11
    ],
    "1f423": [
        ["\uD83D\uDC23"], "\uE523", "\uDBB8\uDDDD", ["hatching_chick"], 12, 12
    ],
    "1f424": [
        ["\uD83D\uDC24"], "\uE523", "\uDBB8\uDDBA", ["baby_chick"], 12, 13
    ],
    "1f425": [
        ["\uD83D\uDC25"], "\uE523", "\uDBB8\uDDBB", ["hatched_chick"], 12, 14
    ],
    "1f426": [
        ["\uD83D\uDC26"], "\uE521", "\uDBB8\uDDC8", ["bird"], 12, 15
    ],
    "1f427": [
        ["\uD83D\uDC27"], "\uE055", "\uDBB8\uDDBC", ["penguin"], 12, 16
    ],
    "1f428": [
        ["\uD83D\uDC28"], "\uE527", "\uDBB8\uDDCD", ["koala"], 12, 17
    ],
    "1f429": [
        ["\uD83D\uDC29"], "\uE052", "\uDBB8\uDDD8", ["poodle"], 12, 18
    ],
    "1f42a": [
        ["\uD83D\uDC2A"], "", "", ["dromedary_camel"], 12, 19
    ],
    "1f42b": [
        ["\uD83D\uDC2B"], "\uE530", "\uDBB8\uDDD6", ["camel"], 12, 20
    ],
    "1f42c": [
        ["\uD83D\uDC2C"], "\uE520", "\uDBB8\uDDC7", ["dolphin", "flipper"], 12, 21
    ],
    "1f42d": [
        ["\uD83D\uDC2D"], "\uE053", "\uDBB8\uDDC2", ["mouse"], 12, 22
    ],
    "1f42e": [
        ["\uD83D\uDC2E"], "\uE52B", "\uDBB8\uDDD1", ["cow"], 12, 23
    ],
    "1f42f": [
        ["\uD83D\uDC2F"], "\uE050", "\uDBB8\uDDC0", ["tiger"], 12, 24
    ],
    "1f430": [
        ["\uD83D\uDC30"], "\uE52C", "\uDBB8\uDDD2", ["rabbit"], 12, 25
    ],
    "1f431": [
        ["\uD83D\uDC31"], "\uE04F", "\uDBB8\uDDB8", ["cat"], 12, 26
    ],
    "1f432": [
        ["\uD83D\uDC32"], "", "\uDBB8\uDDDE", ["dragon_face"], 12, 27
    ],
    "1f433": [
        ["\uD83D\uDC33"], "\uE054", "\uDBB8\uDDC3", ["whale"], 12, 28
    ],
    "1f434": [
        ["\uD83D\uDC34"], "\uE01A", "\uDBB8\uDDBE", ["horse"], 12, 29
    ],
    "1f435": [
        ["\uD83D\uDC35"], "\uE109", "\uDBB8\uDDC4", ["monkey_face"], 13, 0
    ],
    "1f436": [
        ["\uD83D\uDC36"], "\uE052", "\uDBB8\uDDB7", ["dog"], 13, 1
    ],
    "1f437": [
        ["\uD83D\uDC37"], "\uE10B", "\uDBB8\uDDBF", ["pig"], 13, 2
    ],
    "1f438": [
        ["\uD83D\uDC38"], "\uE531", "\uDBB8\uDDD7", ["frog"], 13, 3
    ],
    "1f439": [
        ["\uD83D\uDC39"], "\uE524", "\uDBB8\uDDCA", ["hamster"], 13, 4
    ],
    "1f43a": [
        ["\uD83D\uDC3A"], "\uE52A", "\uDBB8\uDDD0", ["wolf"], 13, 5
    ],
    "1f43b": [
        ["\uD83D\uDC3B"], "\uE051", "\uDBB8\uDDC1", ["bear"], 13, 6
    ],
    "1f43c": [
        ["\uD83D\uDC3C"], "", "\uDBB8\uDDDF", ["panda_face"], 13, 7
    ],
    "1f43d": [
        ["\uD83D\uDC3D"], "\uE10B", "\uDBB8\uDDE0", ["pig_nose"], 13, 8
    ],
    "1f43e": [
        ["\uD83D\uDC3E"], "\uE536", "\uDBB8\uDDDB", ["feet", "paw_prints"], 13, 9
    ],
    "1f440": [
        ["\uD83D\uDC40"], "\uE419", "\uDBB8\uDD90", ["eyes"], 13, 10
    ],
    "1f442": [
        ["\uD83D\uDC42"], "\uE41B", "\uDBB8\uDD91", ["ear"], 13, 11
    ],
    "1f443": [
        ["\uD83D\uDC43"], "\uE41A", "\uDBB8\uDD92", ["nose"], 13, 12
    ],
    "1f444": [
        ["\uD83D\uDC44"], "\uE41C", "\uDBB8\uDD93", ["lips"], 13, 13
    ],
    "1f445": [
        ["\uD83D\uDC45"], "\uE409", "\uDBB8\uDD94", ["tongue"], 13, 14
    ],
    "1f446": [
        ["\uD83D\uDC46"], "\uE22E", "\uDBBA\uDF99", ["point_up_2"], 13, 15
    ],
    "1f447": [
        ["\uD83D\uDC47"], "\uE22F", "\uDBBA\uDF9A", ["point_down"], 13, 16
    ],
    "1f448": [
        ["\uD83D\uDC48"], "\uE230", "\uDBBA\uDF9B", ["point_left"], 13, 17
    ],
    "1f449": [
        ["\uD83D\uDC49"], "\uE231", "\uDBBA\uDF9C", ["point_right"], 13, 18
    ],
    "1f44a": [
        ["\uD83D\uDC4A"], "\uE00D", "\uDBBA\uDF96", ["facepunch", "punch"], 13, 19
    ],
    "1f44b": [
        ["\uD83D\uDC4B"], "\uE41E", "\uDBBA\uDF9D", ["wave"], 13, 20
    ],
    "1f44c": [
        ["\uD83D\uDC4C"], "\uE420", "\uDBBA\uDF9F", ["ok_hand"], 13, 21
    ],
    "1f44d": [
        ["\uD83D\uDC4D"], "\uE00E", "\uDBBA\uDF97", ["+1", "thumbsup"], 13, 22
    ],
    "1f44e": [
        ["\uD83D\uDC4E"], "\uE421", "\uDBBA\uDFA0", ["-1", "thumbsdown"], 13, 23
    ],
    "1f44f": [
        ["\uD83D\uDC4F"], "\uE41F", "\uDBBA\uDF9E", ["clap"], 13, 24
    ],
    "1f450": [
        ["\uD83D\uDC50"], "\uE422", "\uDBBA\uDFA1", ["open_hands"], 13, 25
    ],
    "1f451": [
        ["\uD83D\uDC51"], "\uE10E", "\uDBB9\uDCD1", ["crown"], 13, 26
    ],
    "1f452": [
        ["\uD83D\uDC52"], "\uE318", "\uDBB9\uDCD4", ["womans_hat"], 13, 27
    ],
    "1f453": [
        ["\uD83D\uDC53"], "", "\uDBB9\uDCCE", ["eyeglasses"], 13, 28
    ],
    "1f454": [
        ["\uD83D\uDC54"], "\uE302", "\uDBB9\uDCD3", ["necktie"], 13, 29
    ],
    "1f455": [
        ["\uD83D\uDC55"], "\uE006", "\uDBB9\uDCCF", ["shirt", "tshirt"], 14, 0
    ],
    "1f456": [
        ["\uD83D\uDC56"], "", "\uDBB9\uDCD0", ["jeans"], 14, 1
    ],
    "1f457": [
        ["\uD83D\uDC57"], "\uE319", "\uDBB9\uDCD5", ["dress"], 14, 2
    ],
    "1f458": [
        ["\uD83D\uDC58"], "\uE321", "\uDBB9\uDCD9", ["kimono"], 14, 3
    ],
    "1f459": [
        ["\uD83D\uDC59"], "\uE322", "\uDBB9\uDCDA", ["bikini"], 14, 4
    ],
    "1f45a": [
        ["\uD83D\uDC5A"], "\uE006", "\uDBB9\uDCDB", ["womans_clothes"], 14, 5
    ],
    "1f45b": [
        ["\uD83D\uDC5B"], "", "\uDBB9\uDCDC", ["purse"], 14, 6
    ],
    "1f45c": [
        ["\uD83D\uDC5C"], "\uE323", "\uDBB9\uDCF0", ["handbag"], 14, 7
    ],
    "1f45d": [
        ["\uD83D\uDC5D"], "", "\uDBB9\uDCF1", ["pouch"], 14, 8
    ],
    "1f45e": [
        ["\uD83D\uDC5E"], "\uE007", "\uDBB9\uDCCC", ["mans_shoe", "shoe"], 14, 9
    ],
    "1f45f": [
        ["\uD83D\uDC5F"], "\uE007", "\uDBB9\uDCCD", ["athletic_shoe"], 14, 10
    ],
    "1f460": [
        ["\uD83D\uDC60"], "\uE13E", "\uDBB9\uDCD6", ["high_heel"], 14, 11
    ],
    "1f461": [
        ["\uD83D\uDC61"], "\uE31A", "\uDBB9\uDCD7", ["sandal"], 14, 12
    ],
    "1f462": [
        ["\uD83D\uDC62"], "\uE31B", "\uDBB9\uDCD8", ["boot"], 14, 13
    ],
    "1f463": [
        ["\uD83D\uDC63"], "\uE536", "\uDBB9\uDD53", ["footprints"], 14, 14
    ],
    "1f464": [
        ["\uD83D\uDC64"], "", "\uDBB8\uDD9A", ["bust_in_silhouette"], 14, 15
    ],
    "1f465": [
        ["\uD83D\uDC65"], "", "", ["busts_in_silhouette"], 14, 16
    ],
    "1f466": [
        ["\uD83D\uDC66"], "\uE001", "\uDBB8\uDD9B", ["boy"], 14, 17
    ],
    "1f467": [
        ["\uD83D\uDC67"], "\uE002", "\uDBB8\uDD9C", ["girl"], 14, 18
    ],
    "1f468": [
        ["\uD83D\uDC68"], "\uE004", "\uDBB8\uDD9D", ["man"], 14, 19
    ],
    "1f469": [
        ["\uD83D\uDC69"], "\uE005", "\uDBB8\uDD9E", ["woman"], 14, 20
    ],
    "1f46a": [
        ["\uD83D\uDC6A"], "", "\uDBB8\uDD9F", ["family"], 14, 21
    ],
    "1f46b": [
        ["\uD83D\uDC6B"], "\uE428", "\uDBB8\uDDA0", ["couple"], 14, 22
    ],
    "1f46c": [
        ["\uD83D\uDC6C"], "", "", ["two_men_holding_hands"], 14, 23
    ],
    "1f46d": [
        ["\uD83D\uDC6D"], "", "", ["two_women_holding_hands"], 14, 24
    ],
    "1f46e": [
        ["\uD83D\uDC6E"], "\uE152", "\uDBB8\uDDA1", ["cop"], 14, 25
    ],
    "1f46f": [
        ["\uD83D\uDC6F"], "\uE429", "\uDBB8\uDDA2", ["dancers"], 14, 26
    ],
    "1f470": [
        ["\uD83D\uDC70"], "", "\uDBB8\uDDA3", ["bride_with_veil"], 14, 27
    ],
    "1f471": [
        ["\uD83D\uDC71"], "\uE515", "\uDBB8\uDDA4", ["person_with_blond_hair"], 14, 28
    ],
    "1f472": [
        ["\uD83D\uDC72"], "\uE516", "\uDBB8\uDDA5", ["man_with_gua_pi_mao"], 14, 29
    ],
    "1f473": [
        ["\uD83D\uDC73"], "\uE517", "\uDBB8\uDDA6", ["man_with_turban"], 15, 0
    ],
    "1f474": [
        ["\uD83D\uDC74"], "\uE518", "\uDBB8\uDDA7", ["older_man"], 15, 1
    ],
    "1f475": [
        ["\uD83D\uDC75"], "\uE519", "\uDBB8\uDDA8", ["older_woman"], 15, 2
    ],
    "1f476": [
        ["\uD83D\uDC76"], "\uE51A", "\uDBB8\uDDA9", ["baby"], 15, 3
    ],
    "1f477": [
        ["\uD83D\uDC77"], "\uE51B", "\uDBB8\uDDAA", ["construction_worker"], 15, 4
    ],
    "1f478": [
        ["\uD83D\uDC78"], "\uE51C", "\uDBB8\uDDAB", ["princess"], 15, 5
    ],
    "1f479": [
        ["\uD83D\uDC79"], "", "\uDBB8\uDDAC", ["japanese_ogre"], 15, 6
    ],
    "1f47a": [
        ["\uD83D\uDC7A"], "", "\uDBB8\uDDAD", ["japanese_goblin"], 15, 7
    ],
    "1f47b": [
        ["\uD83D\uDC7B"], "\uE11B", "\uDBB8\uDDAE", ["ghost"], 15, 8
    ],
    "1f47c": [
        ["\uD83D\uDC7C"], "\uE04E", "\uDBB8\uDDAF", ["angel"], 15, 9
    ],
    "1f47d": [
        ["\uD83D\uDC7D"], "\uE10C", "\uDBB8\uDDB0", ["alien"], 15, 10
    ],
    "1f47e": [
        ["\uD83D\uDC7E"], "\uE12B", "\uDBB8\uDDB1", ["space_invader"], 15, 11
    ],
    "1f47f": [
        ["\uD83D\uDC7F"], "\uE11A", "\uDBB8\uDDB2", ["imp"], 15, 12
    ],
    "1f480": [
        ["\uD83D\uDC80"], "\uE11C", "\uDBB8\uDDB3", ["skull"], 15, 13
    ],
    "1f481": [
        ["\uD83D\uDC81"], "\uE253", "\uDBB8\uDDB4", ["information_desk_person"], 15, 14
    ],
    "1f482": [
        ["\uD83D\uDC82"], "\uE51E", "\uDBB8\uDDB5", ["guardsman"], 15, 15
    ],
    "1f483": [
        ["\uD83D\uDC83"], "\uE51F", "\uDBB8\uDDB6", ["dancer"], 15, 16
    ],
    "1f484": [
        ["\uD83D\uDC84"], "\uE31C", "\uDBB8\uDD95", ["lipstick"], 15, 17
    ],
    "1f485": [
        ["\uD83D\uDC85"], "\uE31D", "\uDBB8\uDD96", ["nail_care"], 15, 18
    ],
    "1f486": [
        ["\uD83D\uDC86"], "\uE31E", "\uDBB8\uDD97", ["massage"], 15, 19
    ],
    "1f487": [
        ["\uD83D\uDC87"], "\uE31F", "\uDBB8\uDD98", ["haircut"], 15, 20
    ],
    "1f488": [
        ["\uD83D\uDC88"], "\uE320", "\uDBB8\uDD99", ["barber"], 15, 21
    ],
    "1f489": [
        ["\uD83D\uDC89"], "\uE13B", "\uDBB9\uDD09", ["syringe"], 15, 22
    ],
    "1f48a": [
        ["\uD83D\uDC8A"], "\uE30F", "\uDBB9\uDD0A", ["pill"], 15, 23
    ],
    "1f48b": [
        ["\uD83D\uDC8B"], "\uE003", "\uDBBA\uDC23", ["kiss"], 15, 24
    ],
    "1f48c": [
        ["\uD83D\uDC8C"], "\uE103\uE328", "\uDBBA\uDC24", ["love_letter"], 15, 25
    ],
    "1f48d": [
        ["\uD83D\uDC8D"], "\uE034", "\uDBBA\uDC25", ["ring"], 15, 26
    ],
    "1f48e": [
        ["\uD83D\uDC8E"], "\uE035", "\uDBBA\uDC26", ["gem"], 15, 27
    ],
    "1f48f": [
        ["\uD83D\uDC8F"], "\uE111", "\uDBBA\uDC27", ["couplekiss"], 15, 28
    ],
    "1f490": [
        ["\uD83D\uDC90"], "\uE306", "\uDBBA\uDC28", ["bouquet"], 15, 29
    ],
    "1f491": [
        ["\uD83D\uDC91"], "\uE425", "\uDBBA\uDC29", ["couple_with_heart"], 16, 0
    ],
    "1f492": [
        ["\uD83D\uDC92"], "\uE43D", "\uDBBA\uDC2A", ["wedding"], 16, 1
    ],
    "1f493": [
        ["\uD83D\uDC93"], "\uE327", "\uDBBA\uDF0D", ["heartbeat"], 16, 2
    ],
    "1f494": [
        ["\uD83D\uDC94"], "\uE023", "\uDBBA\uDF0E", ["broken_heart"], 16, 3, "<\/3"
    ],
    "1f495": [
        ["\uD83D\uDC95"], "\uE327", "\uDBBA\uDF0F", ["two_hearts"], 16, 4
    ],
    "1f496": [
        ["\uD83D\uDC96"], "\uE327", "\uDBBA\uDF10", ["sparkling_heart"], 16, 5
    ],
    "1f497": [
        ["\uD83D\uDC97"], "\uE328", "\uDBBA\uDF11", ["heartpulse"], 16, 6
    ],
    "1f498": [
        ["\uD83D\uDC98"], "\uE329", "\uDBBA\uDF12", ["cupid"], 16, 7
    ],
    "1f499": [
        ["\uD83D\uDC99"], "\uE32A", "\uDBBA\uDF13", ["blue_heart"], 16, 8, "<3"
    ],
    "1f49a": [
        ["\uD83D\uDC9A"], "\uE32B", "\uDBBA\uDF14", ["green_heart"], 16, 9, "<3"
    ],
    "1f49b": [
        ["\uD83D\uDC9B"], "\uE32C", "\uDBBA\uDF15", ["yellow_heart"], 16, 10, "<3"
    ],
    "1f49c": [
        ["\uD83D\uDC9C"], "\uE32D", "\uDBBA\uDF16", ["purple_heart"], 16, 11, "<3"
    ],
    "1f49d": [
        ["\uD83D\uDC9D"], "\uE437", "\uDBBA\uDF17", ["gift_heart"], 16, 12
    ],
    "1f49e": [
        ["\uD83D\uDC9E"], "\uE327", "\uDBBA\uDF18", ["revolving_hearts"], 16, 13
    ],
    "1f49f": [
        ["\uD83D\uDC9F"], "\uE204", "\uDBBA\uDF19", ["heart_decoration"], 16, 14
    ],
    "1f4a0": [
        ["\uD83D\uDCA0"], "", "\uDBBA\uDF55", ["diamond_shape_with_a_dot_inside"], 16, 15
    ],
    "1f4a1": [
        ["\uD83D\uDCA1"], "\uE10F", "\uDBBA\uDF56", ["bulb"], 16, 16
    ],
    "1f4a2": [
        ["\uD83D\uDCA2"], "\uE334", "\uDBBA\uDF57", ["anger"], 16, 17
    ],
    "1f4a3": [
        ["\uD83D\uDCA3"], "\uE311", "\uDBBA\uDF58", ["bomb"], 16, 18
    ],
    "1f4a4": [
        ["\uD83D\uDCA4"], "\uE13C", "\uDBBA\uDF59", ["zzz"], 16, 19
    ],
    "1f4a5": [
        ["\uD83D\uDCA5"], "", "\uDBBA\uDF5A", ["boom", "collision"], 16, 20
    ],
    "1f4a6": [
        ["\uD83D\uDCA6"], "\uE331", "\uDBBA\uDF5B", ["sweat_drops"], 16, 21
    ],
    "1f4a7": [
        ["\uD83D\uDCA7"], "\uE331", "\uDBBA\uDF5C", ["droplet"], 16, 22
    ],
    "1f4a8": [
        ["\uD83D\uDCA8"], "\uE330", "\uDBBA\uDF5D", ["dash"], 16, 23
    ],
    "1f4a9": [
        ["\uD83D\uDCA9"], "\uE05A", "\uDBB9\uDCF4", ["hankey", "poop", "shit"], 16, 24
    ],
    "1f4aa": [
        ["\uD83D\uDCAA"], "\uE14C", "\uDBBA\uDF5E", ["muscle"], 16, 25
    ],
    "1f4ab": [
        ["\uD83D\uDCAB"], "\uE407", "\uDBBA\uDF5F", ["dizzy"], 16, 26
    ],
    "1f4ac": [
        ["\uD83D\uDCAC"], "", "\uDBB9\uDD32", ["speech_balloon"], 16, 27
    ],
    "1f4ad": [
        ["\uD83D\uDCAD"], "", "", ["thought_balloon"], 16, 28
    ],
    "1f4ae": [
        ["\uD83D\uDCAE"], "", "\uDBBA\uDF7A", ["white_flower"], 16, 29
    ],
    "1f4af": [
        ["\uD83D\uDCAF"], "", "\uDBBA\uDF7B", ["100"], 17, 0
    ],
    "1f4b0": [
        ["\uD83D\uDCB0"], "\uE12F", "\uDBB9\uDCDD", ["moneybag"], 17, 1
    ],
    "1f4b1": [
        ["\uD83D\uDCB1"], "\uE149", "\uDBB9\uDCDE", ["currency_exchange"], 17, 2
    ],
    "1f4b2": [
        ["\uD83D\uDCB2"], "\uE12F", "\uDBB9\uDCE0", ["heavy_dollar_sign"], 17, 3
    ],
    "1f4b3": [
        ["\uD83D\uDCB3"], "", "\uDBB9\uDCE1", ["credit_card"], 17, 4
    ],
    "1f4b4": [
        ["\uD83D\uDCB4"], "", "\uDBB9\uDCE2", ["yen"], 17, 5
    ],
    "1f4b5": [
        ["\uD83D\uDCB5"], "\uE12F", "\uDBB9\uDCE3", ["dollar"], 17, 6
    ],
    "1f4b6": [
        ["\uD83D\uDCB6"], "", "", ["euro"], 17, 7
    ],
    "1f4b7": [
        ["\uD83D\uDCB7"], "", "", ["pound"], 17, 8
    ],
    "1f4b8": [
        ["\uD83D\uDCB8"], "", "\uDBB9\uDCE4", ["money_with_wings"], 17, 9
    ],
    "1f4b9": [
        ["\uD83D\uDCB9"], "\uE14A", "\uDBB9\uDCDF", ["chart"], 17, 10
    ],
    "1f4ba": [
        ["\uD83D\uDCBA"], "\uE11F", "\uDBB9\uDD37", ["seat"], 17, 11
    ],
    "1f4bb": [
        ["\uD83D\uDCBB"], "\uE00C", "\uDBB9\uDD38", ["computer"], 17, 12
    ],
    "1f4bc": [
        ["\uD83D\uDCBC"], "\uE11E", "\uDBB9\uDD3B", ["briefcase"], 17, 13
    ],
    "1f4bd": [
        ["\uD83D\uDCBD"], "\uE316", "\uDBB9\uDD3C", ["minidisc"], 17, 14
    ],
    "1f4be": [
        ["\uD83D\uDCBE"], "\uE316", "\uDBB9\uDD3D", ["floppy_disk"], 17, 15
    ],
    "1f4bf": [
        ["\uD83D\uDCBF"], "\uE126", "\uDBBA\uDC1D", ["cd"], 17, 16
    ],
    "1f4c0": [
        ["\uD83D\uDCC0"], "\uE127", "\uDBBA\uDC1E", ["dvd"], 17, 17
    ],
    "1f4c1": [
        ["\uD83D\uDCC1"], "", "\uDBB9\uDD43", ["file_folder"], 17, 18
    ],
    "1f4c2": [
        ["\uD83D\uDCC2"], "", "\uDBB9\uDD44", ["open_file_folder"], 17, 19
    ],
    "1f4c3": [
        ["\uD83D\uDCC3"], "\uE301", "\uDBB9\uDD40", ["page_with_curl"], 17, 20
    ],
    "1f4c4": [
        ["\uD83D\uDCC4"], "\uE301", "\uDBB9\uDD41", ["page_facing_up"], 17, 21
    ],
    "1f4c5": [
        ["\uD83D\uDCC5"], "", "\uDBB9\uDD42", ["date"], 17, 22
    ],
    "1f4c6": [
        ["\uD83D\uDCC6"], "", "\uDBB9\uDD49", ["calendar"], 17, 23
    ],
    "1f4c7": [
        ["\uD83D\uDCC7"], "\uE148", "\uDBB9\uDD4D", ["card_index"], 17, 24
    ],
    "1f4c8": [
        ["\uD83D\uDCC8"], "\uE14A", "\uDBB9\uDD4B", ["chart_with_upwards_trend"], 17, 25
    ],
    "1f4c9": [
        ["\uD83D\uDCC9"], "", "\uDBB9\uDD4C", ["chart_with_downwards_trend"], 17, 26
    ],
    "1f4ca": [
        ["\uD83D\uDCCA"], "\uE14A", "\uDBB9\uDD4A", ["bar_chart"], 17, 27
    ],
    "1f4cb": [
        ["\uD83D\uDCCB"], "\uE301", "\uDBB9\uDD48", ["clipboard"], 17, 28
    ],
    "1f4cc": [
        ["\uD83D\uDCCC"], "", "\uDBB9\uDD4E", ["pushpin"], 17, 29
    ],
    "1f4cd": [
        ["\uD83D\uDCCD"], "", "\uDBB9\uDD3F", ["round_pushpin"], 18, 0
    ],
    "1f4ce": [
        ["\uD83D\uDCCE"], "", "\uDBB9\uDD3A", ["paperclip"], 18, 1
    ],
    "1f4cf": [
        ["\uD83D\uDCCF"], "", "\uDBB9\uDD50", ["straight_ruler"], 18, 2
    ],
    "1f4d0": [
        ["\uD83D\uDCD0"], "", "\uDBB9\uDD51", ["triangular_ruler"], 18, 3
    ],
    "1f4d1": [
        ["\uD83D\uDCD1"], "\uE301", "\uDBB9\uDD52", ["bookmark_tabs"], 18, 4
    ],
    "1f4d2": [
        ["\uD83D\uDCD2"], "\uE148", "\uDBB9\uDD4F", ["ledger"], 18, 5
    ],
    "1f4d3": [
        ["\uD83D\uDCD3"], "\uE148", "\uDBB9\uDD45", ["notebook"], 18, 6
    ],
    "1f4d4": [
        ["\uD83D\uDCD4"], "\uE148", "\uDBB9\uDD47", ["notebook_with_decorative_cover"], 18, 7
    ],
    "1f4d5": [
        ["\uD83D\uDCD5"], "\uE148", "\uDBB9\uDD02", ["closed_book"], 18, 8
    ],
    "1f4d6": [
        ["\uD83D\uDCD6"], "\uE148", "\uDBB9\uDD46", ["book", "open_book"], 18, 9
    ],
    "1f4d7": [
        ["\uD83D\uDCD7"], "\uE148", "\uDBB9\uDCFF", ["green_book"], 18, 10
    ],
    "1f4d8": [
        ["\uD83D\uDCD8"], "\uE148", "\uDBB9\uDD00", ["blue_book"], 18, 11
    ],
    "1f4d9": [
        ["\uD83D\uDCD9"], "\uE148", "\uDBB9\uDD01", ["orange_book"], 18, 12
    ],
    "1f4da": [
        ["\uD83D\uDCDA"], "\uE148", "\uDBB9\uDD03", ["books"], 18, 13
    ],
    "1f4db": [
        ["\uD83D\uDCDB"], "", "\uDBB9\uDD04", ["name_badge"], 18, 14
    ],
    "1f4dc": [
        ["\uD83D\uDCDC"], "", "\uDBB9\uDCFD", ["scroll"], 18, 15
    ],
    "1f4dd": [
        ["\uD83D\uDCDD"], "\uE301", "\uDBB9\uDD27", ["memo", "pencil"], 18, 16
    ],
    "1f4de": [
        ["\uD83D\uDCDE"], "\uE009", "\uDBB9\uDD24", ["telephone_receiver"], 18, 17
    ],
    "1f4df": [
        ["\uD83D\uDCDF"], "", "\uDBB9\uDD22", ["pager"], 18, 18
    ],
    "1f4e0": [
        ["\uD83D\uDCE0"], "\uE00B", "\uDBB9\uDD28", ["fax"], 18, 19
    ],
    "1f4e1": [
        ["\uD83D\uDCE1"], "\uE14B", "\uDBB9\uDD31", ["satellite"], 18, 20
    ],
    "1f4e2": [
        ["\uD83D\uDCE2"], "\uE142", "\uDBB9\uDD2F", ["loudspeaker"], 18, 21
    ],
    "1f4e3": [
        ["\uD83D\uDCE3"], "\uE317", "\uDBB9\uDD30", ["mega"], 18, 22
    ],
    "1f4e4": [
        ["\uD83D\uDCE4"], "", "\uDBB9\uDD33", ["outbox_tray"], 18, 23
    ],
    "1f4e5": [
        ["\uD83D\uDCE5"], "", "\uDBB9\uDD34", ["inbox_tray"], 18, 24
    ],
    "1f4e6": [
        ["\uD83D\uDCE6"], "\uE112", "\uDBB9\uDD35", ["package"], 18, 25
    ],
    "1f4e7": [
        ["\uD83D\uDCE7"], "\uE103", "\uDBBA\uDF92", ["e-mail"], 18, 26
    ],
    "1f4e8": [
        ["\uD83D\uDCE8"], "\uE103", "\uDBB9\uDD2A", ["incoming_envelope"], 18, 27
    ],
    "1f4e9": [
        ["\uD83D\uDCE9"], "\uE103", "\uDBB9\uDD2B", ["envelope_with_arrow"], 18, 28
    ],
    "1f4ea": [
        ["\uD83D\uDCEA"], "\uE101", "\uDBB9\uDD2C", ["mailbox_closed"], 18, 29
    ],
    "1f4eb": [
        ["\uD83D\uDCEB"], "\uE101", "\uDBB9\uDD2D", ["mailbox"], 19, 0
    ],
    "1f4ec": [
        ["\uD83D\uDCEC"], "", "", ["mailbox_with_mail"], 19, 1
    ],
    "1f4ed": [
        ["\uD83D\uDCED"], "", "", ["mailbox_with_no_mail"], 19, 2
    ],
    "1f4ee": [
        ["\uD83D\uDCEE"], "\uE102", "\uDBB9\uDD2E", ["postbox"], 19, 3
    ],
    "1f4ef": [
        ["\uD83D\uDCEF"], "", "", ["postal_horn"], 19, 4
    ],
    "1f4f0": [
        ["\uD83D\uDCF0"], "", "\uDBBA\uDC22", ["newspaper"], 19, 5
    ],
    "1f4f1": [
        ["\uD83D\uDCF1"], "\uE00A", "\uDBB9\uDD25", ["iphone"], 19, 6
    ],
    "1f4f2": [
        ["\uD83D\uDCF2"], "\uE104", "\uDBB9\uDD26", ["calling"], 19, 7
    ],
    "1f4f3": [
        ["\uD83D\uDCF3"], "\uE250", "\uDBBA\uDC39", ["vibration_mode"], 19, 8
    ],
    "1f4f4": [
        ["\uD83D\uDCF4"], "\uE251", "\uDBBA\uDC3A", ["mobile_phone_off"], 19, 9
    ],
    "1f4f5": [
        ["\uD83D\uDCF5"], "", "", ["no_mobile_phones"], 19, 10
    ],
    "1f4f6": [
        ["\uD83D\uDCF6"], "\uE20B", "\uDBBA\uDC38", ["signal_strength"], 19, 11
    ],
    "1f4f7": [
        ["\uD83D\uDCF7"], "\uE008", "\uDBB9\uDCEF", ["camera"], 19, 12
    ],
    "1f4f9": [
        ["\uD83D\uDCF9"], "\uE03D", "\uDBB9\uDCF9", ["video_camera"], 19, 13
    ],
    "1f4fa": [
        ["\uD83D\uDCFA"], "\uE12A", "\uDBBA\uDC1C", ["tv"], 19, 14
    ],
    "1f4fb": [
        ["\uD83D\uDCFB"], "\uE128", "\uDBBA\uDC1F", ["radio"], 19, 15
    ],
    "1f4fc": [
        ["\uD83D\uDCFC"], "\uE129", "\uDBBA\uDC20", ["vhs"], 19, 16
    ],
    "1f500": [
        ["\uD83D\uDD00"], "", "", ["twisted_rightwards_arrows"], 19, 17
    ],
    "1f501": [
        ["\uD83D\uDD01"], "", "", ["repeat"], 19, 18
    ],
    "1f502": [
        ["\uD83D\uDD02"], "", "", ["repeat_one"], 19, 19
    ],
    "1f503": [
        ["\uD83D\uDD03"], "", "\uDBBA\uDF91", ["arrows_clockwise"], 19, 20
    ],
    "1f504": [
        ["\uD83D\uDD04"], "", "", ["arrows_counterclockwise"], 19, 21
    ],
    "1f505": [
        ["\uD83D\uDD05"], "", "", ["low_brightness"], 19, 22
    ],
    "1f506": [
        ["\uD83D\uDD06"], "", "", ["high_brightness"], 19, 23
    ],
    "1f507": [
        ["\uD83D\uDD07"], "", "", ["mute"], 19, 24
    ],
    "1f508": [
        ["\uD83D\uDD08"], "", "", ["speaker"], 19, 25
    ],
    "1f509": [
        ["\uD83D\uDD09"], "", "", ["sound"], 19, 26
    ],
    "1f50a": [
        ["\uD83D\uDD0A"], "\uE141", "\uDBBA\uDC21", ["loud_sound"], 19, 27
    ],
    "1f50b": [
        ["\uD83D\uDD0B"], "", "\uDBB9\uDCFC", ["battery"], 19, 28
    ],
    "1f50c": [
        ["\uD83D\uDD0C"], "", "\uDBB9\uDCFE", ["electric_plug"], 19, 29
    ],
    "1f50d": [
        ["\uD83D\uDD0D"], "\uE114", "\uDBBA\uDF85", ["mag"], 20, 0
    ],
    "1f50e": [
        ["\uD83D\uDD0E"], "\uE114", "\uDBBA\uDF8D", ["mag_right"], 20, 1
    ],
    "1f50f": [
        ["\uD83D\uDD0F"], "\uE144", "\uDBBA\uDF90", ["lock_with_ink_pen"], 20, 2
    ],
    "1f510": [
        ["\uD83D\uDD10"], "\uE144", "\uDBBA\uDF8A", ["closed_lock_with_key"], 20, 3
    ],
    "1f511": [
        ["\uD83D\uDD11"], "\uE03F", "\uDBBA\uDF82", ["key"], 20, 4
    ],
    "1f512": [
        ["\uD83D\uDD12"], "\uE144", "\uDBBA\uDF86", ["lock"], 20, 5
    ],
    "1f513": [
        ["\uD83D\uDD13"], "\uE145", "\uDBBA\uDF87", ["unlock"], 20, 6
    ],
    "1f514": [
        ["\uD83D\uDD14"], "\uE325", "\uDBB9\uDCF2", ["bell"], 20, 7
    ],
    "1f515": [
        ["\uD83D\uDD15"], "", "", ["no_bell"], 20, 8
    ],
    "1f516": [
        ["\uD83D\uDD16"], "", "\uDBBA\uDF8F", ["bookmark"], 20, 9
    ],
    "1f517": [
        ["\uD83D\uDD17"], "", "\uDBBA\uDF4B", ["link"], 20, 10
    ],
    "1f518": [
        ["\uD83D\uDD18"], "", "\uDBBA\uDF8C", ["radio_button"], 20, 11
    ],
    "1f519": [
        ["\uD83D\uDD19"], "\uE235", "\uDBBA\uDF8E", ["back"], 20, 12
    ],
    "1f51a": [
        ["\uD83D\uDD1A"], "", "\uDBB8\uDC1A", ["end"], 20, 13
    ],
    "1f51b": [
        ["\uD83D\uDD1B"], "", "\uDBB8\uDC19", ["on"], 20, 14
    ],
    "1f51c": [
        ["\uD83D\uDD1C"], "", "\uDBB8\uDC18", ["soon"], 20, 15
    ],
    "1f51d": [
        ["\uD83D\uDD1D"], "\uE24C", "\uDBBA\uDF42", ["top"], 20, 16
    ],
    "1f51e": [
        ["\uD83D\uDD1E"], "\uE207", "\uDBBA\uDF25", ["underage"], 20, 17
    ],
    "1f51f": [
        ["\uD83D\uDD1F"], "", "\uDBBA\uDC3B", ["keycap_ten"], 20, 18
    ],
    "1f520": [
        ["\uD83D\uDD20"], "", "\uDBBA\uDF7C", ["capital_abcd"], 20, 19
    ],
    "1f521": [
        ["\uD83D\uDD21"], "", "\uDBBA\uDF7D", ["abcd"], 20, 20
    ],
    "1f522": [
        ["\uD83D\uDD22"], "", "\uDBBA\uDF7E", ["1234"], 20, 21
    ],
    "1f523": [
        ["\uD83D\uDD23"], "", "\uDBBA\uDF7F", ["symbols"], 20, 22
    ],
    "1f524": [
        ["\uD83D\uDD24"], "", "\uDBBA\uDF80", ["abc"], 20, 23
    ],
    "1f525": [
        ["\uD83D\uDD25"], "\uE11D", "\uDBB9\uDCF6", ["fire"], 20, 24
    ],
    "1f526": [
        ["\uD83D\uDD26"], "", "\uDBB9\uDCFB", ["flashlight"], 20, 25
    ],
    "1f527": [
        ["\uD83D\uDD27"], "", "\uDBB9\uDCC9", ["wrench"], 20, 26
    ],
    "1f528": [
        ["\uD83D\uDD28"], "\uE116", "\uDBB9\uDCCA", ["hammer"], 20, 27
    ],
    "1f529": [
        ["\uD83D\uDD29"], "", "\uDBB9\uDCCB", ["nut_and_bolt"], 20, 28
    ],
    "1f52a": [
        ["\uD83D\uDD2A"], "", "\uDBB9\uDCFA", ["hocho", "knife"], 20, 29
    ],
    "1f52b": [
        ["\uD83D\uDD2B"], "\uE113", "\uDBB9\uDCF5", ["gun"], 21, 0
    ],
    "1f52c": [
        ["\uD83D\uDD2C"], "", "", ["microscope"], 21, 1
    ],
    "1f52d": [
        ["\uD83D\uDD2D"], "", "", ["telescope"], 21, 2
    ],
    "1f52e": [
        ["\uD83D\uDD2E"], "\uE23E", "\uDBB9\uDCF7", ["crystal_ball"], 21, 3
    ],
    "1f52f": [
        ["\uD83D\uDD2F"], "\uE23E", "\uDBB9\uDCF8", ["six_pointed_star"], 21, 4
    ],
    "1f530": [
        ["\uD83D\uDD30"], "\uE209", "\uDBB8\uDC44", ["beginner"], 21, 5
    ],
    "1f531": [
        ["\uD83D\uDD31"], "\uE031", "\uDBB9\uDCD2", ["trident"], 21, 6
    ],
    "1f532": [
        ["\uD83D\uDD32"], "\uE21A", "\uDBBA\uDF64", ["black_square_button"], 21, 7
    ],
    "1f533": [
        ["\uD83D\uDD33"], "\uE21B", "\uDBBA\uDF67", ["white_square_button"], 21, 8
    ],
    "1f534": [
        ["\uD83D\uDD34"], "\uE219", "\uDBBA\uDF63", ["red_circle"], 21, 9
    ],
    "1f535": [
        ["\uD83D\uDD35"], "\uE21A", "\uDBBA\uDF64", ["large_blue_circle"], 21, 10
    ],
    "1f536": [
        ["\uD83D\uDD36"], "\uE21B", "\uDBBA\uDF73", ["large_orange_diamond"], 21, 11
    ],
    "1f537": [
        ["\uD83D\uDD37"], "\uE21B", "\uDBBA\uDF74", ["large_blue_diamond"], 21, 12
    ],
    "1f538": [
        ["\uD83D\uDD38"], "\uE21B", "\uDBBA\uDF75", ["small_orange_diamond"], 21, 13
    ],
    "1f539": [
        ["\uD83D\uDD39"], "\uE21B", "\uDBBA\uDF76", ["small_blue_diamond"], 21, 14
    ],
    "1f53a": [
        ["\uD83D\uDD3A"], "", "\uDBBA\uDF78", ["small_red_triangle"], 21, 15
    ],
    "1f53b": [
        ["\uD83D\uDD3B"], "", "\uDBBA\uDF79", ["small_red_triangle_down"], 21, 16
    ],
    "1f53c": [
        ["\uD83D\uDD3C"], "", "\uDBBA\uDF01", ["arrow_up_small"], 21, 17
    ],
    "1f53d": [
        ["\uD83D\uDD3D"], "", "\uDBBA\uDF00", ["arrow_down_small"], 21, 18
    ],
    "1f550": [
        ["\uD83D\uDD50"], "\uE024", "\uDBB8\uDC1E", ["clock1"], 21, 19
    ],
    "1f551": [
        ["\uD83D\uDD51"], "\uE025", "\uDBB8\uDC1F", ["clock2"], 21, 20
    ],
    "1f552": [
        ["\uD83D\uDD52"], "\uE026", "\uDBB8\uDC20", ["clock3"], 21, 21
    ],
    "1f553": [
        ["\uD83D\uDD53"], "\uE027", "\uDBB8\uDC21", ["clock4"], 21, 22
    ],
    "1f554": [
        ["\uD83D\uDD54"], "\uE028", "\uDBB8\uDC22", ["clock5"], 21, 23
    ],
    "1f555": [
        ["\uD83D\uDD55"], "\uE029", "\uDBB8\uDC23", ["clock6"], 21, 24
    ],
    "1f556": [
        ["\uD83D\uDD56"], "\uE02A", "\uDBB8\uDC24", ["clock7"], 21, 25
    ],
    "1f557": [
        ["\uD83D\uDD57"], "\uE02B", "\uDBB8\uDC25", ["clock8"], 21, 26
    ],
    "1f558": [
        ["\uD83D\uDD58"], "\uE02C", "\uDBB8\uDC26", ["clock9"], 21, 27
    ],
    "1f559": [
        ["\uD83D\uDD59"], "\uE02D", "\uDBB8\uDC27", ["clock10"], 21, 28
    ],
    "1f55a": [
        ["\uD83D\uDD5A"], "\uE02E", "\uDBB8\uDC28", ["clock11"], 21, 29
    ],
    "1f55b": [
        ["\uD83D\uDD5B"], "\uE02F", "\uDBB8\uDC29", ["clock12"], 22, 0
    ],
    "1f55c": [
        ["\uD83D\uDD5C"], "", "", ["clock130"], 22, 1
    ],
    "1f55d": [
        ["\uD83D\uDD5D"], "", "", ["clock230"], 22, 2
    ],
    "1f55e": [
        ["\uD83D\uDD5E"], "", "", ["clock330"], 22, 3
    ],
    "1f55f": [
        ["\uD83D\uDD5F"], "", "", ["clock430"], 22, 4
    ],
    "1f560": [
        ["\uD83D\uDD60"], "", "", ["clock530"], 22, 5
    ],
    "1f561": [
        ["\uD83D\uDD61"], "", "", ["clock630"], 22, 6
    ],
    "1f562": [
        ["\uD83D\uDD62"], "", "", ["clock730"], 22, 7
    ],
    "1f563": [
        ["\uD83D\uDD63"], "", "", ["clock830"], 22, 8
    ],
    "1f564": [
        ["\uD83D\uDD64"], "", "", ["clock930"], 22, 9
    ],
    "1f565": [
        ["\uD83D\uDD65"], "", "", ["clock1030"], 22, 10
    ],
    "1f566": [
        ["\uD83D\uDD66"], "", "", ["clock1130"], 22, 11
    ],
    "1f567": [
        ["\uD83D\uDD67"], "", "", ["clock1230"], 22, 12
    ],
    "1f5fb": [
        ["\uD83D\uDDFB"], "\uE03B", "\uDBB9\uDCC3", ["mount_fuji"], 22, 13
    ],
    "1f5fc": [
        ["\uD83D\uDDFC"], "\uE509", "\uDBB9\uDCC4", ["tokyo_tower"], 22, 14
    ],
    "1f5fd": [
        ["\uD83D\uDDFD"], "\uE51D", "\uDBB9\uDCC6", ["statue_of_liberty"], 22, 15
    ],
    "1f5fe": [
        ["\uD83D\uDDFE"], "", "\uDBB9\uDCC7", ["japan"], 22, 16
    ],
    "1f5ff": [
        ["\uD83D\uDDFF"], "", "\uDBB9\uDCC8", ["moyai"], 22, 17
    ],
    "1f600": [
        ["\uD83D\uDE00"], "", "", ["grinning"], 22, 18, ":D"
    ],
    "1f601": [
        ["\uD83D\uDE01"], "\uE404", "\uDBB8\uDF33", ["grin"], 22, 19
    ],
    "1f602": [
        ["\uD83D\uDE02"], "\uE412", "\uDBB8\uDF34", ["joy"], 22, 20
    ],
    "1f603": [
        ["\uD83D\uDE03"], "\uE057", "\uDBB8\uDF30", ["smiley"], 22, 21, ":)"
    ],
    "1f604": [
        ["\uD83D\uDE04"], "\uE415", "\uDBB8\uDF38", ["smile"], 22, 22, ":)"
    ],
    "1f605": [
        ["\uD83D\uDE05"], "\uE415\uE331", "\uDBB8\uDF31", ["sweat_smile"], 22, 23
    ],
    "1f606": [
        ["\uD83D\uDE06"], "\uE40A", "\uDBB8\uDF32", ["satisfied"], 22, 24
    ],
    "1f607": [
        ["\uD83D\uDE07"], "", "", ["innocent"], 22, 25
    ],
    "1f608": [
        ["\uD83D\uDE08"], "", "", ["smiling_imp"], 22, 26
    ],
    "1f609": [
        ["\uD83D\uDE09"], "\uE405", "\uDBB8\uDF47", ["wink"], 22, 27, ";)"
    ],
    "1f60a": [
        ["\uD83D\uDE0A"], "\uE056", "\uDBB8\uDF35", ["blush"], 22, 28
    ],
    "1f60b": [
        ["\uD83D\uDE0B"], "\uE056", "\uDBB8\uDF2B", ["yum"], 22, 29
    ],
    "1f60c": [
        ["\uD83D\uDE0C"], "\uE40A", "\uDBB8\uDF3E", ["relieved"], 23, 0
    ],
    "1f60d": [
        ["\uD83D\uDE0D"], "\uE106", "\uDBB8\uDF27", ["heart_eyes"], 23, 1
    ],
    "1f60e": [
        ["\uD83D\uDE0E"], "", "", ["sunglasses"], 23, 2
    ],
    "1f60f": [
        ["\uD83D\uDE0F"], "\uE402", "\uDBB8\uDF43", ["smirk"], 23, 3
    ],
    "1f610": [
        ["\uD83D\uDE10"], "", "", ["neutral_face"], 23, 4
    ],
    "1f611": [
        ["\uD83D\uDE11"], "", "", ["expressionless"], 23, 5
    ],
    "1f612": [
        ["\uD83D\uDE12"], "\uE40E", "\uDBB8\uDF26", ["unamused"], 23, 6
    ],
    "1f613": [
        ["\uD83D\uDE13"], "\uE108", "\uDBB8\uDF44", ["sweat"], 23, 7
    ],
    "1f614": [
        ["\uD83D\uDE14"], "\uE403", "\uDBB8\uDF40", ["pensive"], 23, 8
    ],
    "1f615": [
        ["\uD83D\uDE15"], "", "", ["confused"], 23, 9
    ],
    "1f616": [
        ["\uD83D\uDE16"], "\uE407", "\uDBB8\uDF3F", ["confounded"], 23, 10
    ],
    "1f617": [
        ["\uD83D\uDE17"], "", "", ["kissing"], 23, 11
    ],
    "1f618": [
        ["\uD83D\uDE18"], "\uE418", "\uDBB8\uDF2C", ["kissing_heart"], 23, 12
    ],
    "1f619": [
        ["\uD83D\uDE19"], "", "", ["kissing_smiling_eyes"], 23, 13
    ],
    "1f61a": [
        ["\uD83D\uDE1A"], "\uE417", "\uDBB8\uDF2D", ["kissing_closed_eyes"], 23, 14
    ],
    "1f61b": [
        ["\uD83D\uDE1B"], "", "", ["stuck_out_tongue"], 23, 15, ":p"
    ],
    "1f61c": [
        ["\uD83D\uDE1C"], "\uE105", "\uDBB8\uDF29", ["stuck_out_tongue_winking_eye"], 23, 16, ";p"
    ],
    "1f61d": [
        ["\uD83D\uDE1D"], "\uE409", "\uDBB8\uDF2A", ["stuck_out_tongue_closed_eyes"], 23, 17
    ],
    "1f61e": [
        ["\uD83D\uDE1E"], "\uE058", "\uDBB8\uDF23", ["disappointed"], 23, 18, ":("
    ],
    "1f61f": [
        ["\uD83D\uDE1F"], "", "", ["worried"], 23, 19
    ],
    "1f620": [
        ["\uD83D\uDE20"], "\uE059", "\uDBB8\uDF20", ["angry"], 23, 20
    ],
    "1f621": [
        ["\uD83D\uDE21"], "\uE416", "\uDBB8\uDF3D", ["rage"], 23, 21
    ],
    "1f622": [
        ["\uD83D\uDE22"], "\uE413", "\uDBB8\uDF39", ["cry"], 23, 22, ":'("
    ],
    "1f623": [
        ["\uD83D\uDE23"], "\uE406", "\uDBB8\uDF3C", ["persevere"], 23, 23
    ],
    "1f624": [
        ["\uD83D\uDE24"], "\uE404", "\uDBB8\uDF28", ["triumph"], 23, 24
    ],
    "1f625": [
        ["\uD83D\uDE25"], "\uE401", "\uDBB8\uDF45", ["disappointed_relieved"], 23, 25
    ],
    "1f626": [
        ["\uD83D\uDE26"], "", "", ["frowning"], 23, 26
    ],
    "1f627": [
        ["\uD83D\uDE27"], "", "", ["anguished"], 23, 27
    ],
    "1f628": [
        ["\uD83D\uDE28"], "\uE40B", "\uDBB8\uDF3B", ["fearful"], 23, 28
    ],
    "1f629": [
        ["\uD83D\uDE29"], "\uE403", "\uDBB8\uDF21", ["weary"], 23, 29
    ],
    "1f62a": [
        ["\uD83D\uDE2A"], "\uE408", "\uDBB8\uDF42", ["sleepy"], 24, 0
    ],
    "1f62b": [
        ["\uD83D\uDE2B"], "\uE406", "\uDBB8\uDF46", ["tired_face"], 24, 1
    ],
    "1f62c": [
        ["\uD83D\uDE2C"], "", "", ["grimacing"], 24, 2
    ],
    "1f62d": [
        ["\uD83D\uDE2D"], "\uE411", "\uDBB8\uDF3A", ["sob"], 24, 3, ":'("
    ],
    "1f62e": [
        ["\uD83D\uDE2E"], "", "", ["open_mouth"], 24, 4
    ],
    "1f62f": [
        ["\uD83D\uDE2F"], "", "", ["hushed"], 24, 5
    ],
    "1f630": [
        ["\uD83D\uDE30"], "\uE40F", "\uDBB8\uDF25", ["cold_sweat"], 24, 6
    ],
    "1f631": [
        ["\uD83D\uDE31"], "\uE107", "\uDBB8\uDF41", ["scream"], 24, 7
    ],
    "1f632": [
        ["\uD83D\uDE32"], "\uE410", "\uDBB8\uDF22", ["astonished"], 24, 8
    ],
    "1f633": [
        ["\uD83D\uDE33"], "\uE40D", "\uDBB8\uDF2F", ["flushed"], 24, 9
    ],
    "1f634": [
        ["\uD83D\uDE34"], "", "", ["sleeping"], 24, 10
    ],
    "1f635": [
        ["\uD83D\uDE35"], "\uE406", "\uDBB8\uDF24", ["dizzy_face"], 24, 11
    ],
    "1f636": [
        ["\uD83D\uDE36"], "", "", ["no_mouth"], 24, 12
    ],
    "1f637": [
        ["\uD83D\uDE37"], "\uE40C", "\uDBB8\uDF2E", ["mask"], 24, 13
    ],
    "1f638": [
        ["\uD83D\uDE38"], "\uE404", "\uDBB8\uDF49", ["smile_cat"], 24, 14
    ],
    "1f639": [
        ["\uD83D\uDE39"], "\uE412", "\uDBB8\uDF4A", ["joy_cat"], 24, 15
    ],
    "1f63a": [
        ["\uD83D\uDE3A"], "\uE057", "\uDBB8\uDF48", ["smiley_cat"], 24, 16
    ],
    "1f63b": [
        ["\uD83D\uDE3B"], "\uE106", "\uDBB8\uDF4C", ["heart_eyes_cat"], 24, 17
    ],
    "1f63c": [
        ["\uD83D\uDE3C"], "\uE404", "\uDBB8\uDF4F", ["smirk_cat"], 24, 18
    ],
    "1f63d": [
        ["\uD83D\uDE3D"], "\uE418", "\uDBB8\uDF4B", ["kissing_cat"], 24, 19
    ],
    "1f63e": [
        ["\uD83D\uDE3E"], "\uE416", "\uDBB8\uDF4E", ["pouting_cat"], 24, 20
    ],
    "1f63f": [
        ["\uD83D\uDE3F"], "\uE413", "\uDBB8\uDF4D", ["crying_cat_face"], 24, 21
    ],
    "1f640": [
        ["\uD83D\uDE40"], "\uE403", "\uDBB8\uDF50", ["scream_cat"], 24, 22
    ],
    "1f645": [
        ["\uD83D\uDE45"], "\uE423", "\uDBB8\uDF51", ["no_good"], 24, 23
    ],
    "1f646": [
        ["\uD83D\uDE46"], "\uE424", "\uDBB8\uDF52", ["ok_woman"], 24, 24
    ],
    "1f647": [
        ["\uD83D\uDE47"], "\uE426", "\uDBB8\uDF53", ["bow"], 24, 25
    ],
    "1f648": [
        ["\uD83D\uDE48"], "", "\uDBB8\uDF54", ["see_no_evil"], 24, 26
    ],
    "1f649": [
        ["\uD83D\uDE49"], "", "\uDBB8\uDF56", ["hear_no_evil"], 24, 27
    ],
    "1f64a": [
        ["\uD83D\uDE4A"], "", "\uDBB8\uDF55", ["speak_no_evil"], 24, 28
    ],
    "1f64b": [
        ["\uD83D\uDE4B"], "\uE012", "\uDBB8\uDF57", ["raising_hand"], 24, 29
    ],
    "1f64c": [
        ["\uD83D\uDE4C"], "\uE427", "\uDBB8\uDF58", ["raised_hands"], 25, 0
    ],
    "1f64d": [
        ["\uD83D\uDE4D"], "\uE403", "\uDBB8\uDF59", ["person_frowning"], 25, 1
    ],
    "1f64e": [
        ["\uD83D\uDE4E"], "\uE416", "\uDBB8\uDF5A", ["person_with_pouting_face"], 25, 2
    ],
    "1f64f": [
        ["\uD83D\uDE4F"], "\uE41D", "\uDBB8\uDF5B", ["pray"], 25, 3
    ],
    "1f680": [
        ["\uD83D\uDE80"], "\uE10D", "\uDBB9\uDFED", ["rocket"], 25, 4
    ],
    "1f681": [
        ["\uD83D\uDE81"], "", "", ["helicopter"], 25, 5
    ],
    "1f682": [
        ["\uD83D\uDE82"], "", "", ["steam_locomotive"], 25, 6
    ],
    "1f683": [
        ["\uD83D\uDE83"], "\uE01E", "\uDBB9\uDFDF", ["railway_car"], 25, 7
    ],
    "1f684": [
        ["\uD83D\uDE84"], "\uE435", "\uDBB9\uDFE2", ["bullettrain_side"], 25, 8
    ],
    "1f685": [
        ["\uD83D\uDE85"], "\uE01F", "\uDBB9\uDFE3", ["bullettrain_front"], 25, 9
    ],
    "1f686": [
        ["\uD83D\uDE86"], "", "", ["train2"], 25, 10
    ],
    "1f687": [
        ["\uD83D\uDE87"], "\uE434", "\uDBB9\uDFE0", ["metro"], 25, 11
    ],
    "1f688": [
        ["\uD83D\uDE88"], "", "", ["light_rail"], 25, 12
    ],
    "1f689": [
        ["\uD83D\uDE89"], "\uE039", "\uDBB9\uDFEC", ["station"], 25, 13
    ],
    "1f68a": [
        ["\uD83D\uDE8A"], "", "", ["tram"], 25, 14
    ],
    "1f68b": [
        ["\uD83D\uDE8B"], "", "", ["train"], 25, 15
    ],
    "1f68c": [
        ["\uD83D\uDE8C"], "\uE159", "\uDBB9\uDFE6", ["bus"], 25, 16
    ],
    "1f68d": [
        ["\uD83D\uDE8D"], "", "", ["oncoming_bus"], 25, 17
    ],
    "1f68e": [
        ["\uD83D\uDE8E"], "", "", ["trolleybus"], 25, 18
    ],
    "1f68f": [
        ["\uD83D\uDE8F"], "\uE150", "\uDBB9\uDFE7", ["busstop"], 25, 19
    ],
    "1f690": [
        ["\uD83D\uDE90"], "", "", ["minibus"], 25, 20
    ],
    "1f691": [
        ["\uD83D\uDE91"], "\uE431", "\uDBB9\uDFF3", ["ambulance"], 25, 21
    ],
    "1f692": [
        ["\uD83D\uDE92"], "\uE430", "\uDBB9\uDFF2", ["fire_engine"], 25, 22
    ],
    "1f693": [
        ["\uD83D\uDE93"], "\uE432", "\uDBB9\uDFF4", ["police_car"], 25, 23
    ],
    "1f694": [
        ["\uD83D\uDE94"], "", "", ["oncoming_police_car"], 25, 24
    ],
    "1f695": [
        ["\uD83D\uDE95"], "\uE15A", "\uDBB9\uDFEF", ["taxi"], 25, 25
    ],
    "1f696": [
        ["\uD83D\uDE96"], "", "", ["oncoming_taxi"], 25, 26
    ],
    "1f697": [
        ["\uD83D\uDE97"], "\uE01B", "\uDBB9\uDFE4", ["car", "red_car"], 25, 27
    ],
    "1f698": [
        ["\uD83D\uDE98"], "", "", ["oncoming_automobile"], 25, 28
    ],
    "1f699": [
        ["\uD83D\uDE99"], "\uE42E", "\uDBB9\uDFE5", ["blue_car"], 25, 29
    ],
    "1f69a": [
        ["\uD83D\uDE9A"], "\uE42F", "\uDBB9\uDFF1", ["truck"], 26, 0
    ],
    "1f69b": [
        ["\uD83D\uDE9B"], "", "", ["articulated_lorry"], 26, 1
    ],
    "1f69c": [
        ["\uD83D\uDE9C"], "", "", ["tractor"], 26, 2
    ],
    "1f69d": [
        ["\uD83D\uDE9D"], "", "", ["monorail"], 26, 3
    ],
    "1f69e": [
        ["\uD83D\uDE9E"], "", "", ["mountain_railway"], 26, 4
    ],
    "1f69f": [
        ["\uD83D\uDE9F"], "", "", ["suspension_railway"], 26, 5
    ],
    "1f6a0": [
        ["\uD83D\uDEA0"], "", "", ["mountain_cableway"], 26, 6
    ],
    "1f6a1": [
        ["\uD83D\uDEA1"], "", "", ["aerial_tramway"], 26, 7
    ],
    "1f6a2": [
        ["\uD83D\uDEA2"], "\uE202", "\uDBB9\uDFE8", ["ship"], 26, 8
    ],
    "1f6a3": [
        ["\uD83D\uDEA3"], "", "", ["rowboat"], 26, 9
    ],
    "1f6a4": [
        ["\uD83D\uDEA4"], "\uE135", "\uDBB9\uDFEE", ["speedboat"], 26, 10
    ],
    "1f6a5": [
        ["\uD83D\uDEA5"], "\uE14E", "\uDBB9\uDFF7", ["traffic_light"], 26, 11
    ],
    "1f6a6": [
        ["\uD83D\uDEA6"], "", "", ["vertical_traffic_light"], 26, 12
    ],
    "1f6a7": [
        ["\uD83D\uDEA7"], "\uE137", "\uDBB9\uDFF8", ["construction"], 26, 13
    ],
    "1f6a8": [
        ["\uD83D\uDEA8"], "\uE432", "\uDBB9\uDFF9", ["rotating_light"], 26, 14
    ],
    "1f6a9": [
        ["\uD83D\uDEA9"], "", "\uDBBA\uDF22", ["triangular_flag_on_post"], 26, 15
    ],
    "1f6aa": [
        ["\uD83D\uDEAA"], "", "\uDBB9\uDCF3", ["door"], 26, 16
    ],
    "1f6ab": [
        ["\uD83D\uDEAB"], "", "\uDBBA\uDF48", ["no_entry_sign"], 26, 17
    ],
    "1f6ac": [
        ["\uD83D\uDEAC"], "\uE30E", "\uDBBA\uDF1E", ["smoking"], 26, 18
    ],
    "1f6ad": [
        ["\uD83D\uDEAD"], "\uE208", "\uDBBA\uDF1F", ["no_smoking"], 26, 19
    ],
    "1f6ae": [
        ["\uD83D\uDEAE"], "", "", ["put_litter_in_its_place"], 26, 20
    ],
    "1f6af": [
        ["\uD83D\uDEAF"], "", "", ["do_not_litter"], 26, 21
    ],
    "1f6b0": [
        ["\uD83D\uDEB0"], "", "", ["potable_water"], 26, 22
    ],
    "1f6b1": [
        ["\uD83D\uDEB1"], "", "", ["non-potable_water"], 26, 23
    ],
    "1f6b2": [
        ["\uD83D\uDEB2"], "\uE136", "\uDBB9\uDFEB", ["bike"], 26, 24
    ],
    "1f6b3": [
        ["\uD83D\uDEB3"], "", "", ["no_bicycles"], 26, 25
    ],
    "1f6b4": [
        ["\uD83D\uDEB4"], "", "", ["bicyclist"], 26, 26
    ],
    "1f6b5": [
        ["\uD83D\uDEB5"], "", "", ["mountain_bicyclist"], 26, 27
    ],
    "1f6b6": [
        ["\uD83D\uDEB6"], "\uE201", "\uDBB9\uDFF0", ["walking"], 26, 28
    ],
    "1f6b7": [
        ["\uD83D\uDEB7"], "", "", ["no_pedestrians"], 26, 29
    ],
    "1f6b8": [
        ["\uD83D\uDEB8"], "", "", ["children_crossing"], 27, 0
    ],
    "1f6b9": [
        ["\uD83D\uDEB9"], "\uE138", "\uDBBA\uDF33", ["mens"], 27, 1
    ],
    "1f6ba": [
        ["\uD83D\uDEBA"], "\uE139", "\uDBBA\uDF34", ["womens"], 27, 2
    ],
    "1f6bb": [
        ["\uD83D\uDEBB"], "\uE151", "\uDBB9\uDD06", ["restroom"], 27, 3
    ],
    "1f6bc": [
        ["\uD83D\uDEBC"], "\uE13A", "\uDBBA\uDF35", ["baby_symbol"], 27, 4
    ],
    "1f6bd": [
        ["\uD83D\uDEBD"], "\uE140", "\uDBB9\uDD07", ["toilet"], 27, 5
    ],
    "1f6be": [
        ["\uD83D\uDEBE"], "\uE309", "\uDBB9\uDD08", ["wc"], 27, 6
    ],
    "1f6bf": [
        ["\uD83D\uDEBF"], "", "", ["shower"], 27, 7
    ],
    "1f6c0": [
        ["\uD83D\uDEC0"], "\uE13F", "\uDBB9\uDD05", ["bath"], 27, 8
    ],
    "1f6c1": [
        ["\uD83D\uDEC1"], "", "", ["bathtub"], 27, 9
    ],
    "1f6c2": [
        ["\uD83D\uDEC2"], "", "", ["passport_control"], 27, 10
    ],
    "1f6c3": [
        ["\uD83D\uDEC3"], "", "", ["customs"], 27, 11
    ],
    "1f6c4": [
        ["\uD83D\uDEC4"], "", "", ["baggage_claim"], 27, 12
    ],
    "1f6c5": [
        ["\uD83D\uDEC5"], "", "", ["left_luggage"], 27, 13
    ],
    "0023-20e3": [
        ["\u0023\uFE0F\u20E3", "\u0023\u20E3"], "\uE210", "\uDBBA\uDC2C", ["hash"], 27, 14
    ],
    "0030-20e3": [
        ["\u0030\uFE0F\u20E3", "\u0030\u20E3"], "\uE225", "\uDBBA\uDC37", ["zero"], 27, 15
    ],
    "0031-20e3": [
        ["\u0031\uFE0F\u20E3", "\u0031\u20E3"], "\uE21C", "\uDBBA\uDC2E", ["one"], 27, 16
    ],
    "0032-20e3": [
        ["\u0032\uFE0F\u20E3", "\u0032\u20E3"], "\uE21D", "\uDBBA\uDC2F", ["two"], 27, 17
    ],
    "0033-20e3": [
        ["\u0033\uFE0F\u20E3", "\u0033\u20E3"], "\uE21E", "\uDBBA\uDC30", ["three"], 27, 18
    ],
    "0034-20e3": [
        ["\u0034\uFE0F\u20E3", "\u0034\u20E3"], "\uE21F", "\uDBBA\uDC31", ["four"], 27, 19
    ],
    "0035-20e3": [
        ["\u0035\uFE0F\u20E3", "\u0035\u20E3"], "\uE220", "\uDBBA\uDC32", ["five"], 27, 20
    ],
    "0036-20e3": [
        ["\u0036\uFE0F\u20E3", "\u0036\u20E3"], "\uE221", "\uDBBA\uDC33", ["six"], 27, 21
    ],
    "0037-20e3": [
        ["\u0037\uFE0F\u20E3", "\u0037\u20E3"], "\uE222", "\uDBBA\uDC34", ["seven"], 27, 22
    ],
    "0038-20e3": [
        ["\u0038\uFE0F\u20E3", "\u0038\u20E3"], "\uE223", "\uDBBA\uDC35", ["eight"], 27, 23
    ],
    "0039-20e3": [
        ["\u0039\uFE0F\u20E3", "\u0039\u20E3"], "\uE224", "\uDBBA\uDC36", ["nine"], 27, 24
    ],
    "1f1e8-1f1f3": [
        ["\uD83C\uDDE8\uD83C\uDDF3"], "\uE513", "\uDBB9\uDCED", ["cn"], 27, 25
    ],
    "1f1e9-1f1ea": [
        ["\uD83C\uDDE9\uD83C\uDDEA"], "\uE50E", "\uDBB9\uDCE8", ["de"], 27, 26
    ],
    "1f1ea-1f1f8": [
        ["\uD83C\uDDEA\uD83C\uDDF8"], "\uE511", "\uDBB9\uDCEB", ["es"], 27, 27
    ],
    "1f1eb-1f1f7": [
        ["\uD83C\uDDEB\uD83C\uDDF7"], "\uE50D", "\uDBB9\uDCE7", ["fr"], 27, 28
    ],
    "1f1ec-1f1e7": [
        ["\uD83C\uDDEC\uD83C\uDDE7"], "\uE510", "\uDBB9\uDCEA", ["gb", "uk"], 27, 29
    ],
    "1f1ee-1f1f9": [
        ["\uD83C\uDDEE\uD83C\uDDF9"], "\uE50F", "\uDBB9\uDCE9", ["it"], 28, 0
    ],
    "1f1ef-1f1f5": [
        ["\uD83C\uDDEF\uD83C\uDDF5"], "\uE50B", "\uDBB9\uDCE5", ["jp"], 28, 1
    ],
    "1f1f0-1f1f7": [
        ["\uD83C\uDDF0\uD83C\uDDF7"], "\uE514", "\uDBB9\uDCEE", ["kr"], 28, 2
    ],
    "1f1f7-1f1fa": [
        ["\uD83C\uDDF7\uD83C\uDDFA"], "\uE512", "\uDBB9\uDCEC", ["ru"], 28, 3
    ],
    "1f1fa-1f1f8": [
        ["\uD83C\uDDFA\uD83C\uDDF8"], "\uE50C", "\uDBB9\uDCE6", ["us"], 28, 4
    ]
};

Config.smileys = {
    "<3": "heart",
    "<\/3": "broken_heart",
    ":)": "blush",
    "(:": "blush",
    ":-)": "blush",
    "C:": "smile",
    "c:": "smile",
    ":D": "smile",
    ":-D": "smile",
    ";)": "wink",
    ";-)": "wink",
    "):": "disappointed",
    ":(": "disappointed",
    ":-(": "disappointed",
    ":'(": "cry",
    "=)": "smiley",
    "=-)": "smiley",
    ":*": "kiss",
    ":-*": "kiss",
    ":>": "laughing",
    ":->": "laughing",
    "8)": "sunglasses",
    ":\\\\": "confused",
    ":-\\\\": "confused",
    ":\/": "confused",
    ":-\/": "confused",
    ":|": "neutral_face",
    ":-|": "neutral_face",
    ":o": "open_mouth",
    ":-o": "open_mouth",
    ">:(": "angry",
    ">:-(": "angry",
    ":p": "stuck_out_tongue",
    ":-p": "stuck_out_tongue",
    ":P": "stuck_out_tongue",
    ":-P": "stuck_out_tongue",
    ":b": "stuck_out_tongue",
    ":-b": "stuck_out_tongue",
    ";p": "stuck_out_tongue_winking_eye",
    ";-p": "stuck_out_tongue_winking_eye",
    ";b": "stuck_out_tongue_winking_eye",
    ";-b": "stuck_out_tongue_winking_eye",
    ";P": "stuck_out_tongue_winking_eye",
    ";-P": "stuck_out_tongue_winking_eye",
    ":o)": "monkey_face",
    "D:": "anguished"
};

Config.inits = {};
Config.map = {};

Config.mapcolon = {};
var a = [];
Config.reversemap = {};

Config.init_emoticons = function()
{
    if (Config.inits.emoticons)
        return;
    Config.init_colons(); // we require this for the emoticons map
    Config.inits.emoticons = 1;

    var a = [];
    Config.map.emoticons = {};
    for (var i in Config.emoticons_data)
    {
        // because we never see some characters in our text except as
        // entities, we must do some replacing
        var emoticon = i.replace(/\&/g, '&amp;').replace(/\</g, '&lt;')
            .replace(/\>/g, '&gt;');

        if (!Config.map.colons[emoji.emoticons_data[i]])
            continue;

        Config.map.emoticons[emoticon] = Config.map.colons[Config.emoticons_data[i]];
        a.push(Config.escape_rx(emoticon));
    }
    Config.rx_emoticons = new RegExp(
        ('(^|\\s)(' + a.join('|') + ')(?=$|[\\s|\\?\\.,!])'), 'g');
};
Config.init_colons = function()
{
    if (Config.inits.colons)
        return;
    Config.inits.colons = 1;
    Config.rx_colons = new RegExp('\:[^\\s:]+\:', 'g');
    Config.map.colons = {};
    for (var i in Config.data)
    {
        for (var j = 0; j < Config.data[i][3].length; j++)
        {
            Config.map.colons[emoji.data[i][3][j]] = i;
        }
    }
};
Config.init_unified = function()
{
    if (Config.inits.unified)
        return;
    Config.inits.unified = 1;

    buildMap();

};


Config.escape_rx = function(text)
{
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function buildMap()
{

    var colons = [],codes=[];
    for (var i in Config.emoji_data)
    {
        for (var j = 0; j < Config.emoji_data[i][0].length; j++)
        {
            colons.push(Config.escape_rx (":"+Config.emoji_data[i][3][0])+":");
            codes.push(Config.emoji_data[i][0][0]);

            // it is a map of {"colon smiley":"unicode char"}
            Config.map[Config.emoji_data[i][3][0]] = Config.emoji_data[i][0][0];
            Config.mapcolon[":"+Config.emoji_data[i][3][0]+":"] = Config.emoji_data[i][0][0];
            // it is a map of {"unicode char": "colon smiley"}
            Config.reversemap[Config.emoji_data[i][0][0]] = Config.emoji_data[i][3][0];
        }

        Config.rx_colons = new RegExp('(' + colons.join('|') + ')', "g");
        Config.rx_codes = new RegExp('(' + codes.join('|') + ')', "g");
    }
}




////////////////////////////////////////////////////////////////////////


'use strict';

function cancelEvent (event) {
  event = event || window.event;
  if (event) {
    event = event.originalEvent || event;

    if (event.stopPropagation) event.stopPropagation();
    if (event.preventDefault) event.preventDefault();
  }

  return false;
}

function getGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

//ConfigStorage
(function(window)
{
    var keyPrefix = '';
    var noPrefix = false;
    var cache = {};
    var useCs = !!(window.chrome && chrome.storage && chrome.storage.local);
    var useLs = !useCs && !!window.localStorage;

    function storageSetPrefix(newPrefix)
    {
        keyPrefix = newPrefix;
    }

    function storageSetNoPrefix()
    {
        noPrefix = true;
    }

    function storageGetPrefix()
    {
        if (noPrefix)
        {
            noPrefix = false;
            return '';
        }
        return keyPrefix;
    }

    function storageGetValue()
    {
        var keys = Array.prototype.slice.call(arguments),
            callback = keys.pop(),
            result = [],
            single = keys.length == 1,
            value,
            allFound = true,
            prefix = storageGetPrefix(),
            i, key;

        for (i = 0; i < keys.length; i++)
        {
            key = keys[i] = prefix + keys[i];
            if (key.substr(0, 3) != 'xt_' && cache[key] !== undefined)
            {
                result.push(cache[key]);
            }
            else if (useLs)
            {
                try
                {
                    value = localStorage.getItem(key);
                }
                catch (e)
                {
                    useLs = false;
                }
                try
                {
                    value = (value === undefined || value === null) ? false : JSON.parse(value);
                }
                catch (e)
                {
                    value = false;
                }
                result.push(cache[key] = value);
            }
            else if (!useCs)
            {
                result.push(cache[key] = false);
            }
            else
            {
                allFound = false;
            }
        }

        if (allFound)
        {
            return callback(single ? result[0] : result);
        }

        chrome.storage.local.get(keys, function(resultObj)
        {
            var value;
            result = [];
            for (i = 0; i < keys.length; i++)
            {
                key = keys[i];
                value = resultObj[key];
                value = value === undefined || value === null ? false : JSON.parse(value);
                result.push(cache[key] = value);
            }

            callback(single ? result[0] : result);
        });
    };

    function storageSetValue(obj, callback)
    {
        var keyValues = {},
            prefix = storageGetPrefix(),
            key, value;

        for (key in obj)
        {
            if (obj.hasOwnProperty(key))
            {
                value = obj[key];
                key = prefix + key;
                cache[key] = value;
                value = JSON.stringify(value);
                if (useLs)
                {
                    try
                    {
                        localStorage.setItem(key, value);
                    }
                    catch (e)
                    {
                        useLs = false;
                    }
                }
                else
                {
                    keyValues[key] = value;
                }
            }
        }

        if (useLs || !useCs)
        {
            if (callback)
            {
                callback();
            }
            return;
        }

        chrome.storage.local.set(keyValues, callback);
    };

    function storageRemoveValue()
    {
        var keys = Array.prototype.slice.call(arguments),
            prefix = storageGetPrefix(),
            i, key, callback;

        if (typeof keys[keys.length - 1] === 'function')
        {
            callback = keys.pop();
        }

        for (i = 0; i < keys.length; i++)
        {
            key = keys[i] = prefix + keys[i];
            delete cache[key];
            if (useLs)
            {
                try
                {
                    localStorage.removeItem(key);
                }
                catch (e)
                {
                    useLs = false;
                }
            }
        }
        if (useCs)
        {
            chrome.storage.local.remove(keys, callback);
        }
        else if (callback)
        {
            callback();
        }
    };

    window.ConfigStorage = {
        prefix: storageSetPrefix,
        noPrefix: storageSetNoPrefix,
        get: storageGetValue,
        set: storageSetValue,
        remove: storageRemoveValue
    };
})(this);

// Pollyfill for IE 9 support of CustomEvent
(function () {

  if ( typeof window.CustomEvent === "function" ) return false;

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();


////////////////////////////////////////////////////////////////////////

/**
 * emojiarea - A rich textarea control that supports emojis, WYSIWYG-style.
 * Copyright (c) 2012 DIY Co
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@diy.org>
 */

/**
 * This file also contains some modifications by Igor Zhukov in order to add
 * custom scrollbars to EmojiMenu See keyword `MODIFICATION` in source code.
 */
(function($, window, document) {

  var ELEMENT_NODE = 1;
  var TEXT_NODE = 3;
  var TAGS_BLOCK = [ 'p', 'div', 'pre', 'form' ];
  var KEY_ESC = 27;
  var KEY_TAB = 9;
  /* Keys that are not intercepted and canceled when the textbox has reached its max length:
        Backspace, Tab, Ctrl, Alt, Left Arrow, Up Arrow, Right Arrow, Down Arrow, Cmd Key, Delete
  */
  var MAX_LENGTH_ALLOWED_KEYS = [8, 9, 17, 18, 37, 38, 39, 40, 91, 46];

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /*
   * ! MODIFICATION START Options 'spritesheetPath', 'spritesheetDimens',
   * 'iconSize' added by Andre Staltz.
   */
  jQuery.emojiarea = {
    assetsPath : '',
    spriteSheetPath: '',
    blankGifPath: '',
    iconSize : 25,
    icons : {},
  };
  var defaultRecentEmojis = ':joy:,:kissing_heart:,:heart:,:heart_eyes:,:blush:,:grin:,:+1:,:relaxed:,:pensive:,:smile:,:sob:,:kiss:,:unamused:,:flushed:,:stuck_out_tongue_winking_eye:,:see_no_evil:,:wink:,:smiley:,:cry:,:stuck_out_tongue_closed_eyes:,:scream:,:rage:,:smirk:,:disappointed:,:sweat_smile:,:kissing_closed_eyes:,:speak_no_evil:,:relieved:,:grinning:,:yum:,:laughing:,:ok_hand:,:neutral_face:,:confused:'
      .split(',');
  /* ! MODIFICATION END */

  jQuery.fn.emojiarea = function(options) {
    options = jQuery.extend({}, options);
    return this
      .each(function () {
        var originalInput = $(this);
        if ('contentEditable' in document.body
          && options.wysiwyg !== false) {
          var id = getGuid();
          new EmojiArea_WYSIWYG(originalInput, id, $.extend({}, options));
        } else {
          var id = getGuid();
          new EmojiArea_Plain(originalInput, id, options);
        }
        originalInput.attr(
          {
            'data-emojiable': 'converted',
            'data-id': id,
            'data-type': 'original-input'
          });
      });
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  var util = {};

  util.restoreSelection = (function() {
    if (window.getSelection) {
      return function(savedSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        for (var i = 0, len = savedSelection.length; i < len; ++i) {
          sel.addRange(savedSelection[i]);
        }
      };
    } else if (document.selection && document.selection.createRange) {
      return function(savedSelection) {
        if (savedSelection) {
          savedSelection.select();
        }
      };
    }
  })();

  util.saveSelection = (function() {
    if (window.getSelection) {
      return function() {
        var sel = window.getSelection(), ranges = [];
        if (sel.rangeCount) {
          for (var i = 0, len = sel.rangeCount; i < len; ++i) {
            ranges.push(sel.getRangeAt(i));
          }
        }
        return ranges;
      };
    } else if (document.selection && document.selection.createRange) {
      return function() {
        var sel = document.selection;
        return (sel.type.toLowerCase() !== 'none') ? sel.createRange()
            : null;
      };
    }
  })();

  util.replaceSelection = (function() {
    if (window.getSelection) {
      return function(content) {
        var range, sel = window.getSelection();
        var node = typeof content === 'string' ? document
            .createTextNode(content) : content;
        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          //range.insertNode(document.createTextNode(''));
          range.insertNode(node);
          range.setStart(node, 0);

          window.setTimeout(function() {
            range = document.createRange();
            range.setStartAfter(node);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }, 0);
        }
      }
    } else if (document.selection && document.selection.createRange) {
      return function(content) {
        var range = document.selection.createRange();
        if (typeof content === 'string') {
          range.text = content;
        } else {
          range.pasteHTML(content.outerHTML);
        }
      }
    }
  })();

  util.insertAtCursor = function(text, el) {
    text = ' ' + text;
    var val = el.value, endIndex, startIndex, range;
    if (typeof el.selectionStart != 'undefined'
        && typeof el.selectionEnd != 'undefined') {
      startIndex = el.selectionStart;
      endIndex = el.selectionEnd;
      el.value = val.substring(0, startIndex) + text
          + val.substring(el.selectionEnd);
      el.selectionStart = el.selectionEnd = startIndex + text.length;
    } else if (typeof document.selection != 'undefined'
        && typeof document.selection.createRange != 'undefined') {
      el.focus();
      range = document.selection.createRange();
      range.text = text;
      range.select();
    }
  };

  util.extend = function(a, b) {
    if (typeof a === 'undefined' || !a) {
      a = {};
    }
    if (typeof b === 'object') {
      for ( var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
    }
    return a;
  };

  util.escapeRegex = function(str) {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  };

  util.htmlEntities = function(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /*
   * ! MODIFICATION START This function was added by Igor Zhukov to save
   * recent used emojis.
   */
  util.emojiInserted = function(emojiKey, menu) {
    ConfigStorage.get('emojis_recent', function(curEmojis) {
      curEmojis = curEmojis || defaultRecentEmojis || [];

      var pos = curEmojis.indexOf(emojiKey);
      if (!pos) {
        return false;
      }
      if (pos != -1) {
        curEmojis.splice(pos, 1);
      }
      curEmojis.unshift(emojiKey);
      if (curEmojis.length > 42) {
        curEmojis = curEmojis.slice(42);
      }

      ConfigStorage.set({
        emojis_recent : curEmojis
      });
    })
  };
  /* ! MODIFICATION END */

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  var EmojiArea = function() {
  };

  EmojiArea.prototype.setup = function() {
    var self = this;

    this.$editor.on('focus', function() {
      self.hasFocus = true;
    });
    this.$editor.on('blur', function() {
      self.hasFocus = false;
    });

    // Assign a unique instance of an emojiMenu to
    self.emojiMenu = new EmojiMenu(self);

    this.setupButton();
  };

  EmojiArea.prototype.setupButton = function() {
    var self = this;
    var $button = $('[data-id=' + this.id + '][data-type=picker]');

    $button.on('click', function(e) {
      self.emojiMenu.show(self);
    });

    this.$button = $button;
    this.$dontHideOnClick = 'emoji-picker';
  };

  /*
   * ! MODIFICATION START This function was modified by Andre Staltz so that
   * the icon is created from a spritesheet.
   */
  EmojiArea.createIcon = function(emoji, menu) {
    var category = emoji[0];
    var row = emoji[1];
    var column = emoji[2];
    var name = emoji[3];
    var filename = $.emojiarea.spriteSheetPath ? $.emojiarea.spriteSheetPath : $.emojiarea.assetsPath + '/emoji_spritesheet_!.png';
    var blankGifPath = $.emojiarea.blankGifPath ? $.emojiarea.blankGifPath : $.emojiarea.assetsPath + '/blank.gif';
    var iconSize = menu && Config.Mobile ? 26 : $.emojiarea.iconSize
    var xoffset = -(iconSize * column);
    var yoffset = -(iconSize * row);
    var scaledWidth = (Config.EmojiCategorySpritesheetDimens[category][1] * iconSize);
    var scaledHeight = (Config.EmojiCategorySpritesheetDimens[category][0] * iconSize);

    var style = 'display:inline-block;';
    style += 'width:' + iconSize + 'px;';
    style += 'height:' + iconSize + 'px;';
    style += 'background:url(\'' + filename.replace('!', category) + '\') '
        + xoffset + 'px ' + yoffset + 'px no-repeat;';
    style += 'background-size:' + scaledWidth + 'px ' + scaledHeight
        + 'px;';
    return '<img src="' + blankGifPath + '" class="img" style="'
        + style + '" alt="' + util.htmlEntities(name) + '">';
  };

  $.emojiarea.createIcon = EmojiArea.createIcon;
  /* ! MODIFICATION END */

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /**
   * Editor (plain-text)
   *
   * @constructor
   * @param {object}
   *            $textarea
   * @param {object}
   *            options
   */

  var EmojiArea_Plain = function($textarea, id, options) {
    this.options = options;
    this.$textarea = $textarea;
    this.$editor = $textarea;
    this.id = id;
    this.setup();
  };

  EmojiArea_Plain.prototype.insert = function(emoji) {
    if (!$.emojiarea.icons.hasOwnProperty(emoji))
      return;
    util.insertAtCursor(emoji, this.$textarea[0]);
    /*
     * MODIFICATION: Following line was added by Igor Zhukov, in order to
     * save recent emojis
     */
    util.emojiInserted(emoji, this.menu);
    this.$textarea.trigger('change');
  };

  EmojiArea_Plain.prototype.val = function() {
    if (this.$textarea == '\n')
      return '';
    return this.$textarea.val();
  };

  util.extend(EmojiArea_Plain.prototype, EmojiArea.prototype);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * Editor (rich)
   *
   * @constructor
   * @param {object}
   *            $textarea
   * @param {object}
   *            options
   */

  var EmojiArea_WYSIWYG = function($textarea, id, options) {
    var self = this;

    this.options = options || {};
    if ($($textarea).attr('data-emoji-input') === 'unicode')
      this.options.inputMethod = 'unicode';
    else
      this.options.inputMethod = 'image';
    this.id = id;
    this.$textarea = $textarea;
    this.emojiPopup = options.emojiPopup;
    this.$editor = $('<div id="emoji-wysiwyg">').addClass('emoji-wysiwyg-editor').addClass($($textarea)[0].className);
    this.$editor.data('self', this);

    if ($textarea.attr('maxlength')) {
      this.$editor.attr('maxlength', $textarea.attr('maxlength'));
    }
    this.$editor.height($textarea.outerHeight()); //auto adjust height
    this.emojiPopup.appendUnicodeAsImageToElement(this.$editor, $textarea.val());

    this.$editor.attr({
      'data-id': id,
      'data-type': 'input',
      'placeholder': $textarea.attr('placeholder'),
      'contenteditable': 'true',
    });

    /*
     * ! MODIFICATION START Following code was modified by Igor Zhukov, in
     * order to improve rich text paste
     */
    var changeEvents = 'blur change';
    if (!this.options.norealTime) {
      changeEvents += ' keyup';
    }
    this.$editor.on(changeEvents, function(e) {
      return self.onChange.apply(self, [ e ]);
    });
    /* ! MODIFICATION END */

    this.$editor.on('mousedown focus', function() {
      document.execCommand('enableObjectResizing', false, false);
    });
    this.$editor.on('blur', function() {
      document.execCommand('enableObjectResizing', true, true);
    });

    var editorDiv = this.$editor;
    this.$editor.on("change keydown keyup resize scroll", function(e) {
      if(MAX_LENGTH_ALLOWED_KEYS.indexOf(e.which) == -1 &&
        !((e.ctrlKey || e.metaKey) && e.which == 65) && // Ctrl + A
        !((e.ctrlKey || e.metaKey) && e.which == 67) && // Ctrl + C
        editorDiv.text().length + editorDiv.find('img').length >= editorDiv.attr('maxlength'))
      {
        e.preventDefault();
      }
      self.updateBodyPadding(editorDiv);
    });

    this.$editor.on("paste", function (e) {
      e.preventDefault();
      var content;
      var charsRemaining = editorDiv.attr('maxlength') - (editorDiv.text().length + editorDiv.find('img').length);
      if ((e.originalEvent || e).clipboardData) {
        content = (e.originalEvent || e).clipboardData.getData('text/plain');
        if (self.options.onPaste) {
          content = self.options.onPaste(content);
        }
        if (charsRemaining < content.length) {
          content = content.substring(0, charsRemaining);
        }
        document.execCommand('insertText', false, content);
      }
      else if (window.clipboardData) {
        content = window.clipboardData.getData('Text');
        if (self.options.onPaste) {
          content = self.options.onPaste(content);
        }
        if (charsRemaining < content.length) {
          content = content.substring(0, charsRemaining);
        }
        document.selection.createRange().pasteHTML(content);
      }
      editorDiv.scrollTop(editorDiv[0].scrollHeight);
    });

    // $textarea.after("<i class='emoji-picker-icon emoji-picker " + this.options.popupButtonClasses + "' data-id='" + id + "' data-type='picker'></i>");

    $textarea.hide().after(this.$editor);
    this.setup();

    /*
     * MODIFICATION: Following line was modified by Igor Zhukov, in order to
     * improve emoji insert behaviour
     */
    $(document.body).on('mousedown', function() {
      if (self.hasFocus) {
        self.selection = util.saveSelection();
      }
    });
  };

  EmojiArea_WYSIWYG.prototype.updateBodyPadding = function(target) {
    var emojiPicker = $('[data-id=' + this.id + '][data-type=picker]');
    if ($(target).hasScrollbar()) {
      if (!(emojiPicker.hasClass('parent-has-scroll')))
        emojiPicker.addClass('parent-has-scroll');
      if (!($(target).hasClass('parent-has-scroll')))
        $(target).addClass('parent-has-scroll');
    } else {
      if ((emojiPicker.hasClass('parent-has-scroll')))
        emojiPicker.removeClass('parent-has-scroll');
      if (($(target).hasClass('parent-has-scroll')))
        $(target).removeClass('parent-has-scroll');
    }
  };

  EmojiArea_WYSIWYG.prototype.onChange = function(e) {
    var event = new CustomEvent('input', { bubbles: true });
    this.$textarea.val(this.val())[0].dispatchEvent(event);
  };

  EmojiArea_WYSIWYG.prototype.insert = function(emoji) {
    var content;
    /*
     * MODIFICATION: Following line was modified by Andre Staltz, to use new
     * implementation of createIcon function.
     */
    var insertionContent = '';
    if (this.options.inputMethod == 'unicode') {
      insertionContent = this.emojiPopup.colonToUnicode(emoji);
    } else {
      var $img = $(EmojiArea.createIcon($.emojiarea.icons[emoji]));
      if ($img[0].attachEvent) {
        $img[0].attachEvent('onresizestart', function(e) {
          e.returnValue = false;
        }, false);
      }
      insertionContent = $img[0];
    }

    this.$editor.trigger('focus');
    if (this.selection) {
      util.restoreSelection(this.selection);
    }
    try {
      util.replaceSelection(insertionContent);
    } catch (e) {
    }

    /*
     * MODIFICATION: Following line was added by Igor Zhukov, in order to
     * save recent emojis
     */
    util.emojiInserted(emoji, this.menu);

    this.onChange();
  };

  EmojiArea_WYSIWYG.prototype.val = function() {
    var lines = [];
    var line = [];
    var emojiPopup = this.emojiPopup;

    var flush = function() {
      lines.push(line.join(''));
      line = [];
    };

    var sanitizeNode = function(node) {
      if (node.nodeType === TEXT_NODE) {
        line.push(node.nodeValue);
      } else if (node.nodeType === ELEMENT_NODE) {
        var tagName = node.tagName.toLowerCase();
        var isBlock = TAGS_BLOCK.indexOf(tagName) !== -1;

        if (isBlock && line.length)
          flush();

        if (tagName === 'img') {
          var alt = node.getAttribute('alt') || '';
          if (alt) {
              line.push(alt);
          }
          return;
        } else if (tagName === 'br') {
          flush();
        }

        var children = node.childNodes;
        for (var i = 0; i < children.length; i++) {
           sanitizeNode(children[i]);
        }

        if (isBlock && line.length)
          flush();
      }
    };

    var children = this.$editor[0].childNodes;
    for (var i = 0; i < children.length; i++) {
      sanitizeNode(children[i]);
    }

    if (line.length)
      flush();

    var returnValue = lines.join('\n');
    return emojiPopup.colonToUnicode(returnValue);
  };

  util.extend(EmojiArea_WYSIWYG.prototype, EmojiArea.prototype);

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  jQuery.fn.hasScrollbar = function() {
    var scrollHeight = this.get(0).scrollHeight;

    //safari's scrollHeight includes padding
    //if ($.browser.safari)
//      scrollHeight -= parseInt(this.css('padding-top')) + parseInt(this.css('padding-bottom'));
    if (this.outerHeight() < scrollHeight)
      return true;
    else
      return false;
  }

  /**
   * Emoji Dropdown Menu
   *
   * @constructor
   * @param {object}
   *            emojiarea
   */
  var EmojiMenu = function(emojiarea) {
    var self = this;
    self.id = emojiarea.id;
    var $body = $(document.body);
    var $window = $(window);

    this.visible = false;
    this.emojiarea = emojiarea;
    EmojiMenu.menuZIndex = 5000;
    this.$menu = $('<div>');
    this.$menu.addClass('emoji-menu');
    this.$menu.attr('data-id', self.id);
    this.$menu.attr('data-type', 'menu');
    this.$menu.hide();

    this.$itemsTailWrap = $('<div class="emoji-items-wrap1"></div>')
        .appendTo(this.$menu);
    this.$categoryTabs = $(
        '<table class="emoji-menu-tabs"><tr>'
            + '<td><a class="emoji-menu-tab icon-recent" ></a></td>'
            + '<td><a class="emoji-menu-tab icon-smile" ></a></td>'
            + '<td><a class="emoji-menu-tab icon-flower"></a></td>'
            + '<td><a class="emoji-menu-tab icon-bell"></a></td>'
            + '<td><a class="emoji-menu-tab icon-car"></a></td>'
            + '<td><a class="emoji-menu-tab icon-grid"></a></td>'
            + '</tr></table>').appendTo(this.$itemsTailWrap);
    this.$itemsWrap = $(
        '<div class="emoji-items-wrap mobile_scrollable_wrap"></div>')
        .appendTo(this.$itemsTailWrap);
    this.$items = $('<div class="emoji-items">').appendTo(
        this.$itemsWrap);

    this.emojiarea.$editor.after(this.$menu)

    $body.on('keydown', function(e) {
      if (e.keyCode === KEY_ESC || e.keyCode === KEY_TAB) {
        self.hide();
      }
    });

    /*
     * ! MODIFICATION: Following 3 lines were added by Igor Zhukov, in order
     * to hide menu on message submit with keyboard
     */
    $body.on('message_send', function(e) {
      self.hide();
    });

    $body.on('mouseup', function(e) {
      e = e.originalEvent || e;
      var target = e.target || window;

      if ($(target).hasClass(self.emojiarea.$dontHideOnClick)) {
        return;
      }

      while (target && target != window) {
        target = target.parentNode;
        if (target == self.$menu[0] || self.emojiarea
            && target == self.emojiarea.$button[0]) {
          return;
        }
      }
      self.hide();
    });

    this.$menu.on('mouseup', 'a', function(e) {
      e.stopPropagation();
      return false;
    });

    this.$menu.on('click', 'a', function(e) {

      self.emojiarea.updateBodyPadding(self.emojiarea.$editor);
      if ($(this).hasClass('emoji-menu-tab')) {
        if (self.getTabIndex(this) !== self.currentCategory) {
          self.selectCategory(self.getTabIndex(this));
        }
        return false;
      }

      var emoji = $('.label', $(this)).text();
      window.setTimeout(function() {
        self.onItemSelected(emoji);
        if (e.ctrlKey || e.metaKey) {
          self.hide();
        }
      }, 0);
      e.stopPropagation();
      return false;
    });

    this.selectCategory(0);
  };

  /*
   * ! MODIFICATION START Following code was added by Andre Staltz, to
   * implement category selection.
   */
  EmojiMenu.prototype.getTabIndex = function(tab) {
    return this.$categoryTabs.find('.emoji-menu-tab').index(tab);
  };

  EmojiMenu.prototype.selectCategory = function(category) {
    var self = this;
    this.$categoryTabs.find('.emoji-menu-tab').each(function(index) {
      if (index === category) {
        this.className += '-selected';
      } else {
        this.className = this.className.replace('-selected', '');
      }
    });
    this.currentCategory = category;
    this.load(category);
  };
  /* ! MODIFICATION END */

  EmojiMenu.prototype.onItemSelected = function(emoji) {
    if(this.emojiarea.$editor.text().length + this.emojiarea.$editor.find('img').length >= this.emojiarea.$editor.attr('maxlength'))
    {
      return;
    }
    this.emojiarea.insert(emoji);
  };

  /*
   * MODIFICATION: The following function argument was modified by Andre
   * Staltz, in order to load only icons from a category. Also function was
   * modified by Igor Zhukov in order to display recent emojis from
   * localStorage
   */
  EmojiMenu.prototype.load = function(category) {
    var html = [];
    var options = $.emojiarea.icons;
    var path = $.emojiarea.assetsPath;
    var self = this;
    if (path.length && path.charAt(path.length - 1) !== '/') {
      path += '/';
    }

    /*
     * ! MODIFICATION: Following function was added by Igor Zhukov, in order
     * to add scrollbars to EmojiMenu
     */
    var updateItems = function() {
      self.$items.html(html.join(''));
    }

    if (category > 0) {
      for ( var key in options) {
        /*
         * MODIFICATION: The following 2 lines were modified by Andre
         * Staltz, in order to load only icons from the specified
         * category.
         */
        if (options.hasOwnProperty(key)
            && options[key][0] === (category - 1)) {
          html.push('<a href="javascript:void(0)" title="'
              + util.htmlEntities(key) + '">'
              + EmojiArea.createIcon(options[key], true)
              + '<span class="label">' + util.htmlEntities(key)
              + '</span></a>');
        }
      }
      updateItems();
    } else {
      ConfigStorage.get('emojis_recent', function(curEmojis) {
        curEmojis = curEmojis || defaultRecentEmojis || [];
        var key, i;
        for (i = 0; i < curEmojis.length; i++) {
          key = curEmojis[i]
          if (options[key]) {
            html.push('<a href="javascript:void(0)" title="'
                + util.htmlEntities(key) + '">'
                + EmojiArea.createIcon(options[key], true)
                + '<span class="label">'
                + util.htmlEntities(key) + '</span></a>');
          }
        }
        updateItems();
      });
    }
  };

  EmojiMenu.prototype.hide = function(callback) {
    this.visible = false;
    this.$menu.hide("fast");
  };

  EmojiMenu.prototype.show = function(emojiarea) {
    /*
     * MODIFICATION: Following line was modified by Igor Zhukov, in order to
     * improve EmojiMenu behaviour
     */
    if (this.visible)
      return this.hide();
    $(this.$menu).css('z-index', ++EmojiMenu.menuZIndex);
    this.$menu.show("fast");
    /*
     * MODIFICATION: Following 3 lines were added by Igor Zhukov, in order
     * to update EmojiMenu contents
     */
    if (!this.currentCategory) {
      this.load(0);
    }
    this.visible = true;
  };

})(jQuery, window, document);


////////////////////////////////////////////////////////////////////////
// Generated by CoffeeScript 1.12.5
(function() {
  this.EmojiPicker = (function() {
    function EmojiPicker(options) {
      var ref, ref1;
      if (options == null) {
        options = {};
      }
      $.emojiarea.iconSize = (ref = options.iconSize) != null ? ref : 25;
      $.emojiarea.assetsPath = (ref1 = options.assetsPath) != null ? ref1 : '';
      this.generateEmojiIconSets(options);
      if (!options.emojiable_selector) {
        options.emojiable_selector = '[data-emojiable=true]';
      }
      this.options = options;
    }

    EmojiPicker.prototype.discover = function() {
      var isiOS;
      isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isiOS) {
        return;
      }
      return $(this.options.emojiable_selector).emojiarea($.extend({
        emojiPopup: this,
        norealTime: true
      }, this.options));
    };

    EmojiPicker.prototype.generateEmojiIconSets = function(options) {
      var column, dataItem, hex, i, icons, j, name, reverseIcons, row, totalColumns;
      icons = {};
      reverseIcons = {};
      i = void 0;
      j = void 0;
      hex = void 0;
      name = void 0;
      dataItem = void 0;
      row = void 0;
      column = void 0;
      totalColumns = void 0;
      j = 0;
      while (j < Config.EmojiCategories.length) {
        totalColumns = Config.EmojiCategorySpritesheetDimens[j][1];
        i = 0;
        while (i < Config.EmojiCategories[j].length) {
          dataItem = Config.Emoji[Config.EmojiCategories[j][i]];
          name = dataItem[1][0];
          row = Math.floor(i / totalColumns);
          column = i % totalColumns;
          icons[':' + name + ':'] = [j, row, column, ':' + name + ':'];
          reverseIcons[name] = dataItem[0];
          i++;
        }
        j++;
      }
      $.emojiarea.icons = icons;
      return $.emojiarea.reverseIcons = reverseIcons;
    };

    EmojiPicker.prototype.colonToUnicode = function(input) {
      if (!input) {
        return '';
      }
      if (!Config.rx_colons) {
        Config.init_unified();
      }
      return input.replace(Config.rx_colons, function(m) {
        var val;
        val = Config.mapcolon[m];
        if (val) {
          return val+' ';
        } else {
          return ' ';
        }
      });
    };

    EmojiPicker.prototype.appendUnicodeAsImageToElement = function(element, input) {
      var k, len, split_on_unicode, text, val;
      if (!input) {
        return ' ';
      }
      if (!Config.rx_codes) {
        Config.init_unified();
      }
      split_on_unicode = input.split(Config.rx_codes);
      for (k = 0, len = split_on_unicode.length; k < len; k++) {
        text = split_on_unicode[k];
        val = '';
        if (Config.rx_codes.test(text)) {
          val = Config.reversemap[text];
          if (val) {
            val = ':' + val + ':';
            val = $.emojiarea.createIcon($.emojiarea.icons[val]);
          }
        } else {
          val = document.createTextNode(text);
        }
        element.append(val);
      }
      return input.replace(Config.rx_codes, function(m) {
        var $img;
        val = Config.reversemap[m];
        if (val) {
          val = ':' + val + ':';
          $img = $.emojiarea.createIcon($.emojiarea.icons[val]);
          return $img;
        } else {
          return '';
        }
      });
    };

    EmojiPicker.prototype.colonToImage = function(input) {
      if (!input) {
        return '';
      }
      if (!Config.rx_colons) {
        Config.init_unified();
      }
      return input.replace(Config.rx_colons, function(m) {
        var $img;
        if (m) {
          $img = $.emojiarea.createIcon($.emojiarea.icons[m]);
          return $img;
        } else {
          return '';
        }
      });
    };

    return EmojiPicker;

  })();

}).call(this);


////////////////////////////////////////////////////////////////////////

const SUCCESS = 1;
const FAILED = 0;
const ALREADY_REGISTERED = 2;

var _this = this;
var SERVER = "",
    xm_username = "",
    xm_password = "",
    auth_credential_get_url,
    connection;

var adminUser = "";
var agent_offline = 0;
var chat_loged_in = false;
var general_url = "https://support.orisys.in";
var random_key = "8KubZT4uFbPiI0kS";
var isFirstMessage = 1;
var hasInitiatedChat = 0;
var cmpny_id = 0;

var default_settings = {

            bosh_service_url: undefined,        // required
            host:undefined,                     // required
            chat_credntials_from_external:true, // optional ---- true means chat login credentials from external api
            auth_credential_get_url:undefined,  // optional ---- but required when 'chat_credntials_from_external == true'
            admin_user:undefined,               // optional ---- but undefined adminuser will generate error.
            external_msg_store : false,         // optional ---- if it is false means message stored in sessionStorage otherwise store in external db via post api
            external_msg_store_url:undefined,   // required when only 'external_msg_store == true' ------- which is the api to store messages to external storage (db)
            external_msg_get_url:undefined,     // required when only 'external_msg_store == true' ------- which is the api to get messages from external storage (db)
            auto_login:false,                   // optional ---- login with static credential
            reg_id:undefined,                // required when 'auto_login == true'
            rname:undefined,                 // required when 'auto_login == true'
            agent_name:undefined,
            tid:undefined,
            emoticons:true                     // use emoticons in app

        };

var connected = 5 ;
var disconnected = 4 ;
var count = 0;

 var chat_loged_in = sessionStorage.getItem('chat_loged_in')
 var count = sessionStorage.getItem('count');

 if(isNaN(count)){
    count = 0;
 }

var livXmppConnection = new function()
{
	this.initialize = function(settings)
  {
    this.setupInitialSettings(settings);
    this.initializeView();

	},
  this.setupInitialSettings = function(settings)
  {
    // its the starting point of our widget
    if(settings.bosh_service_url)
    {
      default_settings.bosh_service_url = settings.bosh_service_url;                   // connection url for xmpp
    }
    if(settings.host)
    {
      default_settings.host = settings.host;
    }
    if(settings.auth_credential_get_url)
    {
      // credential url
      default_settings.auth_credential_get_url = settings.auth_credential_get_url;
    }
    if(settings.chat_credntials_from_external)
    {
      default_settings.chat_credntials_from_external = settings.chat_credntials_from_external;
    }
    if(settings.admin_user)
    {
      default_settings.admin_user = _this.getJIDFromName(settings.admin_user);
      default_settings.admin = settings.admin_user;
      sessionStorage.setItem('xm_admin', default_settings.admin_user);
    }
    if(settings.external_msg_store != null)
    {
      default_settings.external_msg_store = settings.external_msg_store;
    }
    if(settings.external_msg_store_url)
    {
      default_settings.external_msg_store_url = settings.external_msg_store_url;
    }
    if(settings.external_msg_get_url)
    {
      default_settings.external_msg_get_url = settings.external_msg_get_url;
    }
    if(settings.auto_login)
    {
      default_settings.auto_login = settings.auto_login;
    }
    if(settings.reg_id)
    {
      default_settings.reg_id = settings.reg_id;
    }
    if(settings.rname)
    {
      default_settings.rname = settings.rname;
    }
    if(settings.agent_name)
    {
      default_settings.agent_name = settings.agent_name;
    }
    if(settings.tid)
    {
      default_settings.tid = settings.tid;
      sessionStorage.setItem('thread_id',default_settings.tid);
    }
    if(settings.emoticons != null)
    {
      default_settings.emoticons = settings.emoticons;
    }
  },
  this.initializeView = function()
  {
    if(sessionStorage.getItem('loged_in_user')){
      xm_username =  sessionStorage.getItem('xm_login_username');   // if already loged in then fetching username and password from session storage and connecting server
      xm_password =  sessionStorage.getItem('xm_login_password');
      if(!xm_username || typeof xm_username === 'undefined' || !xm_password || typeof xm_password === 'undefined')
      {
          views.liveChatStartBoxView();
          return;
      }
      sessionStorage.setItem('xm_username',xm_username);
      sessionStorage.setItem('xm_password',xm_password);
      orisys_xmpp_connect.ConnectServer();
    }
    else if(default_settings.auto_login){
      //alert(default_settings.rname);
      // alert(default_settings.reg_id);
      if(!default_settings.reg_id || typeof default_settings.reg_id === 'undefined' || !default_settings.rname || typeof default_settings.rname === 'undefined')
      {
        views.liveChatStartBoxView();
        return;
      }
      xm_username =  default_settings.reg_id;  // if already loged in then fetching username and password from session storage and connecting server
      xm_password =  default_settings.rname;
      var agent_username_db = default_settings.admin;
      var agent_name_db = default_settings.agent_name;
      sessionStorage.setItem('agent_name_db',agent_name_db);
      sessionStorage.setItem('agent_username_db',agent_username_db);
      sessionStorage.setItem('xm_username',xm_username);
      sessionStorage.setItem('xm_password',xm_password);
      $.ajax({
        type: "POST",
        dataType: "json",
        url  : general_url+"/get_customer_details",
        data: "cust_id="+xm_username,
        success: function(result){
          sessionStorage.setItem('xm_email',result.cust_email);
          sessionStorage.setItem('xm_mobile_no',result.cust_no);
        }
      });

      orisys_xmpp_connect.ConnectServer();
    }
    else if((connected == Strophe.Status.CONNECTED) && _this.chat_loged_in)      // checking the connection status and loged in status
    {
      xm_username =  sessionStorage.getItem('xm_username');   // if already loged in then fetching username and password from session storage and connecting server
      xm_password =  sessionStorage.getItem('xm_password');

      if(!xm_username || typeof xm_username === 'undefined' || !xm_password || typeof xm_password === 'undefined')
      {
        views.liveChatStartBoxView();
        return;
      }
      orisys_xmpp_connect.ConnectServer();
    }
    else
    {
      views.liveChatStartBoxView();
    }
  };
};

var views = new function()
{
  this.liveChatStartBoxView = function()
  {
    // starting view switch to login form
    /* document.body.innerHTML = '<div id="livr_xm_chat" class="livr_xm_chat_00"><label>Live chat with us now!</label></div>';*/
    document.getElementById("chat_widget").innerHTML = '<div id="livr_xm_chat" class="livr_xm_chat_00"><label>Live chat with us now!</label></div>';

    $(document).on('click','#livr_xm_chat',function()
    {
      // console.log("clicked");
      // document.getElementById("livr_xm_chat").remove();
      $("#livr_xm_chat").remove();
      views.loginView();
    });
  },

  this.loginView = function()
  {
    // login view
    document.getElementById("chat_widget").innerHTML = '<div id="live-chat">\
                                                          <header class="clearfix">\
                                                              <h4>Login to chat with us</h4>\
                                                          </header>\
                                                          <div class="chat">\
                                                              <div class="chat-history chat-login">\
                                                                  <div id="liv_xm_chat" > \
                                                                      <input type="text" placeholder="Your Name" id="xm_name" ></input>\
                                                                      <input type="text" placeholder="Your Email" id="xm_email"></input>\
                                                                      <input type="text" placeholder="Your Mobile" id="mobile" maxlength="15"> \                                                                      </br> \
                                                                      <button type="submit" id="xm_login" class="btn btn-block btn-warning">Login</button>\
								                                                      <div class="chat-footer text-center">Chat powered by <a href="http://oricoms.com/" target="_blank">OriCoMS</a></div>\
                                                                  </div>\
                                                              </div>\
                                                          </div>\
                                                        </div>';

                                $("#mobile").intlTelInput(
                                {
                                  separateDialCode: true,
                                  utilsScript: general_url+"/chatwidget/tel/utils.js"
                                });
  },

    this.startChatWindow = function()
    {
      var agent_name = sessionStorage.getItem('agent_name_db');
      // chat window for chatting
      var el = document.getElementById("liv_xm_chat");
      if(el)
      {
        // el.remove();                                  // if previous login view is visible then remove it from view
        $("#liv_xm_chat").remove();
      }
      var user = _this.getName(sessionStorage.getItem("xm_admin"));
      if(!user)
      {
       user = _this.getName(default_settings.admin_user);
      }

        document.getElementById("chat_widget").innerHTML = '<div id="live-chat">\
                                        <header class="clearfix">\
                                            <h4>'+agent_name.toUpperCase()+'</h4>\
                                            <button type="submit" id="xm_chat_close" class="ml-auto">End Chat</button> \
                                            <img class="xm_chat_minimize_button" style="border-style:none;" src="'+general_url+'/chatwidget/img/chat_minimize.png" alt="Minimize" title="Minimize" height="">\
                                            </header>\
                                        <div class="chat">\
                                            <div class="chat-history chat-history-padding" id="xm_history">\
                                                <div class="chat-message clearfix chat-bubble-after">\
                                                    <div class="chat-message-content clearfix content_DP_after">\
                                                        <h5>'+agent_name.toUpperCase()+'</h5>\
                                                        <p class="">Welcome to OriCoMS, How can I help you?</p>\
                                                        <input type="hidden" id="onMessageId" value=""> \
                                                    </div> <!-- end chat-message-content -->\
                                                </div> <!-- end chat-message -->\
                                            </div> <!-- end chat-history -->\
                                            <div class="typing-notification"></div>\
                                            <div class="agent-offline chat-history-padding">\
                                              <span class="agent-offline-message"></span>\
                                            </div>\
                                            <div class="file-upload-progress-div chat-history-padding" style="display:none;">\
                                              <div class="clearfix file-upload-progress-subdiv">\
                                                <span class="upload_label"><b><i class="fa fa-spinner fa-spin" style="font-size:18px"></i> Uploading </b></span>\
                                                <span class="file-upload-name"></span>\
                                                <br><span class="file-upload-message"></span>\
                                              </div>\
                                            </div>\
                                            <div class="error-div chat-history-padding" style="display:none;">\
                                              <div class="clearfix error-subdiv">\
                                                <span class="warning_label"><b><i class="fa fa-exclamation-triangle" style="font-size:18px"></i></b></span>\
                                                <span class="warning_message"></span>\
                                              </div>\
                                            </div>\
                                            <fieldset>\
                                                <textarea type="text" id="xm_input_message" placeholder="Type your message" onpaste="xmInputMessageOnpaste()" autofocus ></textarea> \
                                                <input type="hidden">\
                                                <button type="submit" id="xm_send"><img id="xm_send_image_button" style="border-style:none; "src="'+general_url+'/chatwidget/img/send_btn.png" alt="Send" title="Send" width="30" height="">\
                                                </button>\
												<div id="file_upload_div" style="display:none;">\
													<label for="file-upload" class="custom-file-upload" title="Upload">\
													<i class="fa fa-paperclip"></i>\
													</label>\
													<input id="file-upload" type="file" onchange="uploadFile(event)" data-toggle="popover" data-placement="left" data-content="V123"/>\
													<div id="file_error"></div>\
												</div>\
                                            </fieldset>\
                                        </div> \
                                    </div>';
	    var cmpny_plan_id = sessionStorage.getItem("cmpny_plan_id");
		if(cmpny_plan_id==3 || cmpny_plan_id==4)
		{
			$("#file_upload_div").show();
		}
		
         // emojiSetting.initEmoji();
/*
<label for="file-upload" class="custom-file-upload">\
<i class="fa fa-paperclip"></i>\
</label>\
<input id="file-upload" type="file" onchange="uploadFile(event)" multiple/>\
<div id="file_error"></div>\
*/

        var my_id = _this.getName(orisys_xmpp_connect.getJID());

        getMessageHistory.checkStorageType(my_id,user);

        setTimeout(function(){

                var timeout=null;
                $('#live-chat #xm_input_message').on("keyup",function(){
                    if(timeout){
                        clearTimeout(timeout);
                    }else{
                        connection.chatstates.sendComposing(sessionStorage.xm_admin,"chat");
                    }
                timeout=setTimeout(function(){
                  connection.chatstates.sendPaused(sessionStorage.xm_admin,"chat");
                    timeout=null;
                },900);
                });

        },500);

    },
    //newly added by author for sending composing or not
    this.loadSpinner = function(){
        // spinner loaded when try to login
        $('#live-chat').append('<div class="overlay">\
                                    <div class="loader"></div>\
                                <div>');
    },


    this.removeSpinner = function(){
        var el = $('.overlay');
        if(el){
            // el.remove();
            $('.overlay').remove();
        }
    },


    this.appendNewSendMessage = function(message_body,time,id){

        // appending new send message or send message from client side to the chat history window
        var msg_split = message_body.split("|");
        // console.log("msg split : "+ msg_split[0]+ " and "+msg_split[1]+ " and "+msg_split[2]);
        if(msg_split[0]=="Sending")
        {
          var doc_savedname=msg_split[1];
          var doc_originalname=msg_split[2];
          var ab = general_url+"/uploads/chat_documents/"+doc_savedname;
          message_body = 'User has sent the file - <a target="_blank" href="'+ab+'">'+doc_originalname+'</a>';
        }
        var time = _this.getTime(time);

        if(id !=null){
        var newMessage = $('<div class="chat-message clearfix chat-bubble-before" id="'+id+'">\
                                    <div class="chat-message-content clearfix content_DP_before">\
                                        <span class="chat-time">'+time+'</span>\
                                        <h5>ME</h5>\
                                        <p class="">'+message_body+'</p>\
                                    </div> <!-- end chat-message-content -->\
                            </div> <!-- end chat-message -->');
        }else{
        var newMessage = $('<div class="chat-message clearfix chat-bubble-before">\
                                    <div class="chat-message-content clearfix content_DP_before">\
                                        <span class="chat-time">'+time+'</span>\
                                        <h5>ME</h5>\
                                        <p class="">'+message_body+'</p>\
                                    </div> <!-- end chat-message-content -->\
                            </div> <!-- end chat-message -->');
        }
        $('.chat-history').append(newMessage);
        var objDiv = document.getElementById("xm_history");         // scroll to bottom
        objDiv.scrollTop = objDiv.scrollHeight;

    },

    this.appendNewRecieveMessage = function(message_body,time){

        // appending new received message to the chat history window
        var msg_split = message_body.split("|");
        var agent_name = sessionStorage.getItem('agent_name_db');

        var time = _this.getTime(time);

        var user = _this.getName(sessionStorage.getItem("xm_admin"));
        if(!user){
             user = _this.getName(default_settings.admin_user);
        }
        if(msg_split[0]=="Sending")
        {
          var doc_savedname=msg_split[1];
          var doc_originalname=msg_split[2];
          var ab = general_url+"/uploads/chat_documents/"+doc_savedname;
          message_body = 'Agent has sent the file - <a target="_blank" href="'+ab+'">'+doc_originalname+'</a>';
        }
        var newMessage = $('<div class="chat-message clearfix chat-bubble-after">\
                                    <div class="chat-message-content clearfix content_DP_after">\
                                        <span class="chat-time">'+time+'</span>\
                                        <h5>'+agent_name.toUpperCase()+'</h5>\
                                        <p class="">'+message_body+'</p>\
                                    </div> <!-- end chat-message-content -->\
                            </div> <!-- end chat-message -->');
        $('.chat-history').append(newMessage);
        var objDiv = document.getElementById("xm_history");
        objDiv.scrollTop = objDiv.scrollHeight;                     // scroll to bottom
    },
    this.getBubble = function(id){
      return $('#'+id);
    }


}



var storeMessageHistory = new function(){

    this.checkStorageType = function(from,to,body,time,id,msg_src){

        if(!from || !to || !body || !time){
            return;
        }

        if(default_settings.external_msg_store)
        {
          // console.log("externalDBStore");
            this.externalDBStore(from,to,body,time,id,msg_src);
        }
        else
        {
          // console.log("sessionMessageStore");
            this.sessionMessageStore(from,to,body,time,id,msg_src);
        }

    },

    this.sessionMessageStore = function(from,to,body,time,id,msg_src){

        this.saveMessageInSessionStorage(from,to,body,time,id,msg_src);

    },
    this.externalDBStore = function(from,to,body,time,id,msg_src){

        this.httpPostExternalDbStorage(from,to,body,time,id,msg_src);
    },

    this.saveMessageInSessionStorage = function(from,to,body,time,id,msg_src){

        // saving message in sessionStorage. This will keep the messages for the logined session

        if(isNaN(count)){
            count = 0;
        }

        if(!count){
            count = 0;
        }

        count = parseInt(count) + parseInt("1");            // this is auto increment number
        sessionStorage.setItem('count', count);
        var messageId = 'msg'+count;                        // auto incremented 'count' appended to string 'msg' to get key for storing each message in sessionStorage

        sessionStorage.setItem(messageId,JSON.stringify({
            'from':from,
            'body':body,
            'time':time,
            'id':id,
        }));
    },

    this.httpPostExternalDbStorage = function(from,to,body,time,id,msg_src){

        if(!default_settings.external_msg_store_url){
            return;
        }
        var data = new FormData();
        data.append('authentication_key',random_key);
        data.append('from',from);
        data.append('to',to);
        console.log("from: "+from+" and to: "+to);
        data.append('body',body);
        data.append('time',time);
        // console.log("from: to: body: time: "+from+ " "+ to+" "+body+" "+time);
        var threadId = sessionStorage.getItem('thread_id');
		var cmpny_id = sessionStorage.getItem('cmpny_id');
        // console.log("send message thread id: "+ threadId);
        if(!threadId)
        {
          threadId=0;
        }
		console.log("msg_src: "+msg_src);
		if(msg_src != "OUTGOING")
		{
			msg_src = "INCOMING";
		}
		
        $.ajax({
    			type: "POST",
          dataType: "json",
    			url  : general_url+"/api/send_message",
    			data: "thread_id="+encodeURIComponent(threadId)+"&client_id="+encodeURIComponent(from)+"&agent_id="+to+"&message="+body+"&isFirstMessage="+isFirstMessage+"&cmpny_id="+cmpny_id+"&msg_src="+msg_src,
    			success: function(result){
            // console.log("result : "+result.chat_time);
            isFirstMessage=0;
            hasInitiatedChat=1;
            // console.log("hasInitiatedChat : "+hasInitiatedChat);
            var d1 = result.chat_time;
            var d1_split =  d1.split(' ');
            var d1_date_split = d1_split[0].split('-');
            var d1_time_split = d1_split[1].split(':');
            var new_d1 = new Date(d1_date_split[0],d1_date_split[1]-1,d1_date_split[2],d1_time_split[0],d1_time_split[1],d1_time_split[2]);
            sessionStorage.setItem('response_latest_chat_time',new_d1);
            // console.log("result : "+result.length);
            // sessionStorage.setItem('thread_id',result.thread_id);
            // $('#xm_chat_close').css('display','block');
    			}
    		});

        _this.httpPost(default_settings.external_msg_store_url,data);
    },
    this.messageStatusDeliverd=function(msg_id,status){
        if(!default_settings.external_msg_store_url){
            return;
        }
        //do db update for received messages
    }
}

var getMessageHistory = new function(){

    this.checkStorageType = function(from,to){

        if(default_settings.external_msg_store)
        {
            this.getMessageHistoryFromExternalDb(from,to);
        }
        else
        {
            this.getMessageHistoryFromSession(from);
        }
    },
    this.getMessageHistoryFromSession = function(from){

        this.setSessionMessages(from);
    },
    this.getMessageHistoryFromExternalDb = function(from,to){

        this.setExternalDbMessages(from,to);
    },

    this.setSessionMessages = function(from){

        // setting the session message to chat history when reloading the view

        if(isNaN(count)){
            count = 0;
        }

        if(count>0){
            for(i = 1; i<=count; i++){
                var messageId = 'msg'+i;
                var sessionMessage = sessionStorage.getItem(messageId);
                var parsedMessage = JSON.parse(sessionMessage);

                if(parsedMessage.from == from){
                    views.appendNewSendMessage(parsedMessage.body,parsedMessage.time,parsedMessage.id);   // appending message to chat history
                    if(parsedMessage.received){
                        views.getBubble(parsedMessage.id).addClass('msg_received');
                    }   // appending message to chat history
                    // appending message to chat history
                }else{
                    views.appendNewRecieveMessage(parsedMessage.body,parsedMessage.time); // appending message to chat history
                }
            }
            var objDiv = document.getElementById("xm_history");                 // scrolling the chat to bottom ---- focus to last message in chat history
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    },
    this.setExternalDbMessages = function(from,to){
        if(typeof from === 'undefined' || typeof to === 'undefined' || !from || !to){
            return ;
        }

        if(!default_settings.external_msg_get_url || typeof default_settings.external_msg_get_url === 'undefined'){
            return ;
        }
        var data = new FormData();
        data.append('from',from);
        data.append('to',to);

        var xhr = _this.httpPost(default_settings.external_msg_get_url,data);

        xhr.onreadystatechange = function() {//Call a function when the state changes.
            if(xhr.readyState == 4 && xhr.status == 200)
            {
                var response = xhr.responseText;
                if(response){
                    if(typeof response === 'string'){
                        response = JSON.parse(response);
                    }
                    if(response.status == SUCCESS){
                        this.externalMessageParsing(response,from);
                    }
                }
            }
        }


    },

    this.externalMessageParsing = function(response,from){
        if(response.messages){
            var messages_array = response.messages;
            for(i=0; i<messages_array ; i++){
                var message = messages_array[i];
                if(message.from == from){                                           // checking the message belongs to which user
                    views.appendNewSendMessage(message.body,message.time);   // appending message to chat history
                }else{
                    views.appendNewRecieveMessage(message.body,message.time); // appending message to chat history
                }
            }
        }

    }
}




var orisys_xmpp_connect = new function()
{
  var this_obj = this;
  this.ConnectServer = function()
  {
    if(!default_settings.bosh_service_url || typeof default_settings.bosh_service_url === 'undefined')
    {
      return;
    }
    // trying to connect the server with user name and password  and also added a handler to handle the connection status
    connection = new Strophe.Connection(default_settings.bosh_service_url);
    connection.rawInput = this.rawInput;
    connection.rawOutput = this.rawOutput;
    this.login(xm_username,xm_password)
  },
  this.login = function(xm_username,xm_password)
  {
    if(!xm_username || typeof xm_username === 'undefined' || !xm_password || typeof xm_password === 'undefined'){
      return;
    }
    if(!default_settings.host || typeof default_settings.host === 'undefined'){
      return;
    }
    var jid = _this.getJIDFromName(xm_username);
    connection.connect(jid, xm_password, this.onConnect);
  },

  this.onConnect = function(status)
  {
    // this is the handler for on connect
    if (status == Strophe.Status.CONNECTING) {
        //this_obj.log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
        onClickListernsForLogin.responseFailed('Sorry!. Failed to establish connection');
        //this_obj.log('Strophe failed to connect.');
    } else if (status == Strophe.Status.DISCONNECTING) {
        //this_obj.log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
        //this_obj.log('Strophe is disconnected.');
    } else if (status == Strophe.Status.CONNECTED) {
        //this_obj.log('Strophe is connected.');
        this_obj.onConnected();
    }
  },
  this.onConnected = function()
  {
    // update chat_login_time of assigned agent
    var agent_username = sessionStorage.getItem('agent_username_db');
	var cmpny_id = sessionStorage.getItem('cmpny_id');
    // alert("on connected "+agent_chat_name);die;
    $.ajax({
      type: "POST",
      dataType: "json",
      url  : general_url+"/api/update_chat_time",
      data: "agent_username="+agent_username+"&cmpny_id="+cmpny_id,
      success: function(result){
        //console.log(result.status);
      }
    });
    sessionStorage.setItem('response_latest_chat_time',new Date());
    sessionStorage.setItem('chat_loged_in', true);              // session storage holdin loged in status as true
    _this.chat_loged_in = true;
    connection.addHandler(this.onMessage, null, 'message', "chat", null,  null, {matchBare: true} );        // this is message handler for the new receiving message

    this.addRoster();                                                                                  // adding the roster (admin)
    this.sendPresence();
    this.send_ping(this.getDomainName());
    this.getRosters();
    views.startChatWindow();
  },
  this.onMessage = function(msgXML)
  {
   // this is the handler for the received meesages
   var message_id=msgXML.getAttribute('id');
   var oldMessageId=$("#onMessageId").val();
   var to = msgXML.getAttribute('to');
   var from = msgXML.getAttribute('from');
   var fromBareJid = Strophe.getBareJidFromJid(from);
   var type = msgXML.getAttribute('type');
   var elems = msgXML.getElementsByTagName('body');
   var body = elems[0];
   var text = Strophe.getText(body);
   var msg_src = 'INCOMING';

   this_obj.sendPresence();                                           // send presence to admin user as subscribed
   if(text)
   {                                                       // checking the message body null or not
    var audio = new Audio(general_url+'/chatwidget/sounds/msg_received.mp3');        // audio tune for new message
    var time = new Date();
    var to_id = _this.getName(this_obj.getJID());
    var from_id = _this.getName(fromBareJid);
	
    // storeMessageHistory.checkStorageType(from_id,to_id,text,time);    // saving message
    // views.appendNewRecieveMessage(text,time);              // appending received mesage to chat history
    if(fromBareJid==sessionStorage.getItem("xm_admin"))
    {
      if(oldMessageId=="")
      {
        audio.play();
        storeMessageHistory.checkStorageType(from_id,to_id,text,time,msg_src);
        views.appendNewRecieveMessage(text,time);
        oldMessageId=$("#onMessageId").val(message_id);
      }
      else
      {
        oldMessageId=$("#onMessageId").val();
        // console.log("message_id: "+message_id+" oldMessageId: "+oldMessageId );
        if(oldMessageId!=message_id)
        {
          audio.play();
          storeMessageHistory.checkStorageType(from_id,to_id,text,time,msg_src);
          // console.log("not equal");
          views.appendNewRecieveMessage(text,time);
          oldMessageId=$("#onMessageId").val(message_id);
        }
      }
    }
   }
   return true;
  },

    this.send_ping = function(to)
    {
      // sending ping to the xmpp
      var ping = $iq({
      to: to,
      type: 'get',
      id: 'ping1'}).c('ping', {xmlns: 'urn:xmpp:ping'});
      connection.send(ping);
    },
    this.getDomainName = function()
    {
      //returning domain of the connection
      return Strophe.getDomainFromJid(connection.jid);
    },

    this.getJID = function(){

        //returning loged in user jabber id
        return connection.jid;
    },


    this.getRosters = function(){

        // getting the rosters of the loged in user

        iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
        connection.sendIQ(iq, this.rosterCallBack);
    },


    this.rosterCallBack = function(iq){

      // this is a roster call back function when requesting rosters

      $(iq).find('item').each(function(){
        var jid = $(this).attr('jid'); // The jabber_id of your contact
        // You can probably put them in a unordered list and and use their jids as ids.
      });
      connection.addHandler(orisys_xmpp_connect.onPresence, null, "presence"); // handler to recieve other users presence. thats presence handler
      connection.send($pres());                             // sending presence to the all roster contacts
    },


    this.onPresence = function(presence)
    {
      var presence_type = $(presence).attr('type'); // unavailable, subscribed, etc...

      var user = sessionStorage.getItem("xm_admin");
      if(!user)
      {
       user = default_settings.admin_user;
  	  }
      var from = $(presence).attr('from'); // the jabber_id of the contact

      if (presence_type != 'error')
      {
        if (presence_type === 'unavailable')
        {
          // Mark contact as offline
          if( _this.getName(user) ==  _this.getName(from))
          {
            $('.agent-offline-message').html('Agent is offline.');
            $(".agent-offline").css("display","block");
          	if($('#live-chat h4').hasClass('special'))
            {
          		$('#live-chat h4').removeClass('special');
              $('#live-chat h4').addClass('special2');
          	}
		      }
        }
        else
        {
          var show = $(presence).find("show").text(); // this is what gives away, dnd, etc.
          if (show === 'chat' || show === '')
          {
            // Mark contact as online
  		      if( _this.getName(user) ==  _this.getName(from))
            {
              $(".agent-offline-message").html("");
              $(".agent-offline").css("display","none");
              $('#live-chat h4').removeClass('special2');
              agent_offline=1;
              // console.log("agent_offline : "+agent_offline);
        			if(!$('#live-chat h4').hasClass('special'))
              {
        				$('#live-chat h4').addClass('special');
        			}
              $("#emoji-wysiwyg").css("display","block");
    		    }
            // else
            // {
            //   agent_offline=2;
            //   $('#live-chat h4').addClass('special2');
            //   $(".agent-offline-message").html("Agent is offline.Please leave your message and the agent will respond via email.");
            //   $(".agent-offline").css("display","block");
            // }
            // var maxCustCount = sessionStorage.getItem('isMaxCustCount');
            // if(maxCustCount==1)
            // {
            //   console.log("Max customer count: "+maxCustCount);
            //   agent_offline=0;
            // }
            // else {
            //   console.log("Max customer count: "+maxCustCount);
            // }
            if(agent_offline!=1)
            {
				var cmpny_plan_id = sessionStorage.getItem('cmpny_plan_id');
				if(cmpny_plan_id==3 || cmpny_plan_id==4)
				{
					$('#live-chat h4').addClass('special2');
					$(".agent-offline-message").html("Agent is offline.Please leave your message in the form and will get back to you soon.");
				}
				else
				{
					$('#live-chat h4').addClass('special2');
					$(".agent-offline-message").html("Agent is offline.");
				}
              
              // $(".agent-offline").css("display","block");
              // if(maxCustCount==1)
              // {
              //   $(".agent-offline-message").html("You are in queue.");
              // }
              // else
              // {
              //   $(".agent-offline-message").html("Agdfhuewuon.");
              // }

              $("#emoji-wysiwyg").css("display","none");
            }

            setTimeout(function()
            {
              // console.log("agent_offline3 : "+agent_offline);
              if(agent_offline!=1)
              {
				var cmpny_plan_id = sessionStorage.getItem('cmpny_plan_id');
				if(cmpny_plan_id==3 || cmpny_plan_id==4)
				{
					// console.log("settimeout2....agent_offline : "+agent_offline);
					$('#live-chat h4').addClass('special2');
					$(".agent-offline-message").html("Agent is offline.Please leave your message in the form and will get back to you soon.");
					$(".agent-offline").css("display","block");
					$("#emoji-wysiwyg").css("display","none");

					// document.getElementById("live-chat").remove();
					
					$('#live-chat').remove();
					document.getElementById("chat_widget").innerHTML = '<div id="live-chat">\
                                                    <header class="clearfix">\
                                                      <h4>Leave a message</h4>\
                                                      <button type="submit" id="xm_close_window" class="ml-auto" style="display:none;">Close</button> \
                                                    </header>\
                                                    <div class="chat">\
                                                        <div class="chat-history">\
                                                            <div id="liv_feedback" style="color:black"> \
                                                                <span><b>Agent is not available at the moment. Please leave a message\
                                                                      and our agent will get back to you soon.</b><br>\
                                                                </span><br> \
                                                                <div> \
                                                                    <input type="text" placeholder="Subject" id="xm_subject" autocomplete="on"> <br>\
                                                                    <textarea type="text" id ="xm_offline_query" placeholder="Message" style="width:234px;" ></textarea><br> \
                                                                </div>\
                                                                <div style="margin-top:5px;text-align:center;"> \
                                                                  <button type="submit" id="xm_submit_query" class="btn btn-block btn-success">Submit</button><br> \
                                                                  <span id="submit_query_error" style="color:red;"></span> \
                                                                </div> \
                                                                <div id="ticket-ref-div" style="display:none;"><b> \
                                                                   <span></span></b> \
                                                                </div> \
                                                            </div>\
                                                        </div>\
                                                    </div>\
                                            </div>';
				}
				else
				{
					$('#live-chat h4').addClass('special2');
					$(".agent-offline-message").html("Agent is offline.");
					//$(".agent-offline").css("display","block");
					//$("#emoji-wysiwyg").css("display","none");
				}
              }
              else {
                $('#live-chat h4').addClass('special');
              }
              // orisys_xmpp_connect.disconnect();
            },3000);
          }
          else
          {
              $(".agent-offline-message").html("Agent is unavailable...");
              $(".agent-offline").css("display","block");
              if($('#live-chat h4').hasClass('special'))
              {
        				$('#live-chat h4').removeClass('special');
        			}
              $('#live-chat h4').addClass('special2');
          }
        }
      }
      return true;
    },

    $(document).on('click',"#xm_submit_query",function()
    {
        var subject = $("#xm_subject").val();
        var query = $("#xm_offline_query").val();
        if(subject=="")
        {
          $("#submit_query_error").html("Enter subject");
        }
        else if(query=="")
        {
          $("#submit_query_error").html("Enter query");
        }
        else
        {
          updateChatCount();
          $("#submit_query_error").html("");
          var customer_email = sessionStorage.getItem('xm_email');
          var thread_id = sessionStorage.getItem('thread_id');
          var customer_phone_no = sessionStorage.getItem('xm_mobile_no');
          var mobile_country_code = sessionStorage.getItem('xm_mobile_country_code');
          var agent_username = sessionStorage.getItem('agent_username_db');
		  var cmpny_id = sessionStorage.getItem('cmpny_id');
		  var authentication_key = random_key;

          $.ajax({
            type: "POST",
            dataType: "json",
            url  : general_url+"/api/save_ticket",
            data: "subject="+subject+"&query="+query+"&customer_email="+customer_email+"&mobile_country_code="+mobile_country_code+"&customer_phone_no="+customer_phone_no+"&agent_username="+agent_username+"&thread_id="+thread_id+"&cmpny_id="+cmpny_id+"&authentication_key="+authentication_key,
            success: function(result){
              $("#ticket-ref-div").css("display","block");
              $("#xm_close_window").css("display","block");
              $("#xm_subject").val("");
              $("#xm_offline_query").val("");
              if(result.status==3)
              {
                $("#ticket-ref-div span").html("You have already submitted the message. Please try after sometime.");
              }
              else
              {
                $("#ticket-ref-div span").html('TicketID: <span id="ref-id"></span> has been generated for your message. Please note the TicketID for future reference.</span>');
                $("#ref-id").html(result.ticket_id);
                $("#xm_submit_query").attr("disabled","disabled");
                $("#xm_subject").prop("disabled",true);
                $("#xm_offline_query").prop("disabled",true);
                orisys_xmpp_connect.disconnect();
                // sessionStorage.clear();
              }
            }
          });
        }
    });

    $(document).on('click',"#xm_close_window",function()
    {
      sessionStorage.clear();
       orisys_xmpp_connect.disconnect();
      // document.getElementById("live-chat").remove();
      $("#live-chat").remove();
      document.getElementById("chat_widget").innerHTML = '<div id="livr_xm_chat" class="livr_xm_chat_00"><label>Live chat with us now!</label></div>';
    });

    this.addRoster = function()
    {
      // adding a admin user to the logged in user

      // var user = _this.getName(sessionStorage.getItem("xm_admin"));
      //      if(!user){
      //           user = _this.getName(default_settings.admin_user);
      //      }
       var subscribe = $pres({to: sessionStorage.xm_admin , type: "subscribe"});
       connection.send(subscribe);
    },

    this.sendMessage = function(){


        // var message_body = document.getElementsByClassName("emoji-wysiwyg-editor")[0].textContent;
        var message_body = document.getElementById("xm_input_message").value;
		var msg_src = "OUTGOING";
        message_body = message_body.trim();
        if(message_body.length === 0){

            return;
        }
        var msg=$msg({
                 "to":sessionStorage.xm_admin,
                 "type":"chat"})
            .c("body")
            .t(message_body);                                                   // message body

          var id=connection.receipts.sendMessage(msg); //send xmpp request along with message
        // connection.send(msg);                                                   // send xmpp message


        document.getElementById("xm_input_message").value="";

        var time = new Date();                                                  // calculating current time
        var my_id = _this.getName(this.getJID());
        var to_id = _this.getName(sessionStorage.xm_admin);
        sessionStorage.setItem('my_id', my_id);
        sessionStorage.setItem('to_id', to_id);
        // storeMessageHistory.checkStorageType(my_id,to_id,message_body,time);    // saving message
        // views.appendNewSendMessage(message_body,time);                          // appending message to message history
        storeMessageHistory.checkStorageType(my_id,to_id,message_body,time,id,msg_src);    // saving message
        views.appendNewSendMessage(message_body,time,id);


    },

    this.sendPresence = function()
    {
      // console.log("send presence : "+sessionStorage.xm_admin);
      // send presence to xmpp server and to the admin user conncted with client
      connection.send($pres({
         to: sessionStorage.xm_admin,
         type: "subscribed"
      }));
    },

    this.disconnect = function(){

        // when disconnecting the connection
        connection.disconnect();
        sessionStorage.setItem('chat_loged_in', false);
        _this.chat_loged_in = false;

    },

    this.log = function(msg)
    {
        // console.log(msg);
    },

    this.rawInput = function(data)
    {
        //this_obj.log('RECV: ' + data);
    },

    this.rawOutput = function(data)
    {
        //this_obj.log('SENT: ' + data);
    }


}



var emojiSetting = new function(){


    this.initEmoji = function(){

        $(function()
            {
                // Initializes and creates emoji set from sprite sheet
                window.emojiPicker = new EmojiPicker({
                  emojiable_selector: '[data-emojiable=true]',
                  assetsPath: './lib/img/',
                  popupButtonClasses: 'fa fa-smile-o'
                });
                // Finds all elements with `emojiable_selector` and converts them to rich emoji input fields
                // You may want to delay this step if you have dynamically created input fields that appear later in the loading process
                // It can be called as many times as necessary; previously converted input fields will not be converted again
                window.emojiPicker.discover();

                if(!default_settings.emoticons)
                {
                        var ell = document.getElementsByClassName('emoji-picker-icon')[0];
                        if(ell){
                            ell.remove();
                        }
                }
            });

            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
              })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
              ga('create', 'UA-49610253-3', 'auto');
              ga('send', 'pageview');

    }
}


var onClickListernsForLogin = new function()
{
  var this_objc = this;
  this.loginButtonClick = function()
  {
    $(document).on('click',"#xm_login",function()
    {
      // getting login credentials from external api
      var xm_input_name =  document.getElementById("xm_name").value.trim();
      var xm_input_email =  document.getElementById("xm_email").value.trim();
      var xm_mobile_countryData = $("#mobile").intlTelInput("getSelectedCountryData");
      var xm_intl_number_with_code = $("#mobile").intlTelInput("getNumber");
      var xm_mobile_number = $("#mobile").val();

      var country_code = xm_mobile_countryData.dialCode;
      if(country_code == null || country_code == undefined || country_code == '')
      {
         country_code = '';
      }
      else if(country_code != '')
      {
         country_code = '+'+country_code;
      }

      var boolean = this_objc.validateLoginForm(xm_input_name,xm_input_email,xm_mobile_number);
      if(!boolean){
        return;
      }
      if(!default_settings.auth_credential_get_url || typeof default_settings.auth_credential_get_url === 'undefined'){
        return;
      }

      views.loadSpinner();      // loading the spinner

      var formData = new FormData();
      formData.append('authentication_key',random_key);
      formData.append('first_name',xm_input_name);
      formData.append('email',xm_input_email);
      formData.append('country_code',country_code);
      formData.append('mobile_number',xm_mobile_number);

      sessionStorage.setItem('xm_firstName', xm_input_name);
      sessionStorage.setItem('xm_email', xm_input_email);
      sessionStorage.setItem('xm_mobile_no', xm_mobile_number);
      sessionStorage.setItem('xm_mobile_country_code',country_code);

      var xhr = _this.httpPost(default_settings.auth_credential_get_url,formData);
      xhr.onreadystatechange = function()
      {//Call a function when the state changes.
        if(xhr.readyState == 4 && xhr.status == 200)
        {
          var response = xhr.responseText;
          if(response)
          {
            this_objc.parseCredentialResponse(response);
          }
        }
        else if(xhr.readyState == 4 && xhr.status != 200)
        {
            this_objc.responseFailed('Sorry! Something went wrong. Please try again.');
        }
      }
    });
  },
  this.validateLoginForm = function(xm_input_name,xm_input_email,xm_mobile_number)
  {
    if($("#xm_name").hasClass("error")){
      $("#xm_name").removeClass("error");
      $("#xm_name_error").remove();
    }
    if($("#xm_email").hasClass("error")){
      $("#xm_email").removeClass("error");
      $("#xm_email_error").remove();
    }
    if($("#mobile").hasClass("error")){
      $("#mobile").removeClass("error");
      $("#xm_mobile_error").remove();
    }

    var el = $('#xm_mobile_error');
    if(el)
    {
      // el.remove();
      $("#xm_mobile_error").remove();
    }

    if(!xm_input_name)
    {
      $("#xm_name").addClass("error");
      $("#xm_name").after("<span class='error' id='xm_name_error'>Please enter your name</span>");
      return false;
    }

    if(xm_input_name.length>40)
    {
      $("#xm_name").addClass("error");
      $("#xm_name").after("<span class='error' id='xm_name_error'>Name field is limited to 40 characters.</span>");
      return false;
    }

    if(!xm_input_email || !this_objc.validateEmail(xm_input_email))
    {
      $("#xm_email").addClass("error");
      $("#xm_email").after("<span class='error' id='xm_email_error'>Please enter valid email</span>");
      return false;
    }

    if(!xm_mobile_number || !this_objc.validMobile(xm_mobile_number))
    {
      $("#mobile").addClass("error");
      $("#mobile").after("<span class='error' id='xm_mobile_error'>Please enter valid mobile number</span>");
      return false;
    }
    return true;
  },
  this.parseCredentialResponse = function(response)
  {
    if(typeof response === 'string')
    {
      response = JSON.parse(response);
    }
    if(response)
    {
      if(response.status == SUCCESS || response.status == ALREADY_REGISTERED)
      {
        if(!response.reg_id)
        {
          this_objc.responseFailed('Sorry!. Failed to establish connection');
          return;
        }
        if(!response.name)
        {
          this_objc.responseFailed('Sorry!. Failed to establish connection');
          return ;
        }
        if(response.admin)
        {
          default_settings.admin_user = _this.getJIDFromName(response.admin);
          sessionStorage.setItem('xm_admin', _this.getJIDFromName(response.admin));
        }
        if(response.host)
        {
          default_settings.host = response.host;
        }

        var userName = response.reg_id;
        var paswrd = response.name;
        var threadId = response.thread_id;
        var agent_username_db = response.admin;
        var agent_name_db = response.agent_name;
        var agent_image_db = response.agent_image;
		var cmpny_id = response.cmpny_id;
		var agent_id = response.agent_id;
		var cmpny_plan_id = response.cmpny_plan;
		sessionStorage.setItem('cmpny_plan_id',cmpny_plan_id);
		sessionStorage.setItem('agent_id',agent_id);
		sessionStorage.setItem('cmpny_id',cmpny_id);
		//console.log("Company id: "+sessionStorage.getItem('cmpny_id'));
        sessionStorage.setItem('agent_image_db',agent_image_db);
        sessionStorage.setItem('agent_name_db',agent_name_db);
        sessionStorage.setItem('agent_username_db',agent_username_db);
        // console.log("thread id: "+threadId);
        sessionStorage.setItem('thread_id',threadId);
        sessionStorage.setItem('xm_username', userName);
        sessionStorage.setItem('xm_password', paswrd);
        this_objc.startConnection(userName,paswrd);
      }
      else
      {
        this_objc.responseFailed('Sorry!. Failed to establish connection');
      }
    }
    else
    {
      this_objc.responseFailed('Sorry!. Failed to establish connection');
    }
  },
  this.responseFailed = function(message)
  {
    views.removeSpinner();
    var el = $('#xm_mobile_error');
    if(el){
      // el.remove();
      $("#xm_mobile_error").remove();
    }
    $("#xm_login").after("<span class='error' id='xm_mobile_error'>"+message+"</span>");
  },
  this.startConnection = function(xm_username,xm_password)
  {
    _this.xm_username = xm_username;
    _this.xm_password = xm_password;

    sessionStorage.setItem('xm_username', xm_username);
    sessionStorage.setItem('xm_password', xm_password);
    orisys_xmpp_connect.ConnectServer();             // try to connect with server
  },
  this.validMobile = function(number)
  {
    var reg = /^[0-9]{9,13}$/
    if (reg.test(number))
    {
      return true;
    }
    else
    {
      return false;
    }

    // if(number.length < 9 || number.length > 13)
    // {
    //   return false;
    // }
    // else
    // {
    //   return true;
    // }
  },
  this.validateEmail = function(emailField)
  {
    var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    if (reg.test(emailField))
    {
      return true;
    }
    else
    {
      return false;
    }
  },

  this.loginWithEnterKey = function()
  {
    $(document).on('keyup', function(event)
    {
      if (event.which == 13)
      {
        if(!event.shiftKey)
        {
          if(!_this.loged_in)
          {
            if($('#xm_login'))
            {
              $('#xm_login').click();
            }
          }
          event.preventDefault();
        }
      }
    });
  }
  this.loginButtonClick();
  this.loginWithEnterKey();
}


var messageSendButtonClick = new function(){

    $(document).on('click','#xm_send', function() {

        // onClick listner for sending the messages

        // var newMessage = document.getElementsByClassName("emoji-wysiwyg-editor")[0].textContent;
        var newMessage = document.getElementById("xm_input_message").value;

        if(!newMessage || newMessage.length < 1){
            return;
        }
        else if(newMessage.length > 100)
        {
          $(".error-div").css("display","block");
          $('.warning_message').html("Content has reached beyond the limit. Maximum 100 characters allowed.");
          setTimeout(function(){
            // $("#xm_input_message").val('');
            $(".error-div").css("display","none");
          },2000);
          return;
        }
        else
        {
          // console.log("session value: "+sessionStorage.getItem('isMaxCustCount'));
            orisys_xmpp_connect.sendMessage();
        }

    });


    $(document).on('keyup','#xm_input_message', function(event) {
        if (event.which == 13) {
            if(!event.shiftKey){
                $('#xm_send').click();
                event.preventDefault();
            }
        }
    });

    /* $(document).on('keyup','.emoji-wysiwyg-editor', function(event) {
        if (event.which == 13) {
            if(!event.shiftKey){
                $('#xm_send').click();
                event.preventDefault();
            }
        }
    });*/

}

function xmInputMessageOnpaste()
{
  var messageContent="";
  setTimeout(function ()
  {
    messageContent = $("#xm_input_message").val();
    console.log("messageContent: "+messageContent);
    if(messageContent.length >100)
    {
      $(".error-div").css("display","block");
      $('.warning_message').html("Content has reached beyond the limit. Maximum 100 characters allowed.");
      setTimeout(function(){
        //$("#xm_input_message").val('');
        $(".error-div").css("display","none");
      },2000);
    }
    else
    {
      $(".error-div").css("display","none");
    }
  },100);
}

var chatWindowCloseAction = new function(){
    $(document).on('click','#live-chat header', function(e) {
		if($(e.target).attr('id')=="xm_chat_close")
		{	
			updateChatCount();
			var cmpny_plan_id = sessionStorage.getItem('cmpny_plan_id');
			if(cmpny_plan_id==2)
			{
				document.getElementById("chat_widget").innerHTML = '<div id="live-chat">\
                                          <header class="clearfix">\
                                              <h4></h4>\
                                          </header>\
                                          <div class="chat">\
                                              <div class="chat-history">\
                                                  <div id="liv_close"> \
                                                      <span style="font-size:18px;">Thank you for chatting us.<span><br><br> \
                                                      <div> \
                                                         <button type="submit" id="xm_close">Close</button> \
                                                       </div> \
                                                  </div>\
                                              </div>\
                                          </div>\
                                  </div>';
			}
			else if(cmpny_plan_id==3 || cmpny_plan_id==4)
			{
				var authentication_key = random_key;
				var cmpny_id = sessionStorage.getItem('cmpny_id');
				var type=5;
				var isRating=0;
				var isComment=0;
				var questionsLength=0;
				var questions = [];
				
				$.ajax({
				  type: "POST",
				  dataType: "json",
				  async : false,
				  url  : general_url+"/api/feedback_api",
				  data: "authentication_key="+authentication_key+"&type="+type+"&company_id="+cmpny_id,
				  success: function(result){
					if(result.status==1)
					{
					  isRating=result.is_rating;
					  isComment=result.is_comment;
					  questionsLength=result.questions.length;
					  questions = result.questions;
                      //console.log("ql : "+questionsLength+" and q : "+questions);
					}
					else {
					  isRating=0;
					  isComment=0;
					  questionsLength=0;
					}
				  }
				});
				
				document.getElementById("chat_widget").innerHTML =
				'<div id="live-chat">\
					<header class="clearfix">\
						<h4>Feedback</h4>\
					</header>\
					<div class="chat">\
						<div class="chat-history">\
							<div id="liv_feedback" style="color:black"> \
								<span>Thank you for the chat.<span><br> \
								<div id="isComment"></div> \
								<div id="fbQuestions"></div> \
								<div id="isRating"></div> \
								<div> \
									<div><label><input type="checkbox" name="send_chat_transcript" value="1"> Send chat conversation via email.</label></div> \
									<div class="row" style="text-align:center;"> \
										 <div class="col-6"><button type="submit" id="xm_submit" class="btn btn-block btn-warning">Submit</button></div>\
										 <div class="col-6"><button type="submit" id="xm_skip" class="btn btn-default btn-block">Skip</button></div>\
									</div> \
								</div> \
							</div>\
						</div>\
					</div>\
				</div>';
				
				if(isComment==1)
				{ 
					document.getElementById("isComment").innerHTML ='<p><b>Leave any additional feedback </b></p> \
					 <textarea type="text" id ="xm_addtl_feedback" placeholder="Additional feedback" style="width:234px;" ></textarea> \
					 <br>';
				}
				else 
				{
					document.getElementById("isComment").innerHTML ='';
				}
				
				if(isRating==1)
				{
					document.getElementById("isRating").innerHTML ='<div><b>Rate our service </b></div> \
					<div class="row">\
						<div class="col-6">\
							<label><input type="radio" name="service_rating" checked="yes" value="5"> Excellent</label> \
						</div>\
						<div class="col-6">\
							<label><input type="radio" name="service_rating" value="4"> Good</label> \
						</div>\
						<div class="col-6">\
							<label><input type="radio" name="service_rating" value="3"> Average</label>  \
						</div>\
						<div class="col-6">\
							<label><input type="radio" name="service_rating" value="2"> Bad</label>  \
						</div>\
						<div class="col-6">\
							<label><input type="radio" name="service_rating" value="1"> Too Bad</label>  \
						</div>\
					</div> ';
				}
				else 
				{
					document.getElementById("isRating").innerHTML ='';
				}
				
				if(questionsLength>0)
				{
					jQuery.each(questions,function(key,value)
					{
						var fbqhtml="";
						fbqhtml+='<div><b>'+value['eng_questions'].questions+'</b></div>';
						fbqhtml+='<div class="row">';
						if(value['eng_questions'].option1!=null)
						{
							fbqhtml+='<div class="col-md-6">\
								<label><input type="radio" name="questions['+value['eng_questions'].id+']" qid='+value['id']+' class="questions" checked="yes" value="'+value['eng_questions'].option1+'"> '+value['eng_questions'].option1+'</label> \
							</div>';
						}
						
						if(value['eng_questions'].option2!=null)
						{
							fbqhtml+='<div class="col-md-6">\
								<label><input type="radio" name="questions['+value['eng_questions'].id+']" qid='+value['id']+' class="questions" value="'+value['eng_questions'].option2+'"> '+value['eng_questions'].option2+'</label> \
							</div>';
						}
						
						
						if(value['eng_questions'].option3!=null)
						{
							fbqhtml+='<div class="col-6">\
								<label><input type="radio" name="questions['+value['eng_questions'].id+']" qid='+value['id']+' class="questions" value="'+value['eng_questions'].option3+'"> '+value['eng_questions'].option3+'</label> \
							</div>';
						}
						
						if(value['eng_questions'].option4!=null)
						{
							fbqhtml+='<div class="col-6">\
								<label><input type="radio" name="questions['+value['eng_questions'].id+']" qid='+value['id']+' value="'+value['eng_questions'].option4+'"> '+value['eng_questions'].option4+'</label> \
							</div>';
						}
					   
						if(value['eng_questions'].option5!=null)
						{
							fbqhtml+='<div class="col-6">\
								<label><input type="radio" name="questions['+value['eng_questions'].id+']" qid='+value['id']+' value="'+value['eng_questions'].option5+'"> '+value['eng_questions'].option5+'</label> \
							</div>';
						}
			   
						if(value['eng_questions'].option6!=null)
						{
							fbqhtml+='<div class="col-6">\
								<label><input type="radio" name="questions['+value['eng_questions'].id+']" qid='+value['id']+' value="'+value['eng_questions'].option6+'"> '+value['eng_questions'].option6+'</label> \
							</div>';
						}
						fbqhtml+='</div>';
						$("#fbQuestions").append(fbqhtml);
					});
				}
				else
				{
					document.getElementById("fbQuestions").innerHTML ='';
				}
			}   
			orisys_xmpp_connect.disconnect();
		}
		else
		{
			$('.chat').slideToggle(300, 'swing');
			$('.chat-message-counter').fadeToggle(300, 'swing');
		}
    });

    $(document).on('click',"#xm_submit",function()
    {
        console.log("isComment: "+isComment);
      var thread_id=sessionStorage.getItem('thread_id');
      var additional_rating = $("#xm_addtl_feedback").val();
      var service_rating = $("input[name='service_rating']:checked").val();
      var send_chat_transcript = $("input[name='send_chat_transcript']:checked").val();
      var q_arr = [];
      var q_new_arr = [];
      $("input[type=radio]:checked").each(function(){
      	rdbtnname = $(this).attr('name');
        qid = $(this).attr('qid');
        rdbtnval = $(this).val();
        //console.log("rdbtnname: "+rdbtnname+", qid: "+qid+" and rdbtnval: "+rdbtnval);
        if(rdbtnname.startsWith("questions["+qid+"]"))
        {
          q_arr.push({id:qid,answer:rdbtnval});
        }
      });
      q_new_arr= JSON.stringify(q_arr);
      // $.ajax({
      //   type: "POST",
      //   url  : general_url+"/submit_chat_feedback",
      //   data: "thread_id="+encodeURIComponent(thread_id)+"&additional_rating="+additional_rating+"&service_rating="+service_rating,
      //   success: function(msg){
      //     sendChatTranscript(send_chat_transcript);
      //   }
      // });
      var authentication_key = random_key;
      var customer_id = sessionStorage.getItem('xm_username');
      var thread_id = sessionStorage.getItem('thread_id');
	  var cmpny_id = sessionStorage.getItem('cmpny_id');
	  var type = 5; //chat type
	  //console.log("customer id: "+customer_id);

      $.ajax({
        type: "POST",
        url  : general_url+"/api/feedback_insertion",
        data: "authentication_key="+authentication_key+"&comments="+additional_rating+"&rating="+service_rating+"&customer_id="+customer_id+"&thread_id="+thread_id+"&question_answers="+q_new_arr+"&company_id="+cmpny_id+"&type="+type,
        success: function(msg){
          var agent_username = sessionStorage.getItem('agent_username_db');
          var agent_id       = sessionStorage.getItem('agent_id');
          $.ajax({
            type: "POST",
            url  :  general_url+"/api/updatecreate_chatfb_count",
            data: "rating="+service_rating+"&agent_id="+agent_id+"&cmpny_id="+cmpny_id,
            success: function(msg){
            }
          });

          sendChatTranscript(send_chat_transcript);
        }
      });
      orisys_xmpp_connect.disconnect();

      document.getElementById("chat_widget").innerHTML = '<div id="live-chat">\
                                          <header class="clearfix">\
                                              <h4></h4>\
                                          </header>\
                                          <div class="chat">\
                                              <div class="chat-history">\
                                                  <div id="liv_close"> \
                                                      <span style="font-size:18px;">Thank you for your valuable feedback.<span><br><br> \
                                                      <div> \
                                                         <button type="submit" id="xm_close">Close</button> \
                                                       </div> \
                                                  </div>\
                                              </div>\
                                          </div>\
                                  </div>';
    });

    $(document).on('click',"#xm_skip",function()
    {
      var send_chat_transcript = $("input[name='send_chat_transcript']:checked").val();
      sendChatTranscript(send_chat_transcript);

      orisys_xmpp_connect.disconnect();
      // document.getElementById("live-chat").remove();
      $("#live-chat").remove();
      document.getElementById("chat_widget").innerHTML = '<div id="livr_xm_chat" class="livr_xm_chat_00"><label>Live chat with us now!</label></div>';
      sessionStorage.clear();
    });

    $(document).on('click',"#xm_close",function()
    {
      // document.getElementById("live-chat").remove();
      $("#live-chat").remove();
      document.getElementById("chat_widget").innerHTML = '<div id="livr_xm_chat" class="livr_xm_chat_00"><label>Live chat with us now!</label></div>';
      sessionStorage.clear();
    });
}

function updateChatCount()
{
  var agent_username = sessionStorage.getItem('agent_username_db');
  var cmpny_id = sessionStorage.getItem('cmpny_id');
  //console.log("hasInitiatedChat: "+hasInitiatedChat);
  if(hasInitiatedChat==1)
  {
    $.ajax({
      type: "POST",
      dataType: "json",
      url  : general_url+"/api/update_chat_count",
      data: "agent_username="+agent_username+"&cmpny_id="+cmpny_id,
      success: function(result){
        // console.log(result.status);
      }
    });
  }
}

function sendChatTranscript(id)
{
    if(id==1)
    {
        var thread_id = sessionStorage.getItem('thread_id');
        var customer_id = sessionStorage.getItem('xm_username');
        var agent_id = sessionStorage.getItem('agent_id');
		var cmpny_id = sessionStorage.getItem('cmpny_id');
        console.log(customer_id + " and " + agent_id + " and " + cmpny_id);

        var data = new FormData();
        data.append('customer_id',customer_id);
        data.append('agent_id',agent_id);
        data.append('cmpny_id',cmpny_id);
        data.append('thread_id',thread_id);

        $.ajax({
            url: general_url+'/api/chat_transcript',
            type: 'POST',
            data: data,
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            contentType: false, // Set content type to false as jQuery will tell the server its a query string request
            success: function(data)
            {
                console.log("id :"+data);
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
              // Handle errors here
              // console.log('ERRORS: ' + textStatus);
              // STOP LOADING SPINNER
             }
        });
    }
}

function uploadFile(event)
{
    var uploadflag=1;
    var errorMessage = "";
    $(".file-upload-progress-div").show();
    var maxfilesize = 2097152;
    var allowedFileTypes    = ['jpeg', 'jpg', 'png', 'pdf'];
    var documentName="";
    files   = event.target.files;
    if (files.length < 1)
    {
      uploadflag = 0;
      $("#file-error").html("<p>Please upload file.</p>");
      $(".upload_label").hide();
      $(".file-upload-message").html("Please upload file.");
      setTimeout(function(){
        $(".file-upload-progress-div").hide();
      },5000);
      return;
    }
    var file = files[0];
    var fileName = file.name;
    $(".file-upload-name").html(fileName);
    var data = new FormData();
    var errors = false;
    var fileExtensionStartIndex = fileName.lastIndexOf('.');
    do
    {
      if (fileExtensionStartIndex == -1)
      {
        uploadflag = 0;
        errorMessage = "This type of files are not allowed.";
        break;
      }
      var fileExtension = fileName.slice(fileExtensionStartIndex + 1);
      fileExtension     = fileExtension.toLowerCase();
      if (allowedFileTypes.indexOf(fileExtension) == -1)
      {
        uploadflag = 0;
        errorMessage = "This type of files are not allowed.";
        break;
      }
      if (file.size > maxfilesize)
      {
        uploadflag = 0;
        errorMessage = "File size is greater than 2MB";
        break;
      }
    }
    while(false);

    if (uploadflag == 0)
    {
      $("#file-error").html("<p>" + errorMessage + "</p>");
      $(".upload_label").hide();
      $(".file-upload-message").html(errorMessage);
      setTimeout(function(){
        $(".file-upload-progress-div").hide();
      },5000);

      return;
    }

    // if (errors)
    // {
    //   return;
    // }

    if(uploadflag==1)
    {
        data.append("file", file);
      $(".file-upload-progress-div").show();
      $(".file-upload-message").html("");
      $(".upload_label").show();
      $.ajax({
          url: general_url+'/api/chatfileupload',
          type: 'POST',
          data: data,
          cache: false,
          dataType: 'json',
          processData: false, // Don't process the files
          contentType: false, // Set content type to false as jQuery will tell the server its a query string request
          success: function(data)
          {
            // console.log("success part");
              errdata=data.error;
              if(jQuery.isEmptyObject(errdata))
              {
                // console.log("no errors");
                var savedFileName = data.success.savedFileName;
                var originalFileName  = data.success.originalFileName;
                var documentName="Sending|"+savedFileName+"|"+originalFileName;
				var msg_src = "OUTGOING";
                var msg=$msg({
                         "to":sessionStorage.xm_admin,
                         "type":"chat"})
                    .c("body")
                    .t(documentName);
                // connection.send(msg);
                var id=connection.receipts.sendMessage(msg);
                var time = new Date();
                var my_id=sessionStorage.getItem('my_id');
                var to_id=sessionStorage.getItem('to_id');
				
                console.log("upload success : "+my_id + " and "+to_id + " and "+msg_src);
                storeMessageHistory.checkStorageType(my_id,to_id,documentName,time,id,msg_src);    // saving message
                views.appendNewSendMessage(documentName,time,id);
                $(".file-upload-progress-div").hide();
              }
              else
              {
                $(".upload_label").hide();
                var message=data.error.message;
                var name=data.error.fileName;
                $(".file-upload-name").html(name);
                $(".file-upload-message").html(message);
                setTimeout(function(){
                  $(".file-upload-progress-div").hide();
                },5000);
                //Remove file from input on error so that uploading always shows the error even if the same file.
                event.target.value = "";
              }
          },
          error: function(jqXHR, textStatus, errorThrown)
          {
              // Handle errors here
              // console.log('ERRORS: ' + textStatus);
              // STOP LOADING SPINNER
          }
      });
    }
}

setInterval(function(){
  var session_check = sessionStorage.getItem('chat_loged_in');
  if(session_check)
  {
    var cur_date = new Date(); // 2018-07-05 12:45:44
    // var month = cur_date.getMonth()+1;
    // var mod_cur_date = new Date(cur_date.getFullYear() + "-"+month + "-" + cur_date.getDate() + " "
    //           + cur_date.getHours() + ":" +cur_date.getMinutes() + ":" + cur_date.getSeconds());
    var last_chat_message_date = sessionStorage.getItem("response_latest_chat_time");
    last_chat_message_date = new Date(last_chat_message_date);

    console.log("cur_date: "+cur_date);
    console.log("last__date: "+last_chat_message_date);
    var date_difference = cur_date.getTime() - last_chat_message_date.getTime();
    console.log("date_diff : "+date_difference);
    var min_reached = date_difference / 60000;
    min_reached = Math.ceil(min_reached);
    console.log("min_reached: "+min_reached);
    if(min_reached>=2)
    {
      // console.log("User was inactive for "+min_reached+" mins");
      updateChatCount();
      orisys_xmpp_connect.disconnect();
      sessionStorage.clear();
      document.getElementById("chat_widget").innerHTML = '<div id="live-chat">\
                                          <header class="clearfix">\
                                              <h4></h4>\
                                          </header>\
                                          <div class="chat">\
                                              <div class="chat-history">\
                                                  <div id="liv_close"> \
                                                      <span style="font-size:18px;">Your session has expired. Please start again.<span><br><br> \
                                                      <div> \
                                                         <button type="submit" id="xm_relogin">Start Live Chat</button> \
                                                       </div> \
                                                  </div>\
                                              </div>\
                                          </div>\
                                  </div>';
    }
    else
    {
      // console.log("active "+min_reached+" mins");
    }
  }
}, 120000);

$(document).on('click',"#xm_relogin",function(){
  // views.loginView();
  location.reload();
});

function checkTime(i) {
    // if time lessthan 10 , putting 0 before the time integer
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getTime(date) {

// returning current time as string like "hh:mm a"

  var today = date;
  if(typeof date === 'string') {
    today = new Date(date);
  }

  var h = today.getHours();
  var m = today.getMinutes();

  // add a zero in front of numbers<10
  m = checkTime(m);
  var time = '';

  if(h>12){
    var hour = parseInt(h) - parseInt(12);
    time = hour+':'+m+' PM'
  }
  else
  {


    if(h==12)
    {
        time = h+':'+m+' PM'
    }
    else
    {
        if(h==0 || h==00)
        {
            h=12;
        }
        time = h+':'+m+' AM'
    }
  }

  return time;
}


function getName(user){

    // returning admin name from admin jabber id

    if(user && typeof user === 'string'){
        if (user.indexOf('@') > -1)
        {
          var user_without_domain = user.split('@')[0];
          return  user_without_domain.charAt(0).toUpperCase() + user_without_domain.slice(1);
        }
        return user.charAt(0).toUpperCase() + user.slice(1);
    }

     if(user && typeof user === 'number'){
        user = user.toString();
        if (user.indexOf('@') > -1)
        {
          var user_without_domain = user.split('@')[0];
          return  user_without_domain.charAt(0).toUpperCase() + user_without_domain.slice(1);
        }
        return user.charAt(0).toUpperCase() + user.slice(1);
    }

    return user;


}


function getJIDFromName(user){



    if(user && typeof user === 'string'){
        if (user.indexOf('@') < 0)
        {
            return user+'@'+default_settings.host;
        }
    }
    if(user && typeof user === 'number'){
        user = user.toString();
        if (user.indexOf('@') < 0)
        {
            return user+'@'+default_settings.host;
        }
    }

    return user;
}


function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp;
}

function httpPost(theUrl,data)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", theUrl, true ); // false for synchronous request
    xmlHttp.send( data );
    return xmlHttp;
}


window.addEventListener("beforeunload", function (e) {
        //*********************************
        if(chat_loged_in){
            // When closing the tab we need to disconnect the connection.
         orisys_xmpp_connect.disconnect();
        }

});

/**
 * Chat state notifications (XEP 0085) plugin
 * @see http://xmpp.org/extensions/xep-0085.html
 */
Strophe.addConnectionPlugin('chatstates',
{
	init: function (connection)
	{
		this._connection = connection;

		Strophe.addNamespace('CHATSTATES', 'http://jabber.org/protocol/chatstates');
	},

	statusChanged: function (status)
	{
		if (status === Strophe.Status.CONNECTED
			|| status === Strophe.Status.ATTACHED)
		{
			this._connection.addHandler(this._notificationReceived.bind(this),
				Strophe.NS.CHATSTATES, "message");
		}
	},

	addActive: function(message)
	{
		return message.c('active', {xmlns: Strophe.NS.CHATSTATES}).up();
	},

	_notificationReceived: function(message)
	{
		if ($(message).find('error').length > 0)
			return true;

		var composing = $(message).find('composing'),
		paused = $(message).find('paused'),
		active = $(message).find('active'),
		inactive = $(message).find('inactive'),
		gone = $(message).find('gone'),
		jid = $(message).attr('from');
    var fromBareJid = Strophe.getBareJidFromJid($(message).attr('from'));
    // console.log(fromBareJid+" and "+sessionStorage.getItem("xm_admin"));
		if (composing.length > 0 && (fromBareJid==sessionStorage.getItem("xm_admin")))
		{
            $(".typing-notification").append("<span class='is_composing'>Agent is typing...</span>");
			$(document).trigger('composing.chatstates', jid);
            setTimeout(function(){$('.is_composing').remove();},3000);
		}

		if (paused.length > 0)
		{
            $('.is_composing').remove();
			$(document).trigger('paused.chatstates', jid);
		}

		if (active.length > 0)
		{
			$(document).trigger('active.chatstates', jid);
		}

		if (inactive.length > 0)
		{
            $('.is_composing').remove();
			$(document).trigger('inactive.chatstates', jid);
		}

		if (gone.length > 0)
		{
			$('.is_composing').remove();
            $(document).trigger('gone.chatstates', jid);
		}

		return true;
	},

	sendActive: function(jid, type)
	{
		this._sendNotification(jid, type, 'active');
	},

	sendComposing: function(jid, type)
	{
		this._sendNotification(jid, type, 'composing');
	},

	sendPaused: function(jid, type)
	{
		this._sendNotification(jid, type, 'paused');
	},

	sendInactive: function(jid, type)
	{
		this._sendNotification(jid, type, 'inactive');
	},

	sendGone: function(jid, type)
	{
		this._sendNotification(jid, type, 'gone');
	},

	_sendNotification: function(jid, type, notification)
	{
		if (!type) type = 'chat';

		this._connection.send($msg(
		{
			to: jid,
			type: type
		})
		.c(notification, {xmlns: Strophe.NS.CHATSTATES}));
	}
});

Strophe.addConnectionPlugin('receipts', {
    _conn: null,
    _msgQueue: {},
    _retries: {},
    _resendCount: 10,
    _resendTime: 15000,

    init: function(conn) {
        this._conn = conn;
        Strophe.addNamespace('RECEIPTS', 'urn:xmpp:receipts');
    },


    statusChanged: function (status) {
        if (status === Strophe.Status.CONNECTED || status === Strophe.Status.ATTACHED) {
            // set up handlers for receipts
            this._conn.addHandler(this._onRequestReceived.bind(this), Strophe.NS.RECEIPTS, "message");
            var that = this;
            // setTimeout(function(){that.resendQueue();},5000);
        }
    },


    _onRequestReceived: function(msg){
        this._processReceipt(msg);
        return true;
    },

    /* sendMessage
    ** sends a message with a receipt and stores the message in the queue
    ** in case a receipt is never received
    **
    ** msg should be a builder
    */
    sendMessage: function(msg) {
        var id = this._conn.getUniqueId();

        msg.tree().setAttribute('id', id);

        var request = Strophe.xmlElement('request', {'xmlns': Strophe.NS.RECEIPTS});
        msg.tree().appendChild(request);

        this._msgQueue[id] = msg;
        this._retries[id] = 0;

        this._conn.send(msg);

        // this.resendMessage(id);

        return id;

    },
    /*
    ** resend queued message
    */
    resendMessage: function(id){
        var that = this;
        setTimeout(function(){
            if (that._msgQueue[id]){
                // if we are disconnected, dont increment retries count and retry later
                if (!that._conn.connected) {
                    that.resendMessage(id);
                    return;
                }
                that._retries[id]++;
                if (that._retries[id] > that._resendCount) {
                    //TODO: use mod_rest to force injection of the message
                    //console.debug('message could not be delivered after ' + that._resendCount + ' attempts');
                    return;
                }

                // FIX: use our actual jid in case we disconnected and changed jid
                that._msgQueue[id].tree().setAttribute('from', that._conn.jid);

                that._conn.send(that._msgQueue[id]);
                that.resendMessage(id);
            }
        },this._resendTime);
    },

    /* addMessageHandler
    ** add a message handler that handles XEP-0184 message receipts
    */
    addReceiptHandler: function(handler, type, from, options) {
        var that = this;
        var proxyHandler = function(msg) {
            that._processReceipt(msg);

            // call original handler
            return handler(msg);
        };

        this._conn.addHandler(proxyHandler, Strophe.NS.RECEIPTS, 'message',
                              type, null, from, options);
    },

    /*
     * process a XEP-0184 message receipts
     * send recept on request
     * remove msg from queue on received
    */
    _processReceipt: function(msg){


        var id = msg.getAttribute('id'),
            from = msg.getAttribute('from'),
            req = msg.getElementsByTagName('request'),
            rec = msg.getElementsByTagName('received');
        var fromBareJid = Strophe.getBareJidFromJid(from);

            // check for request in message
            if ((req.length > 0) && (fromBareJid==sessionStorage.getItem("xm_admin"))) {
                // send receipt
                var out = $msg({to: from, from: this._conn.jid, id: this._conn.getUniqueId()}),
                    request = Strophe.xmlElement('received', {'xmlns': Strophe.NS.RECEIPTS, 'id': id});
                out.tree().appendChild(request);
                this._conn.send(out);
            }
            // check for received
            if (rec.length > 0) {
                var recv_id = rec[0].getAttribute('id');
                if (recv_id) { // delete msg from queue
                storeMessageHistory.messageStatusDeliverd(recv_id,true);
                views.getBubble(recv_id).addClass('msg_received');
                // for(i = 1; i<=count; i++){
                //     var messageId = 'msg'+i;
                //     var sessionMessage = sessionStorage.getItem(messageId);
                //     var parsedMessage = JSON.parse(sessionMessage);
                //     if(parsedMessage.id == recv_id){
                //         console.log("hello");
                //         parsedMessage['received']=true;
                //         sessionStorage.setItem(messageId,JSON.stringify(parsedMessage));
                //         views.getBubble(recv_id).addClass('msg_received');
                //     }
                // }
                    delete this._msgQueue[recv_id];
                    delete this._retries[recv_id];
                }
            }
    },
    resendQueue: function(){
        if (!this._conn.connected) {
            var that = this;
            setTimeout(function(){that.resendQueue();},5000);
            return;
        }
        // for (var id in this._msgQueue) {
        //     if (this._msgQueue.hasOwnProperty(id)) {
        //        this._conn.send(this._msgQueue[id]);
        //     }
        // }
    },
    getUnreceivedMsgs: function() {
        var msgs = [];
        for (var id in this._msgQueue) {
            if (this._msgQueue.hasOwnProperty(id)) {
                msgs.push(this._msgQueue[id]);
            }
        }
        return msgs;
    },
    clearMessages: function() {
        this._msgQueue = {};
    }
});
