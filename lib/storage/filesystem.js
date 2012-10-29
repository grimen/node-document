require('sugar');
var url = require('url'),
    helpers = require('../util/helpers'),
    inspect = helpers.inspect,
    debug = console.log;

var Storage = require('./');

// TODO:
//  - http://nodejs.org/api/fs.html

// -----------------------
//  Constructor
// --------------------

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

FileSystemStorage.prototype.key = function() {
  throw new Error("Not implemented");
}

FileSystemStorage.prototype.set = function() {
  throw new Error("Not implemented");
}

FileSystemStorage.prototype.get = function() {
  throw new Error("Not implemented");
}

FileSystemStorage.prototype.del = function() {
  throw new Error("Not implemented");
}

FileSystemStorage.prototype.delete = FileSystemStorage.prototype.del;

FileSystemStorage.prototype.end = function() {
  throw new Error("Not implemented");
}

module.exports = FileSystemStorage;
