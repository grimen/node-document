var fun = require('funargs'),
    url = require('url');

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

  var uri = url.parse(self.url || '');

  self.options.client = self.options.client || {};
  self.options.client.protocol = uri.protocol && uri.protocol.replace(':', '');
  self.options.client.auth = {};
  self.options.client.auth.username = uri.auth && uri.auth.split(':')[0],
  self.options.client.auth.password = uri.auth && uri.auth.split(':')[1]
  self.options.client.hostname = uri.hostname;
  self.options.client.port = uri.port && parseInt(uri.port, 10);
  self.options.client.db = uri.pathname;

  self.options = Object.merge(self.klass.defaults.options, self.options, true, false);
  self.options = JSON.parse(JSON.stringify(self.options)); // BUG/FIXME: Sugar.js bug?

  self.events = new Storage.EventEmitter();

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

// .name
Storage.__defineGetter__('name', function() {
  var self = this;
  return self.name;
});

Storage.defaults = {
  url: null,
  options: {}
};

Storage.url = null;
Storage.options = null;

Storage.reset = function() {
  var self = this;
  if (self.defaults) {
    self.url = self.defaults.url;
    self.options = Object.clone(self.defaults.options);
  }
};

Storage.EventEmitter = require('events').EventEmitter;
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

// .name
Storage.prototype.__defineGetter__('name', function() {
  var self = this;
  return self.constructor.name;
});

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
};

// #command (operation, args, args_length, command_callback)
Storage.prototype.command = function(operation, args, args_length, command_callback) {
  var self = this, options, callback;

  self.emit('command', operation, args);

  args = fun(args)

  var last_args = args.slice(args_length - 2)

  options = Object.extended(last_args.objects()[0] || {});
  callback = last_args.functions()[0] || function(){};

  args = args.slice(0, args_length - 2);
  args.push(options);
  args.push(callback);

  if (!self.ready) {
    self.connect();
    return false;
  }

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    command_callback.apply(self, args);

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #key (key)
// #key (key)
Storage.prototype.key = function() {
  throw new Error("Not implemented");
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
Storage.prototype.set = function() {
  throw new Error("Not implemented");
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
Storage.prototype.get = function() {
  throw new Error("Not implemented");
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
Storage.prototype.del = function() {
  throw new Error("Not implemented");
};

// #end ()
Storage.prototype.end = function() {
  throw new Error("Not implemented");
};

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
