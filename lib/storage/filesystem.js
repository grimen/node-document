require('sugar');
var url = require('url'),
    util = require('util'),
    Storage = require('./'),

    fs = require('node-fs'),
    path = require('path');

// == DOCS:
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

  var endpoint = url.parse(self.url);
  var options = {
    hostname: endpoint.hostname,
    port: parseInt(endpoint.port, 10),
    username: endpoint.auth && endpoint.auth.split(':')[0],
    password: endpoint.auth && endpoint.auth.split(':')[1],
    db: endpoint.pathname,
    encoding: 'utf8',
    mode: 0777,
    extension: '.json'
  };

  self.options = Object.merge(self.klass.defaults.options, self.options, true, false);
  self.options = Object.merge(options, self.options, true, false);
}

util.inherits(FileSystem, Storage);

// -----------------------
//  Class
// --------------------

FileSystem.defaults = {
  url: process.env.FILESYSTEM_URL || 'file:///tmp/{db}-{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {}
};

FileSystem.url = FileSystem.defaults.url;
FileSystem.options = FileSystem.defaults.options;

FileSystem.reset = Storage.reset;

// REFACTOR: extend()
FileSystem.events = new Storage.EventEmitter();
FileSystem.emit = Storage.emit;
FileSystem.on = Storage.on;
FileSystem.off = Storage.off;

// -----------------------
//  Instance
// --------------------

// #connect ()
FileSystem.prototype.connect = function() {
  var self = this;

  if (self.ready) {
    return;
  }

  self.emit('connect');

  try {
    self.client = fs;

    self.client.mkdir(self.options.db, self.options.mode, true, function (err) {
      if (err) {
        self.emit('error', err);
      }
      self.emit('ready');
    });

  } catch (err) {
    self.emit('error', err);
  }
};

// #key (key)
FileSystem.prototype.key = function(key) {
  var self = this;
  return [self.options.db, key].join('/') + self.options.extension;
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
FileSystem.prototype.set = function() {
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
      self.client.mkdir(path.dirname(key), self.options.mode, true, function(err1) {
        self.client.writeFile(key, value, self.options.encoding, function(err, response) {
          res[key] = {error: err, result: !err, response: response};
          next();
        });
      });
    });

  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
FileSystem.prototype.get = function() {
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
      self.client.exists(key, function(exists) {
        if (true) {
          self.client.readFile(key, self.options.encoding, function(err, response) {
            var result = response || null;

            try {
              result = result && self.unpack(result);
            } catch (e) {
              result = null;
            }

            res[key] = {error: err, result: result, response: response};
            next();
          });
        } else {
          res[key] = {error: null, result: false, response: undefined};
          next();
        }
      });
    });

  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
FileSystem.prototype.del = function() {
  var self = this;

  self.command('del', arguments, 3, function(keys, options, callback) {

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
      self.client.exists(key, function(exists) {
        if (exists) {
          self.client.unlink(key, function(err) {
            res[key] = {error: err, result: !err, response: null};
            next();
          });
        } else {
          res[key] = {error: null, result: false, response: null};
          next();
        }
      });
    });

  });
};

// #end ()
FileSystem.prototype.end = function() {};

// #pack ()
FileSystem.prototype.pack = JSON.stringify;

// #unpack ()
FileSystem.prototype.unpack = JSON.parse;

// -----------------------
//  Export
// --------------------

module.exports = FileSystem;
