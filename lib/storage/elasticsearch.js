require('sugar');
var util = require('util'),
    Storage = require('./');

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

  self.options.client.db = self.options.client.db.replace(/^\//, '');

  var auth = [
        self.options.client.username,
        self.options.client.password
      ].compact().join(':');

  self.options.client.auth = auth;
  self.options.client.protocol = undefined;
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
    self.client = new (require('elastical')).Client(self.options.client.hostname, self.options.client);

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
ElasticSearch.prototype.set = function() {
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

    if ((options.id || '').isBlank()) {
      delete options.id;
    }

    var commands = keys.map(function(k) {
      var key = self.key(k);

      options = Object.extended({
        create: false // => "create OR update"
        // refresh: true
      }).merge(options || {});

      return {'index': options.merge({index: self.options.client.db, type: key.type, id: key.id, data: key_values[k]})};
    });

    var responses = [],
        results = [];

    self.client.bulk(commands, function(err, response) {
      responses = Array.create(response.items);

      results = responses.map(function(response) {
        var result = ((err || !(response['index'] || response['create']) || !(response['index'] || response['create']).ok) ? false : true);
        return result;
      });

      callback(err, results, responses);
    });

  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
ElasticSearch.prototype.get = function() {
  var self = this;

  self.command('get', arguments, 3, function(keys, options, callback) {

    keys = Array.create(keys);

    var responses = [],
        results = [],
        results_by_id = Object.extended({});

    var ids = keys.map(function(k) { return self.key(k).id; });

    // REFACTOR: See MemoryStorage.get
    // TODO: Review bulk (multi-get): http://www.elasticsearch.org/guide/reference/api/multi-get.html

    keys.each(function(key) {
      key = self.key(key);

      options = options.merge({type: key.type || '_all', ignoreMissing: true});

      self.client.get(self.options.client.db, key.id, options, function(err, data, response) {
        var result = data;

        results_by_id[key.id] = {err: err, result: result, response: response};

        if (results_by_id.keys().length === keys.length) {
          // NOTE: Get responses in requested order.
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
ElasticSearch.prototype.del = function() {
  var self = this;

  self.command('del', arguments, 3, function(keys, options, callback) {

    keys = Array.create(keys);

    var responses = [],
        results = [],
        results_by_id = Object.extended({});

    var ids = keys.map(function(k) {
      var id = self.key(k).id;

      if ((id || '').isBlank()) {
        throw new Error("Invalid ID: " + id);
      }

      return id;
    });

    // TODO: Figure out how to get status for bulk deletes, i.e. "response.found" - now not using bulk command because of this.

    keys.each(function(key) {
      key = self.key(key);

      options = options.merge({ignoreMissing: true});

      self.client.delete(self.options.client.db, (key.type || '_all'), key.id, options, function(err, response) {
        var result = ((err || !response.found) ? false : true);

        results_by_id[key.id] = {err: err, result: result, response: response};

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
