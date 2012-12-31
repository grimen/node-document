require('sugar')
var fun = require('funargs'),
    util = require('util'),
    Storage = require('./');

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

  self.options.server.db = self.options.server.db.replace(/^\//, '');
}

util.inherits(Redis, Storage);

// -----------------------
//  Class
// --------------------

Redis.defaults = {
  url: process.env.REDIS_URL || 'redis://localhost:6379/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    client: {
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

// -----------------------
//  Instance
// --------------------

// #connect ()
Redis.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    var redis = require('redis');

    self.client = redis.createClient(self.options.server.port, self.options.server.hostname, self.options.server);

    if (self.options.server.password) {
      self.client.auth(self.options.server.password, function(err, reply) {
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
  });
};

// #key (key)
Redis.prototype.key = function(key) {
  var self = this;
  var _key = [self.options.server.db, key].join('/');
  return _key;
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
Redis.prototype.set = function() {
  var self = this;

  self._set(arguments, function(key_values, options, done, next) {
    var commands = Object.keys(key_values).map(function(k) { return ['set', k, key_values[k]]; });

    self.client
      .multi(commands)
      .exec(function(err, responses) {
        var errors = [], results = [];

        key_values.each(function() {
          errors.push(err);
        });

        results = responses.map(function(response) { return (response === 'OK' ? true : false); });

        done(errors, results, responses);
      });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
Redis.prototype.get = function() {
  var self = this;

  self._get(arguments, function(keys, options, done, next) {
    var commands = keys.map(function(k) { return ['get', k]; });

    self.client
      .multi(commands)
      .exec(function(err, responses) {
        var errors = [], results = [];

        keys.each(function() {
          errors.push(err);
        });

        results = responses.map(function(response) { return (!response ? null : response); });

        done(errors, results, responses);
      });
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
Redis.prototype.del = function() {
  var self = this;

  self._del(arguments, function(keys, options, done, next) {
    var commands = keys.map(function(k) { return ['del', k]; });

    self.client
      .multi(commands)
      .exec(function(err, responses) {
        var errors = [], results = [];

        keys.each(function() {
          errors.push(err);
        });

        results = responses.map(function(response) { return (parseInt(response) > 0); });

        done(errors, results, responses);
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
