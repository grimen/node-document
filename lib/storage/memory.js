require('sugar')
var fun = require('funargs'),
    util = require('util'),
    Storage = require('./');

// -----------------------
//  Constructor
// --------------------

// new Memory ();
// new Memory (options);
// new Memory (url);
// new Memory (url, options);
function Memory () {
  var self = this;

  self.klass = Memory;
  self.klass.super_.apply(self, arguments);

  self.options.server.db = self.options.server.db.replace(/^\//, '');
}

util.inherits(Memory, Storage);

// -----------------------
//  Class
// --------------------

Memory.defaults = {
  url: process.env.MEMORY_URL || 'memory:///{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {}
};

Memory.url = Memory.defaults.url;
Memory.options = Memory.defaults.options;

Memory.reset = Storage.reset;

// -----------------------
//  Client
// --------------------

// FIXME: Respect `Memory.url` parameters - just for the purpose of conventions. :)
Memory.Client = function() {
  this.set = function(key, value, callback) {
    callback = callback || function(){};
    try {
      global.memory = global.memory || {};
      global.memory[key] = value;
      var result = (global.memory[key] === value);
      callback(null, result, result);
    } catch (err) {
      callback(err);
    }
  };

  this.get = function(key, callback) {
    callback = callback || function(){};
    try {
      global.memory = global.memory || {};
      var result = global.memory[key] || null;
      callback(null, result, result);
    } catch (err) {
      callback(err);
    }
  };

  this.del = function(key, callback) {
    callback = callback || function(){};
    try {
      global.memory = global.memory || {};
      var result = !!global.memory[key];
      delete global.memory[key];
     callback(null, result, result);
    } catch (err) {
      callback(err);
    }
  }
};

// -----------------------
//  Instance
// --------------------

// #connect ()
Memory.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    self.client = new Memory.Client(); // TODO: Pass URL to constructor - parse out global variable name from URL.

    self.emit('ready');
  });
};

// #key (key)
Memory.prototype.key = function(key) {
  var self = this;
  var _key = [self.options.server.db, key].join('/');
  return _key;
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
Memory.prototype.set = function() {
  var self = this;

  self._set(arguments, function(key_values, options, done, next) {
    key_values.each(function(key, value) {
      self.client.set(key, value, function(err, result, response) {
        next(key, err, result, response);
      });
    });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
Memory.prototype.get = function() {
  var self = this;

  self._get(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client.get(key, function(err, result, response) {
        next(key, err, result, response);
      });
    });
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
Memory.prototype.del = function() {
  var self = this;

  self._del(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client.del(key, function(err, response) {
        next(key, err, response, response);
      });
    });
  });
};

// -----------------------
//  Export
// --------------------

module.exports = Memory;
