require('sugar');
var fun = require('funargs');

// -----------------------
//  Constructor
// --------------------

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

// .name
Differ.__defineGetter__('name', function() {
  var self = this;
  return self.name;
});

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

// #name
Differ.prototype.__defineGetter__('name', function() {
  var self = this;
  return this.constructor.name;
});

// #_validate ()
Differ.prototype._diff = function(args, execute) {
  var self = this, a, b, options, callback;

  args = fun(args);

  a = args.objects()[0];
  b = args.objects()[1];
  options = Object.merge(self.options, args.objects()[2] || {}, true);
  callback = args.functions()[0];

  var done = function(diff, identical) {
    if (callback) {
      callback(null, diff, identical);
    }
  };

  try {
    execute(a, b, options, done);

  } catch (err) {
    if (callback) {
      callback(err);
    } else {
      throw err;
    }
  }
}

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
