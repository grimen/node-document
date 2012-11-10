var fun = require('funargs');

// new Validator ()
// new Validator (schema)
// new Validator (schema, options)
function Validator () {
  this.klass = Validator;

  var args = fun(arguments);

  this.options = Object.merge(this.klass.defaults.options, args.objects()[0] || {}, true);

  this.engine = null;
}

// -----------------------
//  Class
// --------------------

Validator.defaults = {
  options: {}
};

Validator.options = null;

Validator.reset = function() {
  if (this.defaults) {
    this.options = this.defaults.options;
  }
};

// -----------------------
//  Instance
// --------------------

// #validate (attributes)
// #validate (attributes, options)
// #validate (attributes, callback)
// #validate (attributes, options, callback)
Validator.prototype.validate = function() {
  throw new Error("Not implemented");
}

// -----------------------
//  Export
// --------------------

module.exports = Validator;
