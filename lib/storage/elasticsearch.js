require('sugar');
var fun = require('funargs'),
    util = require('util'),
    url = require('url'),
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

// new ElasticSearch ();
// new ElasticSearch (options);
// new ElasticSearch (url);
// new ElasticSearch (url, options);
function ElasticSearch () {
  var self = this;

  self.klass = ElasticSearch;
  self.klass.super_.apply(self, arguments);

  self.url = self.url || self.klass.url;

  var endpoint = url.parse(self.url);
  var defaults = {
    hostname: endpoint.hostname,
    port: parseInt(endpoint.port, 10),
    auth: endpoint.auth,
    // protocol: endpoint.protocol, // REVIEW: When present client throws error.
    db: endpoint.pathname.replace(/^\//, '')
  };

  self.options = Object.merge(self.klass.defaults.options, self.options, true, false);
  self.options = Object.merge(defaults, self.options, true, false);
}

util.inherits(ElasticSearch, Storage);

// -----------------------
//  Class
// --------------------

ElasticSearch.defaults = {
  url: process.env.ELASTICSEARCH_INDEX_URL || 'http://localhost:9200/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    curlDebug: false
  }
};

ElasticSearch.url = ElasticSearch.defaults.url;
ElasticSearch.options = ElasticSearch.defaults.options;

ElasticSearch.reset = Storage.reset;

// REFACTOR: extend()
ElasticSearch.events = new Storage.EventEmitter();
ElasticSearch.emit = Storage.emit;
ElasticSearch.on = Storage.on;
ElasticSearch.off = Storage.off;

// -----------------------
//  Instance
// --------------------

// #connect ()
ElasticSearch.prototype.connect = function() {
  var self = this;

  if (self.ready || self.connecting) {
    return;
  }

  self.emit('connect');

  try {
    self.client = new elastical.Client(self.options.hostname, self.options);

    // "Ping"
    self.client.deleteIndex('node-document-auth', function(err, data) {
      data = data || {};

      if (err && /IndexMissingException|404/.test(err.message)) {
        err = null;
      }

      self.authorized = !err && (data.status !== 401);

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
ElasticSearch.prototype.key = function(key) {
  var key_args = key.split('/').map(function(_key) { return Object.isNumber(_key) ? ('' + _key) : _key; });
  return {type: key_args[0], id: key_args[1]};
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
ElasticSearch.prototype.set = function(key, value) {
  var self = this;

  self.command('set', arguments, 4, function(key, value, options, callback) {

    var key_was_collection = Object.isArray(key),
        keys = key_was_collection ? key : [key];

    var value_was_collection = Object.isArray(value),
        values = value_was_collection ? value : [value];

    var key_values = Object.extended({});

    if (keys.length !== values.length) {
      throw new Error("Key/Value sizes must match.");
    }

    keys.each(function(key, i) {
      key_values[key] = values[i];
    });

    if (Object.isEmpty(options.id)) {
      delete options.id;
    }

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

  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
ElasticSearch.prototype.get = function(key) {
  var self = this;

  self.command('get', arguments, 3, function(key, options, callback) {

    var key_was_collection = Object.isArray(key),
        keys = key_was_collection ? key : [key];

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

  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
ElasticSearch.prototype.del = function(key) {
  var self = this;

  self.command('del', arguments, 3, function(key, options, callback) {

    var key_was_collection = Object.isArray(key),
        keys = key_was_collection ? key : [key];

    var responses = [],
        results = [],
        results_by_id = Object.extended({});

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

  });
};

// #end ()
ElasticSearch.prototype.end = function() {};

// -----------------------
//  Export
// --------------------

module.exports = ElasticSearch;
