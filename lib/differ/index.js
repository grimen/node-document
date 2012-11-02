var fun = require('funargs');

// new Differ()
// new Differ(schema)
// new Differ(schema, options)
function Differ () {
  this.klass = Differ;

  var args = fun(arguments);

  this.options = Object.merge(this.klass.defaults.options, args.objects()[0] || {}, true);

  this.engine = null;
}

// -----------------------
//  Class
// --------------------

Differ.defaults = {
  options: {}
};

Differ.options = undefined;

Differ.reset = function() {
  if (this.defaults) {
    this.options = this.defaults.options;
  }
};

// -----------------------
//  Instance
// --------------------

// validate(attributes)
// validate(attributes, options)
// validate(attributes, callback)
// validate(attributes, options, callback)
Differ.prototype.validate = function() {
  throw new Error("Not implemented");
}

// -----------------------
//  Export
// --------------------

module.exports = Differ;
