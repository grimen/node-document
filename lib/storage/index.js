var fun = require('funargs'),
    EventEmitter = require('events').EventEmitter;

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
  this.events = new EventEmitter();
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

Storage.events = new EventEmitter();

// .on (event, listener)
Storage.on = function() {
  var self = this, result;
  result = self.events.addListener.apply(self, arguments)
  return result;
};

// .off (event, listener)
Storage.off = function() {
  var self = this, result;
  result = self.events.removeListener.apply(self, arguments);
  return result;
};

// .emit (event, [arg1], [arg2], [...])
Storage.emit = function() {
  var self = this, result;
  result = self.events.emit.apply(self, arguments);
  return result;
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

// #on (event, listener)
Storage.prototype.on = function() {
  var self = this, result;
  result = self.events.addListener.apply(self, arguments);
  return result;
};

// #off (event, listener)
Storage.prototype.off = function() {
  var self = this, result;
  result = self.events.removeListener.apply(self, arguments);
  return result;
};

// #emit (event, [arg1], [arg2], [...])
Storage.prototype.emit = function() {
  var self = this, result;
  result = self.events.emit.apply(self, arguments);
  return result;
};

// -----------------------
//  Export
// --------------------

module.exports = Storage;
