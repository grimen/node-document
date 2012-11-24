require('sugar');
var url = require('url'),
    Storage = require('./'),

    elastical = require('elastical');

// == DOCS:
//  - https://github.com/rgrove/node-elastical

// -----------------------
//  TODO
// --------------------

//  - [REFACTOR]: Drop `elastical`, implement using `request` instead - simpler and less buggy code.

// -----------------------
//  Constructor
// --------------------

// new ElasticSearchStorage ();
// new ElasticSearchStorage (options);
// new ElasticSearchStorage (url);
// new ElasticSearchStorage (url, options);
function ElasticSearchStorage () {
  var self = this;

  this.constructor.apply(this, arguments);
  this.klass = ElasticSearchStorage;

  this.url = this.url || this.klass.url;

  var endpoint = url.parse(this.url);
  var defaults = {
    hostname: endpoint.hostname,
    port: parseInt(endpoint.port, 10),
    auth: endpoint.auth,
    // protocol: endpoint.protocol, // REVIEW: When present ElasticSearch throws error.
    db: endpoint.pathname.replace(/^\//, '')
  };

  this.options = Object.merge(this.klass.defaults.options, this.options, true, false);
  this.options = Object.merge(defaults, this.options, true, false);

  this.authorized = false;

  try {
    this.client = new elastical.Client(this.options.hostname, this.options);

    // NOTE: If no listeners are registered `EventEmitter` throws error by default.
    this.klass.on('error', function() {});
    this.on('error', function() {});

  } catch (err) {
    throw new Error(err); // REVIEW: `emit('error', err)`
  }

  // Check auth status -
  this.client.deleteIndex('node-document-auth', function(err, data) {
    data = data || {};

    if (err && /IndexMissingException|404/.test(err.message)) {
      err = null;
    }

    self.authorized = !err && (data.status !== 401);

    self.klass.emit('ready', err, self);
    self.emit('ready', err, self); // NOTE: Makes no sense on "self" when not async like Redis. =S

    if (err) {
      self.klass.emit('error', err, self);
      self.emit('error', err, self);
    }
  });
}

ElasticSearchStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

ElasticSearchStorage.defaults = {
  url: process.env.ELASTICSEARCH_INDEX_URL || 'http://localhost:9200/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    curlDebug: false
  }
};

ElasticSearchStorage.url = ElasticSearchStorage.defaults.url;
ElasticSearchStorage.options = ElasticSearchStorage.defaults.options;

ElasticSearchStorage.reset = Storage.reset;

// REFACTOR: extend()
ElasticSearchStorage.events = new Storage.EventEmitter();
ElasticSearchStorage.emit = Storage.emit;
ElasticSearchStorage.on = Storage.on;
ElasticSearchStorage.off = Storage.off;

// -----------------------
//  Instance
// --------------------

// #key (key)
ElasticSearchStorage.prototype.key = function(key) {
  var key_args = key.split('/').map(function(_key) { return Object.isNumber(_key) ? ('' + _key) : _key; });
  return {type: key_args[0], id: key_args[1]};
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
ElasticSearchStorage.prototype.set = function(key, value) {
  var self = this, options, callback;

  if (Object.isObject(arguments[2])) {
    options = Object.extended(arguments[2]);
    callback = arguments[3];
  } else {
    options = Object.extended({});
    callback = arguments[2];
  }

  callback = callback || function() {};

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    var value_was_collection = Object.isArray(value),
        values = value_was_collection ? value : [value];

    var key_values = Object.extended({});

    if (keys.length !== values.length) {
      throw new Error("Key/Value sizes must match.");
    }

    keys.each(function(key, i) {
      key_values[key] = values[i];
    });

    if (Object.isEmpty(options.id))
      delete options.id;

    var commands = keys.map(function(_key) {
      var resource = self.key(_key);
      options = Object.extended({
        create: false // => "create OR update"
        // refresh: true
      }).merge(options || {});
      return {'index': options.merge({index: self.options.db, type: resource.type, id: resource.id, data: key_values[_key]})};
    });

    self.client.bulk(commands, function(err, response) {
      var responses = Object.isArray(response.items) ? response.items : [];
      var results = responses.map(function(response) {
        var result = ((err || !(response['index'] || response['create']) || !(response['index'] || response['create']).ok) ? false : true);
        return result;
      });

      callback(err, results, responses);
    });

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
ElasticSearchStorage.prototype.get = function(key) {
  var self = this, options, callback;

  if (Object.isObject(arguments[1])) {
    options = Object.extended(arguments[1]);
    callback = arguments[2];
  } else {
    options = Object.extended({});
    callback = arguments[1];
  }

  callback = callback || function() {};

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    // TODO: Add "_mget" support to "node-elastical" - now not using bulk command because of this.
    //    - http://www.elasticsearch.org/guide/reference/api/multi-get.html

    var responses = [],
        results = [],
        results_by_id = Object.extended({}),
        ids = keys.map(function(_key) { return self.key(_key).id; });

    // REFACTOR: See MemoryStorage.get
    // TODO: Review bulk (multi-get)

    keys.each(function(_key) {
      var resource = self.key(_key);

      options = options.merge({type: resource.type || '_all', ignoreMissing: true});

      self.client.get(self.options.db, resource.id, options, function(err, data, response) {
        var result = data;

        results_by_id[resource.id] = {err: err, result: result, response: response};

        if (results_by_id.keys().length === keys.length) {
          // NOTE: To get responses in requested order.
          ids.each(function(id) {
            results.push(results_by_id[id].result);
            responses.push(results_by_id[id].response);
          });

          callback(err, results, responses);
        }
      });
    });

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
ElasticSearchStorage.prototype.del = function(key) {
  var self = this, options, callback;

  if (Object.isObject(arguments[1])) {
    options = Object.extended(arguments[1]);
    callback = arguments[2];
  } else {
    options = Object.extended({});
    callback = arguments[1];
  }

  callback = callback || function() {};

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    var key_was_collection = Object.isArray(key);
    var keys = key_was_collection ? key : [key];

    var responses = [],
        results = [],
        results_by_id = Object.extended({});

    // REFACTOR: See MemoryStorage.del

    var ids = keys.map(function(_key) {
      var id = self.key(_key).id;
      if (Object.isEmpty(id)) throw new Error("Invalid ID: " + id);
      return id;
    });

    // TODO: Figure out how to get status for bulk deletes, i.e. "response.found" - now not using bulk command because of this.

    keys.each(function(_key) {
      var resource = self.key(_key);

      options = options.merge({ignoreMissing: true});

      self.client.delete(self.options.db, (resource.type || '_all'), resource.id, options, function(err, response) {
        var result = ((err || !response.found) ? false : true);

        results_by_id[resource.id] = {err: err, result: result, response: response};

        if (results_by_id.keys().length === keys.length) {
          // NOTE: To get responses in requested order.
          ids.each(function(id) {
            results.push(results_by_id[id].result);
            responses.push(results_by_id[id].response);
          });

          callback(err, results, responses);
        }
      });
    });

  } catch (err) {
    results = keys.map(function() { return false; });

    self.emit('error', err);
    callback(err, results, responses);
  }
};

// #delete (key, [options], callback)
// #delete (keys, [options], callback)
ElasticSearchStorage.prototype.delete = ElasticSearchStorage.prototype.del;

// #end ()
ElasticSearchStorage.prototype.end = function() {};

// -----------------------
//  Export
// --------------------

module.exports = ElasticSearchStorage;
