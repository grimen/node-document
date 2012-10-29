require('sugar');
var url = require('url'),
    helpers = require('../helpers'),
    inspect = helpers.inspect,
    debug = console.log,

    mongodb = require('mongodb');

var Storage = require('./');

// == DOCS:
//  - https://github.com/mongodb/node-mongodb-native

// -----------------------
//  Constructor
// --------------------

function MongoDBStorage (options) {
  if (!this instanceof Storage) {
    this.constructor(options);
  }
  this.klass = MongoDBStorage;

  var endpoint_url = process.env.MONGODB_URL || this.klass.url,
      endpoint = url.parse(endpoint_url);

  var defaults = Object.extended({
    hostname: endpoint.hostname,
    port: parseInt(endpoint.port, 10),
    auth: endpoint.auth,
    protocol: endpoint.protocol,
    db: endpoint.pathname.replace(/^\//, '').replace('.', '_')
  });
  options = defaults.merge(options);
  options.ssl = (options.protocol === 'https');

  this.client = new mongodb.Db(options.db, new mongodb.Server(options.hostname, options.port, options), {safe:false});
  this.options = options;

  if (process.env.NODE_ENV !== 'test')
    console.log("MongoDBStorage.INIT: %s", endpoint_url);
}

MongoDBStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

MongoDBStorage.url = 'http://localhost:27017/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')});

// -----------------------
//  Instance
// --------------------

// WARN: Assumes the key format: ":type" or ":type/:id".
MongoDBStorage.prototype.key = function(key) {
  var key_args = key.split('/').map(function(_key) { return Object.isNumber(_key) ? ('' + _key) : _key; });
  return {type: key_args[0], id: key_args[1]};
};

// set(key, value, callback)
// set([key_1, key_2, ..., key_n], [value_1, value_2, ..., value_n], callback)
MongoDBStorage.prototype.set = function(key, value) {
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

  if (keys.length !== values.length)
    throw new Error("Key/Value sizes must match.");

  var key_values = Object.extended({});

  keys.each(function(key, i) {
    key_values[key] = values[i];
  });

  var responses = [],
      results = [],
      resource;

  self.client.open(function(err, db) {

    // NOTE: Bulk update not supported in MongoDB.
    key_values.each(function(_key, _value) {
      resource = self.key(_key);

      _value = _value || {};
      _value._id = resource.id;

      db.collection(resource.type, function(err, collection) {
        collection.update({_id:resource.id}, _value, {upsert:true, safe:true}, function(err, count, response) {
          var result = !!response.ok;

          results.push(result);
          responses.push(response);

          if (responses.length === keys.length) {
            db.close();
            if (Object.isFunction(callback)) callback(err, results, responses);
          }
        });
      });
    });

  });
};

// get(key, callback)
// get([key_1, key_2, ..., key_n], callback)
MongoDBStorage.prototype.get = function(key) {
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

  var responses = [],
      results = [],
      resource;

  self.client.open(function(err, db) {

    // NOTE: No bulk support yet.
    keys.each(function(_key) {
      resource = self.key(_key);

      db.collection(resource.type, function(err, collection) {
        collection.find({_id:resource.id}).toArray(function(err, response) {
          var result = response[0];

          results.push(result);
          responses.push(response);

          if (responses.length === keys.length) {
            db.close();

            if (Object.isFunction(callback)) callback(err, results, responses);
          }
        });
      });
    });

  });
};

// del(key, callback)
// del([key_1, key_2, ..., key_n], callback)
MongoDBStorage.prototype.del = function(key) {
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

  var responses = [],
      results = [],
      resource;

  self.client.open(function(err, db) {

    // NOTE: No bulk support yet.
    keys.each(function(_key) {
      resource = self.key(_key);

      db.collection(resource.type, function(err, collection) {
        collection.remove({_id:resource.id}, {safe:true}, function(err, response) {
          var result = (response > 0);

          results.push(result);
          responses.push(response);

          if (responses.length === keys.length) {
            db.close();

            if (Object.isFunction(callback)) callback(err, results, responses);
          }
        });
      });
    });

  });
};

// delete(key, value, callback)
// delete(key, value, options, callback)
MongoDBStorage.prototype.delete = MongoDBStorage.prototype.del;

// end()
MongoDBStorage.prototype.end = function() {

};

module.exports = MongoDBStorage;
