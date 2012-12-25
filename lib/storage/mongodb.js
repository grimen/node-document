require('sugar');
var fun = require('funargs'),
    util = require('util'),
    url = require('url'),
    Storage = require('./'),

    mongodb = require('mongodb');

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

  var endpoint = url.parse(self.url);
  var options = {
    hostname: endpoint.hostname,
    port: parseInt(endpoint.port, 10),
    auth: endpoint.auth,
    protocol: endpoint.protocol,
    db: endpoint.pathname.replace(/^\//, '').replace('.', '_')
  };

  self.options = Object.merge(self.klass.defaults.options, self.options, true, false);
  self.options = Object.merge(options, self.options, true, false);
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

  } catch (err) {
    self.emit('error', err);
  }
};

// #key (key)
MongoDB.prototype.key = function(key) {
  var key_args = key.split('/').map(function(_key) { return Object.isNumber(_key) ? ('' + _key) : _key; });
  return {type: key_args[0], id: key_args[1]};
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
MongoDB.prototype.set = function(key, value) {
  var self = this, options, callback;

  if (Object.isObject(arguments[2])) {
    options = arguments[2];
    callback = arguments[3];
  } else {
    options = {};
    callback = arguments[2];
  }

  callback = callback || function() {};

  self.emit('command', 'set', fun(arguments));

  if (!self.ready) {
    self.connect();
    return false;
  }

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    var value_was_collection = Object.isArray(value),
        values = value_was_collection ? value : [value];

    if (keys.length !== values.length) {
      throw new Error("Key/Value sizes must match.");
    }

    var key_values = Object.extended({});

    keys.each(function(key, i) {
      key_values[key] = values[i];
    });

    var responses = [],
        results = [],
        resource;

    // NOTE: Bulk update not supported in MongoDB.
    key_values.each(function(_key, _value) {
      resource = self.key(_key);

      _value = _value || {};
      _value._id = resource.id;

      self.client.collection(resource.type, function(err, collection) {
        collection.update({_id:resource.id}, _value, {upsert:true, safe:true}, function(err, count, response) {
          var result = !!response.ok;

          results.push(result);
          responses.push(response);

          if (responses.length === keys.length) {
            callback(err, results, responses);
          }
        });
      });
    });

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
MongoDB.prototype.get = function(key) {
  var self = this, options, callback;

  if (Object.isObject(arguments[1])) {
    options = arguments[1];
    callback = arguments[2];
  } else {
    options = {};
    callback = arguments[1];
  }

  callback = callback || function() {};

  self.emit('command', 'get', fun(arguments));

  if (!self.ready) {
    self.connect();
    return false;
  }

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    var responses = [],
        results = [],
        resource;

    // NOTE: No bulk support yet.
    keys.each(function(_key) {
      resource = self.key(_key);

      self.client.collection(resource.type, function(err, collection) {
        collection.find({_id:resource.id}).toArray(function(err, response) {
          var result = response[0];

          results.push(result);
          responses.push(response);

          if (responses.length === keys.length) {
            callback(err, results, responses);
          }
        });
      });
    });

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
MongoDB.prototype.del = function(key) {
  var self = this, options, callback;

  if (Object.isObject(arguments[1])) {
    options = arguments[1];
    callback = arguments[2];
  } else {
    options = {};
    callback = arguments[1];
  }

  callback = callback || function() {};

  self.emit('command', 'del', fun(arguments));

  if (!self.ready) {
    self.connect();
    return false;
  }

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    var responses = [],
        results = [],
        resource;

    // NOTE: No bulk support yet.
    keys.each(function(_key) {
      resource = self.key(_key);

      self.client.collection(resource.type, function(err, collection) {
        collection.remove({_id:resource.id}, {safe:true}, function(err, response) {
          var result = (response > 0);

          results.push(result);
          responses.push(response);

          if (responses.length === keys.length) {
            callback(err, results, responses);
          }
        });
      });
    });

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #delete (key, [options], callback)
// #delete (keys, [options], callback)
MongoDB.prototype.delete = MongoDB.prototype.del;

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
