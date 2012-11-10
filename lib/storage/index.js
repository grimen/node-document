var fun = require('funargs');

// -----------------------
//  Constructor
// --------------------

// new Storage ();
// new Storage (options);
// new Storage (url);
// new Storage (url, options);
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

Storage.defaults = {
  url: null,
  options: {}
};

Storage.url = null;
Storage.options = null;

Storage.reset = function() {
  if (this.defaults) {
    this.url = this.defaults.url;
    this.options = this.defaults.options;
  }
};

// -----------------------
//  Instance
// --------------------

// #key (key)
// #key (key)
Storage.prototype.key = function() {
  throw new Error("Not implemented");
}

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
Storage.prototype.set = function() {
  throw new Error("Not implemented");
}

// #get (key, [options], callback)
// #get (keys, [options], callback)
Storage.prototype.get = function() {
  throw new Error("Not implemented");
}

// #del (key, [options], callback)
// #del (keys, [options], callback)
Storage.prototype.del = function() {
  throw new Error("Not implemented");
}

// #delete (key, [options], callback)
// #delete (keys, [options], callback)
Storage.prototype.delete = Storage.prototype.del;

// #end ()
Storage.prototype.end = function() {
  throw new Error("Not implemented");
}

// -----------------------
//  Export
// --------------------

module.exports = Storage;
