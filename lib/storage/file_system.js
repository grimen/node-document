require('sugar')
var debug = console.log;

var Storage = require('./');

// TODO:
//  - http://nodejs.org/api/fs.html

// -----------------------
//  Constructor
// --------------------

function FileSystemStorage (options) {
  options = Object.merge(options, FileSystemStorage.options);

  if (!this instanceof Storage) {
    this.constructor.apply(this, arguments);
  }
  this.klass = FileSystemStorage;

  throw new Error("Not implemented");

  // TODO
}

FileSystemStorage.prototype = new Storage();

// -----------------------
//  Class
// --------------------

FileSystemStorage.url = 'file:///tmp/{db}.{env}'.assign({db: 'default', env: (process.env.NODE_ENV || 'development')});
FileSystemStorage.options = {};

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
