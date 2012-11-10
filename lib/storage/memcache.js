require('sugar');
var url = require('url'),
    Storage = require('./'),

    Memcached = require('memcached');

// == DOCS:
//  - https://github.com/3rd-Eden/node-memcached

// -----------------------
//  Constructor
// --------------------

// new MemcacheStorage ();
// new MemcacheStorage (options);
// new MemcacheStorage (url);
// new MemcacheStorage (url, options);
function MemcacheStorage () {
  this.constructor.apply(this, arguments);
  this.klass = MemcacheStorage;

  this.url = this.url || this.klass.url;

  var endpoint = url.parse(this.url);
  var defaults = {
    hostname: endpoint.hostname,
    port: endpoint.port,
    username: endpoint.auth && endpoint.auth.split(':')[0],
    password: endpoint.auth && endpoint.auth.split(':')[1],
    settings: {
      maxKeySize: 250,
      maxExpiration: 2592000,
      maxValue: 1048576,
      poolSize: 10,
      reconnect: 18000000,
      timeout: 5000,
      retries: 5,
      retry: 30000,
      remove: true,
      failOverServers: undefined,
      keyCompression: true
    },
    db: endpoint.pathname.replace(/^\//, '')
  }; // REFACTOR: Object.merge(this.klass.defaults.options, this.options) // ...but handle "procs" (functions)

  this.options = Object.merge(defaults, this.options);

  var auth = [this.options.username, this.options.password].compact().join(':'),
      domain_and_port = [this.options.hostname, this.options.port].compact().join(':');

  this.options.endpoint = Object.isEmpty(auth) ? domain_and_port : [auth, domain_and_port].join('@');

  try {
    this.client = new Memcached(this.options.endpoint, this.options.settings);
  } catch (err) {
    throw new Error(err);
  }

  // REFACTOR: Replace with `EventEmitter` pattern.
  if (process.env.NODE_ENV !== 'test')
    console.log('Memcache.INIT: %s', endpoint_url);
}

MemcacheStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

MemcacheStorage.defaults = {
  url: process.env.MEMCACHE_URL || 'memcache://localhost:11211/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {}
};

MemcacheStorage.url = MemcacheStorage.defaults.url;
MemcacheStorage.options = MemcacheStorage.defaults.options;

MemcacheStorage.reset = Storage.reset;

// -----------------------
//  Instance
// --------------------

// #key (key)
MemcacheStorage.prototype.key = function(key) {
  return [this.options.db, key].join('/');
};

// #set (key, value, callback)
// #set (keys, values, callback)
MemcacheStorage.prototype.set = function(key, value) {
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
  values = values.map(function(v) { return JSON.stringify(v); });

  if (keys.length !== values.length)
    throw new Error("Key/Value sizes must match.");

  var key_values = Object.extended({});

  keys.each(function(key, i) {
    key_values[key] = values[i];
  });

  var responses = [],
      results = [];

  // REFACTOR: See MemoryStorage.set

  // NOTE: Bulk SETs are not faster - SET MULTI not supported in text protocol.
  key_values.each(function(_key, _value) {
    self.client.set(_key, _value, 0, function(err, response) {
      var result = response;

      results.push(result);
      responses.push(response);

      if (responses.length === keys.length) {
        if (Object.isFunction(callback)) callback(err, results, responses);
      }
    });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
MemcacheStorage.prototype.get = function(key) {
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

  var responses = [],
      results = [];

  self.client.get(keys, function(err, responses) {
    var result,
        results = [];

    keys.each(function(_key) {
      result = responses[_key] || null;
      results.push(result);
    });

    results = results.map(function(result) {
      try {
        return JSON.parse(result);
      } catch (e) {
        return null;
      }
    });

    if (Object.isFunction(callback)) callback(err, results, responses);
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
MemcacheStorage.prototype.del = function(key) {
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

  var responses = [],
      results = [];

  // REFACTOR: See MemoryStorage.del

  // NOTE: Bulk DELETEs are not faster - DELETE MULTI not supported in text protocol.
  keys.each(function(_key) {
    self.client.del(_key, function(err, response) {
      var result = response;

      results.push(result);
      responses.push(response);

      if (responses.length === keys.length) {
        if (Object.isFunction(callback)) callback(err, results, responses);
      }
    });
  });
};

// #delete (key, [options], callback)
// #delete (keys, [options], callback)
MemcacheStorage.prototype.delete = MemcacheStorage.prototype.del;

// #end ()
MemcacheStorage.prototype.end = function() {
  var self = this;
  self.client.end();
};

// -----------------------
//  Export
// --------------------

module.exports = MemcacheStorage;
