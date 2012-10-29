require('sugar');
var url = require('url'),
    helpers = require('../helpers'),
    inspect = helpers.inspect,
    debug = console.log,

    Memcached = require('memcached');

var Storage = require('./');

// == DOCS:
//  - https://github.com/3rd-Eden/node-memcached

// -----------------------
//  Constructor
// --------------------

function MemcacheStorage (options) {
  if (!this instanceof Storage) {
    this.constructor(options);
  }
  this.klass = MemcacheStorage;

  var endpoint_url = process.env.MEMCACHE_URL || this.klass.url,
      endpoint = url.parse(endpoint_url);

  var defaults = Object.extended({
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
  });
  options = defaults.merge(options);

  var auth = [options.username, options.password].compact().join(':'),
      domain_and_port = [options.hostname, options.port].compact().join(':');

  options.endpoint = Object.isEmpty(auth) ? domain_and_port : [auth, domain_and_port].join('@');

  this.client = new Memcached(options.endpoint, options.settings);
  this.options = options

  if (process.env.NODE_ENV !== 'test')
    console.log('Memcache.INIT: %s', endpoint_url);
}

MemcacheStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

MemcacheStorage.url = 'memcache://localhost:11211/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')});

// -----------------------
//  Instance
// --------------------

MemcacheStorage.prototype.key = function(key) {
  return [this.options.db, key].join('/');
};

// set(key, value, callback)
// set([key_1, key_2, ..., key_n], [value_1, value_2, ..., value_n], callback)
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

// get(key, callback)
// get([key_1, key_2, ..., key_n], callback)
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

// del(key, callback)
// del([key_1, key_2, ..., key_n], callback)
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

// delete(key, value, callback)
// delete(key, value, options, callback)
MemcacheStorage.prototype.delete = MemcacheStorage.prototype.del;

// end()
MemcacheStorage.prototype.end = function() {
  self.client.end();
};

module.exports = MemcacheStorage;
