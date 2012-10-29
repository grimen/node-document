require('sugar')
var debug = console.log;

var Storage = require('./');

// TODO:
//  - http://nodejs.org/api/fs.html

// -----------------------
//  Constructor
// --------------------

function FileStorage (options) {
  if (!this instanceof Storage) {
    this.constructor(options);
  }
  this.klass = FileStorage;

  throw new Error("Not implemented");

  // TODO
}

FileStorage.prototype = new Storage();

module.exports = FileStorage;
