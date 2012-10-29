var fun = require('funargs');

// new Storage();
// new Storage({});
function Storage () {
  var args = fun(arguments);

  // this.uri = args.strings().pop();
  // this.options = args.objects().pop();

  this.klass = this;
}

Storage.prototype.key = function() {
  throw new Error("Not implemented");
}

Storage.prototype.set = function() {
  throw new Error("Not implemented");
}

Storage.prototype.get = function() {
  throw new Error("Not implemented");
}

Storage.prototype.del = function() {
  throw new Error("Not implemented");
}

Storage.prototype.delete = Storage.prototype.del;

Storage.prototype.end = function() {
  throw new Error("Not implemented");
}

module.exports = Storage;
