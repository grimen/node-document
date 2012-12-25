require('sugar')
var fun = require('funargs'),
    util = require('util'),
    url = require('url'),
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

  var endpoint = url.parse(self.url);
  var options = {
    db: endpoint.pathname.replace(/^\//, '')
  };

  self.options = Object.merge(self.klass.defaults.options, self.options, true, false);
  self.options = Object.merge(options, self.options, true, false);
}

util.inherits(Memory, Storage);

// -----------------------
//  Class
// --------------------

Memory.defaults = {
  url: process.env.MEMORY_URL || 'memory://localhost/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {}
};

Memory.url = Memory.defaults.url;
Memory.options = Memory.defaults.options;

Memory.reset = Storage.reset;

// REFACTOR: extend()
Memory.events = new Storage.EventEmitter();
Memory.emit = Storage.emit;
Memory.on = Storage.on;
Memory.off = Storage.off;

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

  if (self.ready) {
    return;
  }

  self.emit('connect');

  try {
    self.client = new Memory.Client(); // TODO: Pass URL to constructor - parse out global variable name from URL.

    self.emit('ready');

  } catch (err) {
    self.emit('error', err);
  }
};

// #key (key)
Memory.prototype.key = function(key) {
  var self = this;
  return [self.options.db, key].join('/');
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
Memory.prototype.set = function(key, value) {
  var self = this, options, callback;

  if (Object.isObject(arguments[2])) {
    options = arguments[2];
    callback = arguments[3];
  } else {
    options = {};
    callback = arguments[2];
  }

  callback = callback || function() {};

  self.emit('command', 'set', fun(arguments));

  if (!self.ready) {
    self.connect();
    return false;
  }

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    var value_was_collection = Object.isArray(value),
        values = value_was_collection ? value : [value];

    keys = keys.map(function(_key) { return self.key(_key); });

    if (keys.length !== values.length) {
      throw new Error("Key/Value sizes must match.");
    }

    var key_values = Object.extended({});

    keys.each(function(key, i) {
      key_values[key] = values[i];
    });

    var errors = [],
        results = [],
        responses = [];

    key_values.each(function(_key, _value) {
      self.client.set(_key, _value, function(err, result, response) {
        errors.push(err);
        results.push(result);
        responses.push(response);
      });
    });

    callback(errors, results, responses);

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
Memory.prototype.get = function(key) {
  var self = this, options, callback;

  if (Object.isObject(arguments[1])) {
    options = arguments[1];
    callback = arguments[2];
  } else {
    options = {};
    callback = arguments[1];
  }

  callback = callback || function() {};

  self.emit('command', 'get', fun(arguments));

  if (!self.ready) {
    self.connect();
    return false;
  }

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    keys = keys.map(function(_key) { return self.key(_key); });

    var errors = [],
        results = [],
        responses = [];

    keys.each(function(_key) {
      self.client.get(_key, function(err, result, response) {
        errors.push(err);
        results.push(result);
        responses.push(response);
      });
    });

    callback(errors, results, responses);

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
Memory.prototype.del = function(key) {
  var self = this, options, callback;

  if (Object.isObject(arguments[1])) {
    options = arguments[1];
    callback = arguments[2];
  } else {
    options = {};
    callback = arguments[1];
  }

  callback = callback || function() {};

  self.emit('command', 'del', fun(arguments));

  if (!self.ready) {
    self.connect();
    return false;
  }

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    keys = keys.map(function(_key) { return self.key(_key); });

    var errors = [],
        results = [],
        responses = [];

    keys.each(function(_key) {
      self.client.del(_key, function(err, result, response) {
        errors.push(err);
        results.push(result);
        responses.push(response);
      });
    });

    callback(errors, results, responses);

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #delete (key, [options], callback)
// #delete (keys, [options], callback)
Memory.prototype.delete = Memory.prototype.del;

// #end ()
Memory.prototype.end = function() {};

// -----------------------
//  Export
// --------------------

module.exports = Memory;
