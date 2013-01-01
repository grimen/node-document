var util = require('util'),

    Differ = require('./');

// -----------------------
//  DOCS
// --------------------
//  - https://github.com/flitbit/diff

// -----------------------
//  Constructor
// --------------------

// new DeepDiff ()
// new DeepDiff (schema)
// new DeepDiff (schema, options)
function DeepDiff () {
  var self = this

  self.klass = DeepDiff;
  self.klass.super_.apply(self, arguments);

  self.engine = require('deep-diff');
}

util.inherits(DeepDiff, Differ);

// -----------------------
//  Class
// --------------------

DeepDiff.defaults = {
  options: {}
};

DeepDiff.options = Object.clone(DeepDiff.defaults.options, true);

DeepDiff.reset = Differ.reset;

// -----------------------
//  Instance
// --------------------

// #diff (a, b)
// #diff (a, b, options)
// #diff (a, b, callback)
// #diff (a, b, options, callback)
DeepDiff.prototype.diff = function() {
  var self = this;

  self._diff(arguments, function(a, b, options, done) {
    var diff = self.engine.diff(a, b) || null;
    var identical = Object.isEmpty(diff || {});

    done(diff, identical);
  });
}

// -----------------------
//  Export
// --------------------

module.exports = DeepDiff;
