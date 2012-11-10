require('sugar')
var url = require('url'),
    Storage = require('./');

// -----------------------
//  Constructor
// --------------------

// new MemoryStorage ();
// new MemoryStorage (options);
// new MemoryStorage (url);
// new MemoryStorage (url, options);
function MemoryStorage () {
  this.constructor.apply(this, arguments);
  this.klass = MemoryStorage;

  this.url = this.url || this.klass.url;

  var endpoint = url.parse(this.url); // TODO: Pass this to "client"

  var defaults = {
    db: '{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  }; // REFACTOR: Object.merge(this.klass.defaults.options, this.options) // ...but handle "procs" (functions)

  this.options = Object.merge(defaults, this.options);

  try {
    this.client = new MemoryStorage.Client(); // TODO: Pass URL to constructor - parse out global variable name from URL.
  } catch (err) {
    throw new Error(err);
  }

  // REFACTOR: Replace with `EventEmitter` pattern.
  if (process.env.NODE_ENV !== 'test')
    console.log("Memory.INIT");
}

MemoryStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

MemoryStorage.defaults = {
  url: process.env.MEMORY_URL || 'memory://localhost/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {}
};

MemoryStorage.url = MemoryStorage.defaults.url;
MemoryStorage.options = MemoryStorage.defaults.options;

MemoryStorage.reset = Storage.reset;

// -----------------------
//  Client
// --------------------

// FIXME: Respect `MemoryStorage.url` parameters - just for the purpose of conventions. :)
MemoryStorage.Client = function() {
  this.set = function(key, value, callback) {
    try {
      global.memory = global.memory || {};
      global.memory[key] = value;
      var result = (global.memory[key] === value);
      if (Object.isFunction(callback)) callback(null, result, result);
    } catch (err) {
      if (Object.isFunction(callback)) callback(err);
    }
  };

  this.get = function(key, callback) {
    try {
      global.memory = global.memory || {};
      var result = global.memory[key] || null;
      if (Object.isFunction(callback)) callback(null, result, result);
    } catch (err) {
      if (typeof callback === 'function') callback(err);
    }
  };

  this.del = function(key, callback) {
    try {
      global.memory = global.memory || {};
      var result = !!global.memory[key];
      delete global.memory[key];
      if (Object.isFunction(callback)) callback(null, result, result);
    } catch (err) {
      if (Object.isFunction(callback)) callback(err);
    }
  }
};

// -----------------------
//  Instance
// --------------------

// #key (key)
MemoryStorage.prototype.key = function(key) {
  return [this.options.db, key].join('/');
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
MemoryStorage.prototype.set = function(key, value) {
  var self = this, options, callback;

  if (Object.isObject(arguments[2])) {
    options = arguments[2];
    callback = arguments[3];
  } else {
    options = {};
    callback = arguments[2];
  }

  var key_was_collection = Object.isArray(key);
  var keys = key_was_collection ? key : [key];

  var value_was_collection = Object.isArray(value),
      values = value_was_collection ? value : [value];

  keys = keys.map(function(_key) { return self.key(_key); });

  if (keys.length !== values.length)
    throw new Error("Key/Value sizes must match.");

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

  if (Object.isFunction(callback)) callback(errors, results, responses);
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
MemoryStorage.prototype.get = function(key) {
  var self = this, options, callback;

  if (Object.isObject(arguments[1])) {
    options = arguments[1];
    callback = arguments[2];
  } else {
    options = {};
    callback = arguments[1];
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

  if (Object.isFunction(callback)) callback(errors, results, responses);
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
MemoryStorage.prototype.del = function(key) {
  var self = this, options, callback;

  if (Object.isObject(arguments[1])) {
    options = arguments[1];
    callback = arguments[2];
  } else {
    options = {};
    callback = arguments[1];
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

  if (Object.isFunction(callback)) callback(errors, results, responses);
};

// #delete (key, [options], callback)
// #delete (keys, [options], callback)
MemoryStorage.prototype.delete = MemoryStorage.prototype.del;

// #end ()
MemoryStorage.prototype.end = function() {};

// -----------------------
//  Export
// --------------------

module.exports = MemoryStorage;
