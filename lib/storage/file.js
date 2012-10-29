require('sugar')
var debug = console.log;

var Storage = require('./');

// TODO:
//  - http://nodejs.org/api/fs.html

// -----------------------
//  Constructor
// --------------------

function FileStorage (options) {
  this.constructor(options);

  throw new Error("Not implemented");

  // TODO

  this.klass = this;
}

FileStorage.prototype = new Storage();

module.exports = FileStorage;
