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
  var self = this;

  self.klass = self.klass || Storage;

  var args = fun(arguments);

  self.url = args.strings().pop() || self.klass.url || null;
  self.options = args.objects().pop() || self.klass.options || {};

  self.client = null;
  self.ready = false;
  self.authorized = false;
  self.connecting = false;
  self.queue = [];

  self.options = Object.extended(self.options);
  self.events = new EventEmitter();

  // self.on('error', function() {});

  self.on('connect', function() {
    self.ready = false;
    self.authorized = false;
    self.connecting = true;
  });

  self.on('ready', function(err) {
    if (!err) {
      self.ready = true;
      self.authorized = true;
      self.connecting = false;

      self.commit();
    }
  });

  self.on('command', function(type, args) {
    self.emit(type, args);

    if (!self.ready) {
      self.push(type, args);
    }
  });
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

Storage.EventEmitter = EventEmitter;
Storage.events = new Storage.EventEmitter();

// .on (event, listener)
Storage.on = function() {
  var self = this, result;
  result = self.events.addListener.apply(self, arguments)
  return result;
};

// .off (event, listener)
Storage.off = function() {
  var self = this, result;
  if (arguments.length < 2) {
    result = self.events.removeAllListeners.apply(self, arguments);
  } else {
    result = self.events.removeListener.apply(self, arguments);
  }
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

// #push ([key, [options], callback])
// #push ([keys, [options], callback])
// #push ([key, value, [options], callback])
// #push ([keys, values, [options], callback])
Storage.prototype.push = function(operation, args) {
  var self = this;

  args = fun(args);
  args.unshift(operation);

  self.queue = self.queue || [];
  self.queue.push(args);

  self.emit('push', args);
};

// #commit ()
Storage.prototype.commit = function() {
  var self = this, command, operation;

  self.emit('commit', self.queue);

  while (command = self.queue.shift()) {
    operation = command.shift();
    self[operation].apply(self, command);
  }
}

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
