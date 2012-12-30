require('sugar');
var util = require('util'),
    Storage = require('./');

// == DOCS:
//  - https://github.com/LearnBoost/knox

// -----------------------
//  Constructor
// --------------------

// new AmazonS3 ();
// new AmazonS3 (options);
// new AmazonS3 (url);
// new AmazonS3 (url, options);
function AmazonS3 () {
  var self = this;

  self.klass = AmazonS3;
  self.klass.super_.apply(self, arguments);

  self.options.client.key = self.options.client.auth.username;
  self.options.client.secret = self.options.client.auth.password;
  self.options.client.secure = (self.options.client.protocol === 'https');
  self.options.client.bucket = self.options.client.db.replace(/^\//, '');
  // self.options.client.region = 'us-standard'; // TODO: Try extract from '*.s3-<region>.amasonaws.com'
  // self.options.client.endpoint = self.options.client.hostname; // TODO: Try extract from '<bucket>.s3-*.amasonaws.com'
  self.options.client.port = self.options.client.port || (self.options.client.secret ? 443 : 80);
}

util.inherits(AmazonS3, Storage);

// -----------------------
//  Class
// --------------------

AmazonS3.defaults = {
  url: process.env.AMAZON_S3_URL || 'https://s3.amazonaws.com/{db}-{env}'.assign({db: 'node-document-default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    client: {
      agent: undefined
    },
    headers: {
      set: {
        'Content-Type': 'application/json',
        'x-amz-acl': 'private'
      },
      get: {
        'Content-Type': 'application/json'
      },
      del: {
        'Content-Type': 'application/json'
      }
    },
    extension: '.json'
  }
};

AmazonS3.url = AmazonS3.defaults.url;
AmazonS3.options = AmazonS3.defaults.options;

AmazonS3.reset = Storage.reset;

// REFACTOR: extend()
AmazonS3.events = new Storage.EventEmitter();
AmazonS3.emit = Storage.emit;
AmazonS3.on = Storage.on;
AmazonS3.off = Storage.off;

// -----------------------
//  Instance
// --------------------

// #connect ()
AmazonS3.prototype.connect = function() {
  var self = this;

  if (self.ready || self.connecting) {
    return;
  }

  self.emit('connect');

  try {
    self.client = require('knox').createClient(self.options.client);

    self.client
      .get('/node-document-auth')
      .on('response', function(res) {
        var err = (res.statusCode >= 400 && res.statusCode !== 404) ? res : null;

        self.authorized = !err;

        if (err) {
          self.emit('error', err);
        }
        self.emit('ready', err);
      })
      .end();

  } catch (err) {
    self.emit('error', err);
  }
};

// #key (key)
AmazonS3.prototype.key = function(key) {
  var self = this;
  return '/' + key + self.options.extension;
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
AmazonS3.prototype.set = function() {
  var self = this;

  self.command('set', arguments, 4, function(keys, values, options, callback) {

    keys = Array.create(keys).map(function(k) { return self.key(k); });
    values = Array.create(values).map(function(v) { return self.pack(v); });

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
      var headers = JSON.parse(JSON.stringify(Object.merge(self.options.headers.set, {'Content-Length': value.length}, true, false))); // NOTE: Sugar.js-Object fails.

      self.client
        .put(key, headers)
        .on('response', function(response) {
          var error, result;

          response.setEncoding('utf8');

          // response.on('data', function(data) {
          //   result += data;
          // });

          response.on('error', function(err) {
            error = err;
          });

          response.on('end', function() {
            result = (response.statusCode < 400);

            res[key] = {error: error, result: result, response: response};
            next();
          });
        })
        .end(value, 'utf8');
    });

  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
AmazonS3.prototype.get = function() {
  var self = this;

  self.command('get', arguments, 3, function(keys, options, callback) {

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
      self.client
        .get(key, self.options.headers.get)
        .on('response', function(response) {
          var error, result = '';

          response.setEncoding('utf8');

          response.on('data', function(data) {
            result += data;
          });

          response.on('error', function(err) {
            error = err
          });

          response.on('end', function() {
            if (response.statusCode >= 400) {
              error = '' + result;
              result = null;
            } else {
              result = self.unpack(result);
            }
            res[key] = {error: error, result: result, response: response};
            next();
          });
        })
        .end();
    });

  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
AmazonS3.prototype.del = function() {
  var self = this;

  self.command('del', arguments, 3, function(keys, options, callback) {

    var original_keys = Array.create(keys);

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

    keys.each(function(key, i) {
      // NOTE: Need to check if item exists for proper response statuses as Amazon don't provide this information.
      self.get(original_keys[i], function(get_error, get_result, get_response) {
        var exists = (get_response && get_response[0] && get_response[0].statusCode !== 404)

        if (!exists) {
          res[key] = {error: get_error, result: false, response: get_response};
          next();
          return;
        }

        self.client
          .del(key, self.options.headers.del)
          .on('response', function(response) {
            var error, result;

            response.setEncoding('utf8');

            // response.on('data', function(data) {
            //   result += data;
            // });

            response.on('error', function(err) {
              error = err;
            });

            response.on('end', function() {
              if (error) {
                res[key] = {error: error, result: false, response: response};
                next();
                return;
              }

              result = (response.statusCode < 400);

              res[key] = {error: error, result: result, response: response};
              next();
            });
          })
          .end();
      });
    });

  });
};

// #end ()
AmazonS3.prototype.end = function() {};

// #pack ()
AmazonS3.prototype.pack = JSON.stringify;

// #unpack ()
AmazonS3.prototype.unpack = JSON.parse;

// -----------------------
//  Export
// --------------------

module.exports = AmazonS3;
