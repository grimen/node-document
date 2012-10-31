var fun = require('funargs');

// -----------------------
//  Constructor
// --------------------

// new Storage();
// new Storage({});
function Storage () {
  this.klass = Storage;

  var args = fun(arguments);

  this.url = args.strings().pop() || this.klass.url || null;
  this.options = args.objects().pop() || this.klass.options || {};

  this.client = null;

  this.options = Object.extended(this.options);
}

// -----------------------
//  Class
// --------------------

Storage.url = undefined;
Storage.options = undefined;

Storage.defaults = {
  url: undefined,
  options: {}
}

Storage.reset = function() {
  if (this.defaults) {
    this.url = this.defaults.url;
    this.options = this.defaults.options;
  }
};

// -----------------------
//  Instance
// --------------------

Storage.prototype.key = function() {
  throw new Error("Not implemented");
}

Storage.prototype.set = function() {
  throw new Error("Not implemented");
}

Storage.prototype.get = function() {
  throw new Error("Not implemented");
}

Storage.prototype.del = function() {
  throw new Error("Not implemented");
}

Storage.prototype.delete = Storage.prototype.del;

Storage.prototype.end = function() {
  throw new Error("Not implemented");
}

// -----------------------
//  Export
// --------------------

module.exports = Storage;
