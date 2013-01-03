require('sugar');
var util = require('util'),
    path = require('path');
    Storage = require('./');

// -----------------------
//  DOCS
// --------------------
//  - http://nodejs.org/api/fs.html
//  - https://github.com/bpedro/node-fs

// -----------------------
//  Constructor
// --------------------

// new FileSystem ();
// new FileSystem (options);
// new FileSystem (url);
// new FileSystem (url, options);
function FileSystem () {
  var self = this;

  self.klass = FileSystem;
  self.klass.super_.apply(self, arguments);
}

util.inherits(FileSystem, Storage);

// -----------------------
//  Class
// --------------------

FileSystem.defaults = {
  url: process.env.FILESYSTEM_URL || 'file:///tmp/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {
    encoding: 'utf8',
    mode: 0777,
    extension: '.json'
  }
};

FileSystem.url = FileSystem.defaults.url;
FileSystem.options = FileSystem.defaults.options;

FileSystem.reset = Storage.reset;

// -----------------------
//  Instance
// --------------------

// #connect ()
FileSystem.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    var fs = require('node-fs');

    self.client = fs;

    self.client.mkdir(self.options.server.db, self.options.mode, true, function (err) {
      if (err) {
        self.emit('error', err);
      }
      self.emit('ready');
    });
  });
};

// #key (key)
FileSystem.prototype.key = function(key) {
  var self = this;
  var _key = [self.options.server.db, key].join('/') + self.options.extension;
  return _key;
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
FileSystem.prototype.set = function() {
  var self = this;

  self._set(arguments, function(key_values, options, done, next) {
    key_values.each(function(key, value) {
      self.client.mkdir(path.dirname(key), self.options.mode, true, function() {
        self.client.writeFile(key, value, self.options.encoding, function(err, response) {
          next(key, err, !err, response);
        });
      });
    });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
FileSystem.prototype.get = function() {
  var self = this;

  self._get(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client.readFile(key, self.options.encoding, function(err, response) {
        next(key, err, response, response);
      });
    });
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
FileSystem.prototype.del = function() {
  var self = this;

  self._del(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client.exists(key, function(exists) {
        if (exists) {
          self.client.unlink(key, function(err) {
            next(key, err, !err, null);
          });
        } else {
          next(key, null, false, null);
        }
      });
    });
  });
};

// #exists (key, [options], callback)
// #exists (keys, [options], callback)
FileSystem.prototype.exists = function() {
  var self = this;

  self._exists(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      self.client.exists(key, function(response) {
        next(key, null, !!response, response);
      });
    });
  });
};

// #pack ()
FileSystem.prototype.pack = JSON.stringify;

// #unpack ()
FileSystem.prototype.unpack = JSON.parse;

// -----------------------
//  Export
// --------------------

module.exports = FileSystem;
