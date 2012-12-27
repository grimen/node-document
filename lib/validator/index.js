var fun = require('funargs');

// new Validator ()
// new Validator (schema)
// new Validator (schema, options)
function Validator () {
  var self = this, args = fun(arguments);

  self.klass = self.klass || Validator;

  self.options = Object.merge(self.klass.defaults.options, args.objects()[0] || {}, true);
  self.engine = null;
}

// -----------------------
//  Class
// --------------------

// .name
Validator.__defineGetter__('name', function() {
  var self = this;
  return self.name;
});

Validator.defaults = {
  options: {}
};

Validator.options = null;

Validator.reset = function() {
  var self = this;

  if (self.defaults) {
    self.options = self.defaults.options;
  }
};

// -----------------------
//  Instance
// --------------------

// #name
Validator.prototype.__defineGetter__('name', function() {
  var self = this;
  return this.constructor.name;
});

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
