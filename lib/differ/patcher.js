var util = require('util'),

    Differ = require('./');

// -----------------------
//  DOCS
// --------------------
//  - https://github.com/mikolalysenko/patcher.js

// -----------------------
//  Constructor
// --------------------

// new Patcher ()
// new Patcher (schema)
// new Patcher (schema, options)
function Patcher () {
  var self = this

  self.klass = Patcher;
  self.klass.super_.apply(self, arguments);

  self.engine = require('patcher');
}

util.inherits(Patcher, Differ);

// -----------------------
//  Class
// --------------------

Patcher.defaults = {
  options: {}
};

Patcher.options = Object.clone(Patcher.defaults.options, true);

Patcher.reset = Differ.reset;

// -----------------------
//  Instance
// --------------------

// #diff (a, b)
// #diff (a, b, options)
// #diff (a, b, callback)
// #diff (a, b, options, callback)
Patcher.prototype.diff = function() {
  var self = this;

  self._diff(arguments, function(a, b, options, done) {
    var diff = self.engine.computePatch(a, b) || null;
    var identical = Object.isEmpty(diff || {});

    done(diff, identical);
  });
}

// -----------------------
//  Export
// --------------------

module.exports = Patcher;
