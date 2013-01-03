require('sugar');
var fun = require('funargs'),
    util = require('util'),
    Storage = require('./');

// -----------------------
//  DOCS
// --------------------
//  - https://github.com/mongodb/node-mongodb-native

// -----------------------
//  Constructor
// --------------------

// new MongoDB ();
// new MongoDB (options);
// new MongoDB (url);
// new MongoDB (url, options);
function MongoDB () {
  var self = this;

  self.klass = MongoDB;
  self.klass.super_.apply(self, arguments);

  self.options.server.db = self.options.server.db.replace(/^\//, '');
}

util.inherits(MongoDB, Storage);

// -----------------------
//  Class
// --------------------

MongoDB.defaults = {
  url: process.env.MONGODB_URL || 'mongodb://localhost:27017/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    db: {
      w: undefined,
      fsync: false,
      journal: false,
      readPreference: undefined,
      native_parser: false,
      forceServerObjectId: false,
      pkFactory: undefined,
      serializeFunctions: false,
      raw: false,
      recordQueryStats: false,
      retryMiliSeconds: undefined,
      numberOfRetries: 2
    },
    server: {
      auto_reconnect: true
    }
  }
};

MongoDB.url = MongoDB.defaults.url;
MongoDB.options = MongoDB.defaults.options;

MongoDB.reset = Storage.reset;

// -----------------------
//  Instance
// --------------------

// #connect ()
MongoDB.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    var mongodb = require('mongodb');

    mongodb.MongoClient.connect(self.url, self.options, function(err, client) {
      self.client = client;

      if (err) {
        self.emit('error', err);
        self.emit('ready', err);

      } else {
        self.client.command({ping: 1}, {}, function(err, reply) {
          self.authorized = !err;

          if (err || !reply.ok) {
            self.emit('error', err);
          }
          self.emit('ready', err);
        });
      }
    });
  });
};

// #key (key)
MongoDB.prototype.key = function(key) {
  var key_parts = key.split('/').map(function(v) { return Object.isNumber(v) ? ('' + v) : v; });
  var _key = {type: key_parts[0], id: key_parts[1], key: key};
  return _key;
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
MongoDB.prototype.set = function() {
  var self = this;

  self._set(arguments, function(key_values, options, done, next) {
    key_values.each(function(key, value) {
      var _key = self.key(key);

      value = value || {};
      value._id = _key.id;

      self.client.collection(_key.type, function(err, collection) {
        collection.update({_id: _key.id}, value, {upsert: true, safe: true}, function(err, count, response) {
          next(key, err, !!response && !!response.ok, response);
        });
      });
    });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
MongoDB.prototype.get = function() {
  var self = this;

  self._get(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      var _key = self.key(key);

      self.client.collection(_key.type, function(err, collection) {
        collection.find({_id: _key.id}).toArray(function(err, response) {
          next(key, err, response[0], response);
        });
      });
    });
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
MongoDB.prototype.del = function() {
  var self = this;

  self._del(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      var _key = self.key(key);

      self.client.collection(_key.type, function(err, collection) {
        collection.remove({_id: _key.id}, {safe: true}, function(err, response) {
          next(key, err, (response > 0), response);
        });
      });
    });
  });
};

// #exists (key, [options], callback)
// #exists (keys, [options], callback)
MongoDB.prototype.exists = function() {
  var self = this;

  self._exists(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      var _key = self.key(key);

      self.client.collection(_key.type, function(err, collection) {
        collection.find({_id: _key.id}).count(function (err, response) {
          next(key, err, (response > 0), response);
        });
      });
    });
  });
};

// #end ()
MongoDB.prototype.end = function() {
  var self = this;

  if (self.client) {
    self.client.close();
  }
};

// -----------------------
//  Export
// --------------------

module.exports = MongoDB;
