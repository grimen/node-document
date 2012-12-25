require('sugar');
var url = require('url'),
    util = require('util'),
    Storage = require('./'),

    fs = require('fs');

// TODO:
//  - http://nodejs.org/api/fs.html

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
    db: endpoint.pathname.replace(/^\//, '')
  };

  self.options = Object.merge(self.klass.defaults.options, self.options, true, false);
  self.options = Object.merge(options, self.options, true, false);
}

util.inherits(FileSystem, Storage);

// -----------------------
//  Class
// --------------------

FileSystem.defaults = {
  url: process.env.FILESYSTEM_URL || 'file:///tmp/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {}
};

FileSystem.url = FileSystem.defaults.url;
FileSystem.options = FileSystem.defaults.options;

FileSystem.reset = Storage.reset;

// REFACTOR: extend()
RedisStorage.events = new Storage.EventEmitter();
RedisStorage.emit = Storage.emit;
RedisStorage.on = Storage.on;
RedisStorage.off = Storage.off;

// -----------------------
//  Instance
// --------------------

// #connect ()
FileSystem.prototype.connect = function() {
  throw new Error("Not implemented");
};

// #key (key)
FileSystem.prototype.key = function() {
  throw new Error("Not implemented");
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
FileSystem.prototype.set = function() {
  throw new Error("Not implemented");
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
FileSystem.prototype.get = function() {
  throw new Error("Not implemented");
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
FileSystem.prototype.del = function() {
  throw new Error("Not implemented");
};

// #end ()
FileSystem.prototype.end = function() {
  throw new Error("Not implemented");
};

// -----------------------
//  Export
// --------------------

module.exports = FileSystem;
