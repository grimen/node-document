require('sugar')
var debug = console.log;

var Storage = require('./');

// -----------------------
//  Constructor
// --------------------

function MemoryStorage (options) {
  if (!this instanceof Storage) {
    this.constructor(options);
  }
  this.klass = MemoryStorage;

  var defaults = Object.extended({
    db: '{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  });
  options = defaults.merge(options);

  this.client = new MemoryStorage.Client();
  this.options = options

  if (process.env.NODE_ENV !== 'test')
    console.log("Memory.INIT");
}

MemoryStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

MemoryStorage.url = 'memory://localhost/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')});

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

MemoryStorage.prototype.key = function(key) {
  return [this.options.db, key].join('/');
};

// set(key, value, callback)
// set([key_1, key_2, ..., key_n], [value_1, value_2, ..., value_n], callback)
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

// get(key, callback)
// get([key_1, key_2, ..., key_n], callback)
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

// del(key, callback)
// del([key_1, key_2, ..., key_n], callback)
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

// delete(key, value, callback)
// delete(key, value, options, callback)
MemoryStorage.prototype.delete = MemoryStorage.prototype.del;

// end()
MemoryStorage.prototype.end = function() {
  // (nothing)
};

module.exports = MemoryStorage;
