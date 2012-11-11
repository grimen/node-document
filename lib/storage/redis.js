require('sugar')
var url = require('url'),
    Storage = require('./'),

    redis = require('redis');

// == DOCS:
//  - https://github.com/mranney/node_redis

// -----------------------
//  Constructor
// --------------------

// new RedisStorage ();
// new RedisStorage (options);
// new RedisStorage (url);
// new RedisStorage (url, options);
function RedisStorage () {
  this.constructor.apply(this, arguments);
  this.klass = RedisStorage;

  this.url = this.url || this.klass.url;

  var endpoint = url.parse(this.url);
  var defaults = {
    hostname: endpoint.hostname,
    port: parseInt(endpoint.port, 10),
    username: endpoint.auth && endpoint.auth.split(':')[0],
    password: endpoint.auth && endpoint.auth.split(':')[1],
    db: endpoint.pathname.replace(/^\//, '')
  };

  this.options = Object.merge(this.klass.defaults.options, this.options, true, false);
  this.options = Object.merge(defaults, this.options, true, false);

  try {
    this.client = redis.createClient(this.options.port, this.options.hostname, this.options.settings);
    this.client.auth(this.options.password);
  } catch (err) {
    throw new Error(err);
  }

  // REFACTOR: Replace with `EventEmitter` pattern.
  if (process.env.NODE_ENV !== 'test')
    console.log("Redis.INIT: %s", endpoint_url);
}

RedisStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

RedisStorage.defaults = {
  url: process.env.REDIS_URL || 'redis://localhost:6379/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    settings: {
      parser: 'hiredis',
      return_buffers: false,
      detect_buffers: false,
      socket_nodelay: true,
      no_ready_check: false
    }
  }
};

RedisStorage.url = RedisStorage.defaults.url;
RedisStorage.options = RedisStorage.defaults.options;

RedisStorage.reset = Storage.reset;

// -----------------------
//  Instance
// --------------------

// #key (key)
RedisStorage.prototype.key = function(key) {
  return [this.options.db, key].join('/');
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
RedisStorage.prototype.set = function(key, value) {
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

  values = values.map(function(v) { return JSON.stringify(v); });

  if (keys.length !== values.length)
    throw new Error("Key/Value sizes must match.");

  var key_values = Object.extended({});

  keys.each(function(key, i) {
    key_values[key] = values[i];
  });

  var commands = keys.map(function(_key, i) { return ['set', self.key(_key), values[i]]; });

  self.client.multi(commands).exec(function(err, responses) {
    var result = responses.map(function(response) { return (response === 'OK' ? true : false); });

    if (Object.isFunction(callback)) callback(err, result, responses);
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
RedisStorage.prototype.get = function(key) {
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
  var commands = keys.map(function(_key, i) { return ['get', self.key(_key)]; });

  self.client.multi(commands).exec(function(err, responses) {
    responses = responses.map(function(response) {
      try {
        return JSON.parse(response);
      } catch (e) {
        return null;
      }
    });

    var result = responses.map(function(response) { return (!response ? null : response); });

    if (Object.isFunction(callback)) callback(err, result, responses);
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
RedisStorage.prototype.del = function(key) {
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
  var commands = keys.map(function(_key, i) { return ['del', self.key(_key)]; });

  self.client.multi(commands).exec(function(err, responses) {
    responses = responses.map(function(res) {
      try {
        return JSON.parse(res);
      } catch (e) {
        return null;
      }
    });

    var result = responses.map(function(response) { return (parseInt(response) > 0); });

    if (Object.isFunction(callback)) callback(err, result, responses);
  });
};

// #delete (key, [options], callback)
// #delete (keys, [options], callback)
RedisStorage.prototype.delete = RedisStorage.prototype.del;

// #end ()
RedisStorage.prototype.end = function() {
  var self = this;
  self.client.end();
};

// -----------------------
//  Export
// --------------------

module.exports = RedisStorage;
