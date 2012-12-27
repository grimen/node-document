require('sugar');
var fun = require('funargs'),
    util = require('util'),
    url = require('url'),
    Storage = require('./'),

    Memcached = require('memcached');

// == DOCS:
//  - https://github.com/3rd-Eden/node-memcached

// == REPLACE
//  - https://github.com/alevy/memjs (SASL-support)

// -----------------------
//  Constructor
// --------------------

// new Memcache ();
// new Memcache (options);
// new Memcache (url);
// new Memcache (url, options);
function Memcache () {
  var self = this;

  self.klass = Memcache;
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

  var auth = [self.options.username, self.options.password].compact().join(':'),
      domain_and_port = [self.options.hostname, self.options.port].compact().join(':');

  self.options.endpoint = (auth || '').isBlank() ? domain_and_port : [auth, domain_and_port].join('@');
}

util.inherits(Memcache, Storage);

// -----------------------
//  Class
// --------------------

Memcache.defaults = {
  url: process.env.MEMCACHE_URL || 'memcache://localhost:11211/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
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
    }
  }
};

Memcache.url = Memcache.defaults.url;
Memcache.options = Memcache.defaults.options;

Memcache.reset = Storage.reset;

// REFACTOR: extend()
Memcache.events = new Storage.EventEmitter();
Memcache.emit = Storage.emit;
Memcache.on = Storage.on;
Memcache.off = Storage.off;

// -----------------------
//  Instance
// --------------------

// #connect ()
Memcache.prototype.connect = function() {
  var self = this;

  if (self.ready || self.connecting) {
    return;
  }

  self.emit('connect');

  try {
    self.client = new Memcached(self.options.endpoint, self.options.settings);

    self.client.on('failure', function(err) {
      self.emit('error', err);
    });

    self.client.set('node-document-auth', 1, 10000, function(err) {
      self.authorized = !err;

      if (err) {
        self.emit('error', err);
      }
      self.emit('ready', err);
    });

  } catch (err) {
    self.emit('error', err);
  }
};

// #key (key)
Memcache.prototype.key = function(key) {
  var self = this;
  return [self.options.db, key].join('/');
};

// #set (key, value, callback)
// #set (keys, values, callback)
Memcache.prototype.set = function() {
  var self = this;

  self.command('set', arguments, 4, function(keys, values, options, callback) {

    keys = Array.create(keys).map(function(k) { return self.key(k); });
    values = Array.create(values).map(function(v) { return self.pack(v); });

    if (keys.length !== values.length) {
      throw new Error("Key/Value sizes must match.");
    }

    var key_values = Object.extended({});

    keys.each(function(key, i) {
      key_values[key] = values[i];
    });

    var errors = [],
        results = [],
        responses = [],
        res = Object.extended({});

    var next = function() {
      if (res.keys().length === keys.length) {
        keys.each(function(k) {
          errors.push(res[k].error);
          results.push(res[k].result);
          responses.push(res[k].response);
        });
        callback(errors, results, responses);
      }
    };

    key_values.each(function(key, value) {
      self.client.set(key, value, 0, function(err, response) {
        res[key] = {error: err, result: !err, response: response};
        next();
      });
    });

  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
Memcache.prototype.get = function() {
  var self = this;

  self.command('get', arguments, 3, function(keys, options, callback) {

    keys = Array.create(keys).map(function(k) { return self.key(k); });

    // Bulk API

    self.client.get(keys, function(err, responses) {
      var result,
          results = [];

      keys.each(function(key) {
        result = responses[key] || null;
        results.push(result);
      });

      results = results.map(function(result) {
        try {
          return self.unpack(result);
        } catch (e) {
          return null;
        }
      });

      callback(err, results, responses);
    });

  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
Memcache.prototype.del = function() {
  var self = this;

  self.command('del', arguments, 3, function(keys, options, callback) {

    keys = Array.create(keys).map(function(k) { return self.key(k); });

    var errors = [],
        results = [],
        responses = [],
        res = Object.extended({});

    var next = function() {
      if (res.keys().length === keys.length) {
        keys.each(function(k) {
          errors.push(res[k].error);
          results.push(res[k].result);
          responses.push(res[k].response);
        });

        callback(errors, results, responses);
      }
    };

    keys.each(function(key) {
      self.client.del(key, function(err, response) {
        res[key] = {error: err, result: response, response: response};
        next();
      });
    });

  });
};

// #end ()
Memcache.prototype.end = function() {
  var self = this;

  if (self.client) {
    self.client.end();
  }
};

// #pack (object)
Memcache.prototype.pack = JSON.stringify;

// #unpack (json)
Memcache.prototype.unpack = JSON.parse;

// -----------------------
//  Export
// --------------------

module.exports = Memcache;
