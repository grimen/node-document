var util = require('util'),

    Differ = require('./');

// -----------------------
//  DOCS
// --------------------
//  - https://github.com/NV/objectDiff.js

// -----------------------
//  Constructor
// --------------------

// new ObjectDiff ()
// new ObjectDiff (schema)
// new ObjectDiff (schema, options)
function ObjectDiff () {
  var self = this

  self.klass = ObjectDiff;
  self.klass.super_.apply(self, arguments);

  self.engine = require('objectdiff');
}

util.inherits(ObjectDiff, Differ);

// -----------------------
//  Class
// --------------------

ObjectDiff.defaults = {
  options: {}
};

ObjectDiff.options = Object.clone(ObjectDiff.defaults.options, true);

ObjectDiff.reset = Differ.reset;

// -----------------------
//  Instance
// --------------------

// #diff (a, b)
// #diff (a, b, options)
// #diff (a, b, callback)
// #diff (a, b, options, callback)
ObjectDiff.prototype.diff = function() {
  var self = this;

  self._diff(arguments, function(a, b, options, done) {
    var diff = self.engine.diff(a, b) || null;
    var identical = (JSON.stringify(diff).match(/\"changed\":\"[^\"]+\"/gi) || []).length === (JSON.stringify(diff).match(/\"changed\":\"equals\"/gi) || []).length;

    if (identical) {
      diff = null;
    }

    done(diff, identical);
  });
}

// -----------------------
//  Export
// --------------------

module.exports = ObjectDiff;
