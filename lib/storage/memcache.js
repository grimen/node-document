require('sugar');
var util = require('util'),
    Storage = require('./');

// -----------------------
//  DOCS
// --------------------
//  - https://github.com/3rd-Eden/node-memcached

// -----------------------
//  TODO
// --------------------
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

  self.options.server.db = self.options.server.db.replace(/^\//, '');

  var auth = [
        self.options.server.username,
        self.options.server.password
      ].compact().join(':');

  var domain_and_port = [
        self.options.server.hostname,
        self.options.server.port
      ].compact().join(':');

  self.options.server.endpoint = auth.isBlank() ? domain_and_port : [auth, domain_and_port].join('@');
}

util.inherits(Memcache, Storage);

// -----------------------
//  Class
// --------------------

Memcache.defaults = {
  url: process.env.MEMCACHE_URL || 'memcache://localhost:11211/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    client: {
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

// -----------------------
//  Instance
// --------------------

// #connect ()
Memcache.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    var memcached = require('memcached');

    self.client = new memcached(self.options.server.endpoint, self.options.server);

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
  });
};

// #key (key)
Memcache.prototype.key = function(key) {
  var self = this;
  var _key = [self.options.server.db, key].join('/');
  return _key;
};

// #set (key, value, callback)
// #set (keys, values, callback)
Memcache.prototype.set = function() {
  var self = this;

  self._set(arguments, function(key_values, options, done, next) {
    key_values.each(function(key, value) {
      self.client.set(key, value, 0, function(err, response) {
        next(key, err, !err, response);
      });
    });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
Memcache.prototype.get = function() {
  var self = this;

  self._get(arguments, function(keys, options, done, next) {
    self.client.get(keys, function(err, responses) {
      var result,
          results = [],
          errors = [];

      keys.each(function(key) {
        result = responses[key] || null;
        results.push(result);
        errors.push(err);
      });

      done(err, results, responses);
    });
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
Memcache.prototype.del = function() {
  var self = this;

  self._del(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client.del(key, function(err, response) {
        next(key, err, response, response);
      });
    });
  });
};

// #exists (key, [options], callback)
// #exists (keys, [options], callback)
Memcache.prototype.exists = function() {
  var self = this;

  self._exists(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      // HACK: Try to append `NULL` to KEY; if the key exists this operation returns TRUE, otherwise FALSE.
      self.client.append(key, null, function(err, response) {
        next(key, err, response, response);
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
