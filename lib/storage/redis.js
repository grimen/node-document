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
  var self = this;

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

  self.authorized = false;

  try {
    this.client = redis.createClient(this.options.port, this.options.hostname, this.options.settings);

    if (this.options.password) {
      this.client.auth(this.options.password, function(err, reply) {
        self.authorized = !err && (reply === 'OK');

        self.klass.emit('ready', err, reply);
        self.emit('ready', err, reply);
      });
    } else {
      this.client.ping(function(err, reply) {
        self.authorized = !err;

        self.klass.emit('ready', err, reply);
        self.emit('ready', err, reply);
      });
    }

    this.client.on('error', function(err) {
      self.klass.emit('ready', err);
      self.klass.emit('error', err);
      self.emit('ready', err);
      self.emit('error', err);
    });

    // NOTE: If no listeners are registered `EventEmitter` throws error by default.
    self.klass.on('error', function() {});
    self.on('error', function() {});

  } catch (err) {
    throw new Error(err); // REVIEW: `emit('error', err)`
  }
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
      no_ready_check: true
    }
  }
};

RedisStorage.url = RedisStorage.defaults.url;
RedisStorage.options = RedisStorage.defaults.options;

RedisStorage.reset = Storage.reset;

// REFACTOR: extend()
RedisStorage.events = new Storage.EventEmitter();
RedisStorage.emit = Storage.emit;
RedisStorage.on = Storage.on;
RedisStorage.off = Storage.off;

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

  callback = callback || function() {};

  try {
    if (!self.authorized) {
      // NOTE: The `redis` client fails with "never-ending-async-call" when not authorized, so...
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    var value_was_collection = Object.isArray(value),
        values = value_was_collection ? value : [value];

    values = values.map(function(v) { return JSON.stringify(v); });

    if (keys.length !== values.length) {
      throw new Error("Key/Value sizes must match.");
    }

    var key_values = Object.extended({});

    keys.each(function(key, i) {
      key_values[key] = values[i];
    });

    var commands = keys.map(function(k, i) { return ['set', self.key(k), values[i]]; });

    self.client.multi(commands).exec(function(err, responses) {
      var result = responses.map(function(response) { return (response === 'OK' ? true : false); });

      callback(err, result, responses);
    });

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
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

  callback = callback || function() {};

  try {
    if (!self.authorized) {
      // NOTE: The `redis` client fails with "never-ending-async-call" when not authorized, so...
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];
    var commands = keys.map(function(k) { return ['get', self.key(k)]; });

    self.client.multi(commands).exec(function(err, responses) {
      responses = responses.map(function(response) {
        try {
          return JSON.parse(response);
        } catch (e) {
          return null;
        }
      });

      var result = responses.map(function(response) { return (!response ? null : response); });

      callback(err, result, responses);
    });

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
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

  callback = callback || function() {};

  try {
    if (!self.authorized) {
      // NOTE: The `redis` client fails with "never-ending-async-call" when not authorized, so...
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];
    var commands = keys.map(function(k) { return ['del', self.key(k)]; });

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

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
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
