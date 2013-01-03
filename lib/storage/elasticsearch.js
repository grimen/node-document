require('sugar');
var util = require('util'),
    Storage = require('./');

// -----------------------
//  DOCS
// --------------------
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

  self.options.server.db = self.options.server.db.replace(/^\//, '');

  var auth = [
        self.options.server.username,
        self.options.server.password
      ].compact().join(':');

  self.options.server.auth = auth;
  self.options.server.protocol = undefined;
}

util.inherits(ElasticSearch, Storage);

// -----------------------
//  Class
// --------------------

ElasticSearch.defaults = {
  url: process.env.ELASTICSEARCH_INDEX_URL || 'http://localhost:9200/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    client: {
      curlDebug: false
    }
  }
};

ElasticSearch.url = ElasticSearch.defaults.url;
ElasticSearch.options = ElasticSearch.defaults.options;

ElasticSearch.reset = Storage.reset;

// -----------------------
//  Instance
// --------------------

// #connect ()
ElasticSearch.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    var elastical = require('elastical');

    self.client = new elastical.Client(self.options.server.hostname, self.options.server);

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
  });
};

// #key (key)
ElasticSearch.prototype.key = function(key) {
  var key_parts = key.split('/').map(function(_key) { return Object.isNumber(_key) ? ('' + _key) : _key; });
  var _key = {type: key_parts[0], id: key_parts[1], key: key};
  return _key;
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
ElasticSearch.prototype.set = function() {
  var self = this;

  self._set(arguments, function(key_values, options, done, next) {
    if ((options.id || '').isBlank()) {
      delete options.id;
    }

    options = Object.extended({
      create: false // => "create OR update"
    }).merge(options || {});

    var commands = Object.keys(key_values).map(function(k) {
      var resource = self.key(k);
      return {index: options.merge({index: self.options.server.db, type: resource.type, id: resource.id, data: key_values[k]})};
    });

    self.client
      .bulk(commands, function(err, response) {
        var errors = [], results = [], responses = Array.create(response.items);

        key_values.each(function() {
          errors.push(err);
        });

        results = responses.map(function(response) {
          var result = ((err || !(response['index'] || response['create']) || !(response['index'] || response['create']).ok) ? false : true);
          return result;
        });

        done(errors, results, responses);
      });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
ElasticSearch.prototype.get = function() {
  var self = this;

  // TODO: Review bulk (multi-get): http://www.elasticsearch.org/guide/reference/api/multi-get.html

  self._get(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      var resource = self.key(key);

      options = options.merge({type: (resource.type || '_all'), ignoreMissing: true});

      self.client.get(self.options.server.db, resource.id, options, function(error, result, response) {
        next(key, error, result, response);
      });
    });
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
ElasticSearch.prototype.del = function() {
  var self = this;

  // TODO: Figure out how to get status for bulk deletes, i.e. "response.found" - now not using bulk command because of this.

  self._del(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      var resource = self.key(key);

      options = options.merge({ignoreMissing: true});

      self.client.delete(self.options.server.db, (resource.type || '_all'), resource.id, options, function(error, response) {
        var result = ((error || !response.found) ? false : true);

        next(key, error, result, response);
      });
    });
  });
};

// #exists (key, [options], callback)
// #exists (keys, [options], callback)
ElasticSearch.prototype.exists = function() {
  var self = this;

  // REVIEW: Bulk command supporting `count`?

  // NOTE: `self.client.count` don't seem to behave.

  self._exists(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      var resource = self.key(key);

      options = options.merge({type: (resource.type || '_all'), ignoreMissing: true});

      self.client.get(self.options.server.db, resource.id, options, function(error, result, response) {
        next(key, error, response.exists, response);
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
