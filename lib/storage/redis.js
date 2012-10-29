require('sugar')
var url = require('url'),
    helpers = require('../helpers'),
    inspect = helpers.inspect,
    debug = console.log,

    redis = require('redis');

var Storage = require('./');

// == DOCS:
//  - https://github.com/mranney/node_redis

// -----------------------
//  Constructor
// --------------------

function RedisStorage (options) {
  var endpoint_url = process.env.REDIS_URL || RedisStorage.url,
      endpoint = url.parse(endpoint_url);

  this.constructor(options);

  var defaults = Object.extended({
    hostname: endpoint.hostname,
    port: endpoint.port,
    username: endpoint.auth && endpoint.auth.split(':')[0],
    password: endpoint.auth && endpoint.auth.split(':')[1],
    settings: {
      parser: 'hiredis',
      return_buffers: false,
      detect_buffers: false,
      socket_nodelay: true,
      no_ready_check: false
    },
    db: endpoint.pathname.replace(/^\//, '')
  });
  options = defaults.merge(options);

  this.client = redis.createClient(options.port, options.hostname, options.settings);
  this.client.auth(options.password);
  this.options = options

  if (process.env.NODE_ENV !== 'test')
    console.log("Redis.INIT: %s", endpoint_url);

  this.klass = this;
}

RedisStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

RedisStorage.url = 'redis://localhost:6379/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')});

// -----------------------
//  Instance
// --------------------

RedisStorage.prototype.key = function(key) {
  return [this.options.db, key].join('/');
};

// set(key, value, callback)
// set([key_1, key_2, ..., key_n], [value_1, value_2, ..., value_n], callback)
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

// get(key, callback)
// get([key_1, key_2, ..., key_n], callback)
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

// del(key, callback)
// del([key_1, key_2, ..., key_n], callback)
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

// delete(key, value, callback)
// delete(key, value, options, callback)
RedisStorage.prototype.delete = RedisStorage.prototype.del;

// end()
RedisStorage.prototype.end = function() {
  this.client.end();
};

module.exports = RedisStorage;
