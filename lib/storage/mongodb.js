require('sugar');
var fun = require('funargs'),
    util = require('util'),
    Storage = require('./');

// == DOCS:
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

  self.options.client.db = self.options.client.db.replace(/^\//, '');
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

// REFACTOR: extend()
MongoDB.events = new Storage.EventEmitter();
MongoDB.emit = Storage.emit;
MongoDB.on = Storage.on;
MongoDB.off = Storage.off;

// -----------------------
//  Instance
// --------------------

// #connect ()
MongoDB.prototype.connect = function() {
  var self = this;

  if (self.ready || self.connecting) {
    return;
  }

  self.emit('connect');

  try {
    require('mongodb').MongoClient.connect(self.url, self.options, function(err, client) {
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

  } catch (err) {
    self.emit('error', err);
  }
};

// #key (key)
MongoDB.prototype.key = function(key) {
  key = key.split('/').map(function(v) { return Object.isNumber(v) ? ('' + v) : v; });
  return {type: key[0], id: key[1]};
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
MongoDB.prototype.set = function() {
  var self = this;

  self.command('set', arguments, 4, function(keys, values, options, callback) {

    keys = Array.create(keys);
    values = Array.create(values);

    if (keys.length !== values.length) {
      throw new Error("Key/Value sizes must match.");
    }

    var key_values = Object.extended({});

    keys.each(function(k, i) {
      key_values[k] = values[i];
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
      var resource = self.key(key);

      value = value || {};
      value._id = resource.id;

      self.client.collection(resource.type, function(err, collection) {
        collection.update({_id: resource.id}, value, {upsert: true, safe: true}, function(err, count, response) {
          res[key] = {error: err, result: !!response.ok, response: response};
          next();
        });
      });
    });

  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
MongoDB.prototype.get = function() {
  var self = this;

  self.command('get', arguments, 3, function(keys, options, callback) {

    keys = Array.create(keys);

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
      var resource = self.key(key);

      self.client.collection(resource.type, function(err, collection) {
        collection.find({_id: resource.id}).toArray(function(err, response) {
          res[key] = {error: err, result: response[0], response: response};
          next();
        });
      });
    });

  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
MongoDB.prototype.del = function() {
  var self = this;

  self.command('del', arguments, 3, function(keys, options, callback) {

    keys = Array.create(keys);

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
      var resource = self.key(key);

      self.client.collection(resource.type, function(err, collection) {
        collection.remove({_id: resource.id}, {safe: true}, function(err, response) {
          res[key] = {error: err, result: (response > 0), response: response};
          next();
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
