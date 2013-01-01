require('sugar');
var util = require('util'),

    Validator = require('./');

// -----------------------
//  DOCS
// --------------------
//  - https://github.com/Baggz/Amanda

// -----------------------
//  Constructor
// --------------------

// new Amanda ()
// new Amanda (options)
function Amanda () {
  var self = this;

  self.klass = Amanda;
  self.klass.super_.apply(self, arguments);

  self.engine = require('amanda')('json');
}

util.inherits(Amanda, Validator);

// -----------------------
//  Class
// --------------------

Amanda.defaults = {
  options: {
    singleError: false
  }
};

Amanda.options = Object.clone(Amanda.defaults.options, true);

Amanda.reset = Validator.reset;

// -----------------------
//  Instance
// --------------------

// #validate (attributes)
// #validate (attributes, options)
// #validate (attributes, callback)
// #validate (attributes, options, callback)
Amanda.prototype.validate = function() {
  var self = this;

  self._validate(arguments, function(attributes, schema, options, done) {
    self.engine.validate(attributes, schema, options, function(result) {
      var errors = result || null;
      var valid = Object.isEmpty(errors || {});

      done(errors, valid);
    });
  });
};

// -----------------------
//  Export
// --------------------

module.exports = Amanda;
