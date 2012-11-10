require('sugar');
var url = require('url'),
    Storage = require('./'),

    fs = require('fs');

// TODO:
//  - http://nodejs.org/api/fs.html

// -----------------------
//  Constructor
// --------------------

// new FileSystemStorage ();
// new FileSystemStorage (options);
// new FileSystemStorage (url);
// new FileSystemStorage (url, options);
function FileSystemStorage () {
  this.constructor.apply(this, arguments);
  this.klass = FileSystemStorage;

  this.url = this.url || this.klass.url;

  throw new Error("Not implemented");

  // TODO
}

FileSystemStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

FileSystemStorage.defaults = {
  url: process.env.FILESYSTEM_URL || 'file:///tmp/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')}),
  options: {}
};

FileSystemStorage.url = FileSystemStorage.defaults.url;
FileSystemStorage.options = FileSystemStorage.defaults.options;

FileSystemStorage.reset = Storage.reset;

// -----------------------
//  Instance
// --------------------

// #key (key)
FileSystemStorage.prototype.key = function() {
  throw new Error("Not implemented");
}

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
FileSystemStorage.prototype.set = function() {
  throw new Error("Not implemented");
}

// #get (key, [options], callback)
// #get (keys, [options], callback)
FileSystemStorage.prototype.get = function() {
  throw new Error("Not implemented");
}

// #del (key, [options], callback)
// #del (keys, [options], callback)
FileSystemStorage.prototype.del = function() {
  throw new Error("Not implemented");
}

// #delete (key, [options], callback)
// #delete (keys, [options], callback)
FileSystemStorage.prototype.delete = FileSystemStorage.prototype.del;

// #end ()
FileSystemStorage.prototype.end = function() {
  throw new Error("Not implemented");
}

// -----------------------
//  Export
// --------------------

module.exports = FileSystemStorage;
