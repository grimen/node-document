var fun = require('funargs');

// new Differ ()
// new Differ (schema)
// new Differ (schema, options)
function Differ () {
  var self = this, args = fun(arguments);

  self.klass = self.klass || Differ;

  self.options = Object.merge(self.klass.defaults.options, args.objects()[0] || {}, true);
  self.engine = null;
}

// -----------------------
//  Class
// --------------------

Differ.defaults = {
  options: {}
};

Differ.options = null;

Differ.reset = function() {
  var self = this;

  if (self.defaults) {
    self.options = self.defaults.options;
  }
};

// -----------------------
//  Instance
// --------------------

// #diff (attributes)
// #diff (attributes, options)
// #diff (attributes, callback)
// #diff (attributes, options, callback)
Differ.prototype.diff = function() {
  throw new Error("Not implemented");
}

// -----------------------
//  Export
// --------------------

module.exports = Differ;
