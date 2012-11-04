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

Differ.options = null;

Differ.reset = function() {
  if (this.defaults) {
    this.options = this.defaults.options;
  }
};

// -----------------------
//  Instance
// --------------------

// diff (attributes)
// diff (attributes, options)
// diff (attributes, callback)
// diff (attributes, options, callback)
Differ.prototype.diff = function() {
  throw new Error("Not implemented");
}

// -----------------------
//  Export
// --------------------

module.exports = Differ;
