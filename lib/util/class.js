require ('sugar');
var _ = require('underscore');

// REVIEW:
//    - https://github.com/alexyoung/turing.js/blob/master/turing.oo.js
//    - https://github.com/firejune/class
//    - https://github.com/bnoguchi/class-js

var Class = {
  extend: function(receiver) {
    var objects = Array.prototype.slice.call(arguments, 1);

    for (var i = 0, length = objects.length; i < length; i++) {
      for (var property in objects[i]) {
        receiver[property] = objects[i][property];
      }
    }

    return receiver;
  },

  // REVIEW: http://nodejs.org/docs/latest/api/util.html#util_util_inherits_constructor_superconstructor
  inherit: function(parent) {
    var klass = function() {};

    klass.prototype = parent.prototype;

    var subklass = function() {
      parent.apply(this, arguments);
    }

    subklass.prototype = new klass();
    subklass.prototype.constructor = subklass;

    return subklass;
  },

  subclass: function(klass) {
    var subklass = Class.inherit(klass);
    var klass_methods = {};

    Object.keys(klass).each(function(name) {
      klass_methods[name] = klass[name];
    });


    Class.extend(subklass, klass_methods);

    return subklass;
  },

  name: function(object) {
    if (!Object.isObject(object) || !object) return false;
    return /(\w+)\(/.exec(object.constructor.toString())[1];
  },

  clone: function(value) {
    if (!Object.isObject(value)) return value;
    return Object.isArray(value) ? value.slice() : Object.extend({}, value);
  }
};


module.exports = Class;