require('sugar')
var fun = require('funargs'),
    util = require('util'),
    url = require('url'),
    Storage = require('./'),

    redis = require('redis');

// == DOCS:
//  - https://github.com/mranney/node_redis

// -----------------------
//  Constructor
// --------------------

// new Redis ();
// new Redis (options);
// new Redis (url);
// new Redis (url, options);
function Redis () {
  var self = this;

  self.klass = Redis;
  self.klass.super_.apply(self, arguments);

  var endpoint = url.parse(self.url);
  var options = {
    hostname: endpoint.hostname,
    port: parseInt(endpoint.port, 10),
    username: endpoint.auth && endpoint.auth.split(':')[0],
    password: endpoint.auth && endpoint.auth.split(':')[1],
    db: endpoint.pathname.replace(/^\//, '')
  };

  self.options = Object.merge(self.klass.defaults.options, self.options, true, false);
  self.options = Object.merge(options, self.options, true, false);
}

util.inherits(Redis, Storage);

// -----------------------
//  Class
// --------------------

Redis.defaults = {
  url: process.env.REDIS_URL || 'redis://localhost:6379/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
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

Redis.url = Redis.defaults.url;
Redis.options = Redis.defaults.options;

Redis.reset = Storage.reset;

// REFACTOR: extend()
Redis.events = new Storage.EventEmitter();
Redis.emit = Storage.emit;
Redis.on = Storage.on;
Redis.off = Storage.off;

// -----------------------
//  Instance
// --------------------

// #connect ()
Redis.prototype.connect = function() {
  var self = this;

  if (self.ready || self.connecting) {
    return;
  }

  self.emit('connect');

  try {
    self.client = redis.createClient(self.options.port, self.options.hostname, self.options.settings);

    if (self.options.password) {
      self.client.auth(self.options.password, function(err, reply) {
        self.authorized = !err && (reply === 'OK');

        self.emit('ready', err);
      });

    } else {
      self.client.ping(function(err) {
        self.authorized = !err;

        self.emit('ready', err);
      });
    }

    self.client.on('error', function(err) {
      self.emit('error', err);
      self.emit('ready', err);
    });

  } catch (err) {
    self.emit('error', err);
  }
};

// #key (key)
Redis.prototype.key = function(key) {
  var self = this;
  return [self.options.db, key].join('/');
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
Redis.prototype.set = function() {
  var self = this;

  self.command('set', arguments, 4, function(key, value, options, callback) {

    var key_was_collection = Object.isArray(key),
        keys = key_was_collection ? key : [key];

    var value_was_collection = Object.isArray(value),
        values = value_was_collection ? value : [value];

    values = values.map(function(v) { return self.pack(v); });

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

  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
Redis.prototype.get = function(key) {
  var self = this;

  self.command('get', arguments, 3, function(key, options, callback) {

    var key_was_collection = Object.isArray(key),
        keys = key_was_collection ? key : [key];

    var commands = keys.map(function(k) { return ['get', self.key(k)]; });

    self.client.multi(commands).exec(function(err, responses) {
      responses = responses.map(function(response) {
        try {
          return self.unpack(response);
        } catch (e) {
          return null;
        }
      });

      var result = responses.map(function(response) { return (!response ? null : response); });

      callback(err, result, responses);
    });

  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
Redis.prototype.del = function(key) {
  var self = this;

  self.command('del', arguments, 3, function(key, options, callback) {

    var key_was_collection = Object.isArray(key),
        keys = key_was_collection ? key : [key];

    var commands = keys.map(function(k) { return ['del', self.key(k)]; });

    self.client.multi(commands).exec(function(err, responses) {
      responses = responses.map(function(res) {
        try {
          return self.unpack(res);
        } catch (e) {
          return null;
        }
      });

      var result = responses.map(function(response) { return (parseInt(response) > 0); });

      callback(err, result, responses);
    });

  });
};

// #end ()
Redis.prototype.end = function() {
  var self = this;

  if (self.client) {
    self.client.end();
  }
};

// #pack (object)
Redis.prototype.pack = JSON.stringify;

// #unpack (json)
Redis.prototype.unpack = JSON.parse;

// -----------------------
//  Export
// --------------------

module.exports = Redis;
