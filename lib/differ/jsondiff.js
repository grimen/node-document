var fun = require('funargs'),
    util = require('util'),

    Differ = require('./');

// new JSONDiff ()
// new JSONDiff (schema)
// new JSONDiff (schema, options)
function JSONDiff () {
  var self = this, args = fun(arguments);

  self.klass = JSONDiff;
  self.klass.super_.apply(self, arguments);

  self.options = Object.merge(self.klass.defaults.options, args.objects()[0] || {}, true);
  self.engine = require('json-diff');
}

util.inherits(JSONDiff, Differ);

// -----------------------
//  Class
// --------------------

JSONDiff.defaults = {
  options: {}
};

JSONDiff.options = Object.clone(JSONDiff.defaults.options, true);

JSONDiff.reset = Differ.reset;

// -----------------------
//  Instance
// --------------------

// #diff (a, b)
// #diff (a, b, options)
// #diff (a, b, callback)
// #diff (a, b, options, callback)
JSONDiff.prototype.diff = function(a, b) {
  var self = this, args = fun(arguments).slice(2), options, callback;

  options = args.objects()[0];
  callback = args.functions()[0];

  var diff;

  try {
    diff = self.engine.diff(a, b) || null;
  } catch (err) {
    if (callback) {
      callback(err);
    } else {
      throw err;
    }
  }

  var identical = Object.isEmpty(diff);

  if (callback) {
    callback(null, diff, identical);
  } else {
    return result;
  }
}

// -----------------------
//  Export
// --------------------

module.exports = JSONDiff;
