var fun = require('funargs');

var Differ = require('./');

// new JSONDiffDiffer()
// new JSONDiffDiffer(schema)
// new JSONDiffDiffer(schema, options)
function JSONDiffDiffer () {
  this.klass = JSONDiffDiffer;

  var args = fun(arguments);

  this.options = Object.merge(this.klass.defaults.options, args.objects()[0] || {}, true);

  this.engine = require('json-diff');
}

JSONDiffDiffer.prototype = new Differ();

// -----------------------
//  Class
// --------------------

JSONDiffDiffer.defaults = {
  options: {}
};

JSONDiffDiffer.options = JSONDiffDiffer.defaults.options;

JSONDiffDiffer.reset = Differ.reset;

// -----------------------
//  Instance
// --------------------

// diff (a, b)
// diff (a, b, options)
// diff (a, b, callback)
// diff (a, b, options, callback)
JSONDiffDiffer.prototype.diff = function(a, b) {
  var self = this, args = fun(arguments).slice(2), options, callback;

  options = args.objects()[0];
  callback = args.functions()[0];

  var diff = self.engine.diff(a, b) || null;
  var identical = Object.isEmpty(diff);

  if (callback) {
    callback(diff, identical);
  } else {
    return result;
  }
}

// -----------------------
//  Export
// --------------------

module.exports = JSONDiffDiffer;
