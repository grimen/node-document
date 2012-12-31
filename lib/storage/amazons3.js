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

  self.options.server.key = self.options.server.auth.username;
  self.options.server.secret = self.options.server.auth.password;
  self.options.server.secure = (self.options.server.protocol === 'https');
  self.options.server.bucket = self.options.server.db.replace(/^\//, '');
  // self.options.server.region = 'us-standard'; // TODO: Try extract from '*.s3-<region>.amasonaws.com'
  // self.options.server.endpoint = self.options.server.hostname; // TODO: Try extract from '<bucket>.s3-*.amasonaws.com'
  self.options.server.port = self.options.server.port || (self.options.server.secret ? 443 : 80);
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

// -----------------------
//  Instance
// --------------------

// #connect ()
AmazonS3.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    var knox = require('knox');

    self.client = knox.createClient(self.options.server);

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
  });
};

// #key (key)
AmazonS3.prototype.key = function(key) {
  var self = this;
  var _key = '/' + key + self.options.extension;
  return _key;
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
AmazonS3.prototype.set = function() {
  var self = this;

  self._set(arguments, function(key_values, options, done, next) {
    key_values.each(function(key, value) {
      var headers = JSON.parse(JSON.stringify(Object.merge(self.options.headers.set, {'Content-Length': value.length}, true, false))); // NOTE: Sugar.js-Object fails.

      self.client
        .put(key, headers)
        .on('response', function(response) {
          var error, result;

          response.setEncoding('utf8');

          response.on('error', function(err) {
            error = err;
          });

          response.on('end', function() {
            result = (response.statusCode < 400);

            next(key, error, result, response);
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

  self._get(arguments, function(keys, options, done, next) {
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
            error = err;
          });

          response.on('end', function() {
            if (response.statusCode >= 400) {
              error = '' + result;
              result = null;
            }
            next(key, error, result, response);
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

  self._del(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client
        .get(key, self.options.headers.get)
        .on('response', function(_response) {
          var _error, _result = '';

          _response.setEncoding('utf8');

          _response.on('data', function(data) {
            _result += data;
          });

          _response.on('error', function(err) {
            _error = err;
          });

          _response.on('end', function() {
            if (_response.statusCode === 404) {
              next(key, _error, false, _response);
              return;
            }

            self.client
              .del(key, self.options.headers.del)
              .on('response', function(response) {
                var error, result;

                response.setEncoding('utf8');

                response.on('error', function(err) {
                  error = err;
                });

                response.on('end', function() {
                  if (error) {
                    next(key, error, false, response);
                    return;
                  }

                  result = (response.statusCode < 400);

                  next(key, error, result, response);
                });
              })
              .end();
          });
        })
        .end();
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
