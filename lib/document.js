require ('sugar');
var Class = require('./util/class'),
    fun = require('funargs'),
    debug = console.log;

var Storage = require('./storage');
var Validator = require('./validator');
var Differ = require('./differ');

Array.wrap = require('./util/array/wrap');

// -----------------------
//  Constructor
// --------------------

// == Spec:
//    Document(type)
//    Document(type, storage, ...)
//    Document(type, schema, ...)
//    Document(type, callback, ...)
//
// == Example:
//    Document("recipe")
//    Document("recipe", Redis)
//    Document("recipe", {title: {type: 'string', required: true}}, ...)
//    Document("recipe", function(klass, proto) { klass.find = klass.get; }, ...)
//
function Document (type) {
  if (!type) {
    throw new Error("Expected 'Document(<type>)', got 'Document(" + type + ").");
  }

  var args = fun(arguments), schema, storage, validator, differ, callback;

  type = args.strings()[0];
  storage = args.compact().find(function(arg) { return (arg instanceof Storage) || (arg.prototype instanceof Storage); });
  validator = args.compact().find(function(arg) { return (arg instanceof Validator) || (arg.prototype instanceof Validator); });
  differ = args.compact().find(function(arg) { return (arg instanceof Differ) || (arg.prototype instanceof Differ); });
  schema = args.objects().find(function(arg) { return !(arg instanceof Storage); });
  callback = args.functions()[0] || function() {};

  var klass = Class.subclass(Document.Model);

  klass.type = type;
  klass.id_attribute = 'id';

  klass.schema = Object.extended(schema || {});

  if (storage) {
    klass.storage = (storage instanceof Storage) ? storage : (new storage());
  } else {
    klass.storage = new Document.Storage();
  }

  if (validator) {
    klass.validator = (validator instanceof Validator) ? validator : (new validator());
  } else {
    klass.validator = new Document.Validator();
  }

  if (differ) {
    klass.differ = (differ instanceof Differ) ? differ : (new differ());
  } else {
    klass.differ = new Document.Differ();
  }

  try {
    callback.call(klass, klass, klass.prototype); // => function(klass, proto) { this.find = this.get; this.prototype.attributes['foo'] = 'bar'; }
  } catch (err) {
    // BUG: Parse error sometimes, but no clue why yet.
  }

  return klass;
}

// -----------------------
//  Class
// --------------------

Document.require = function(path) {
  path = './' + path;
  return require(path);
};

Document.Model = require('./document/model');

Document.DefaultStorage = Document.require('storage/memory');
Document.DefaultValidator = Document.require('validator/amanda');
Document.DefaultDiffer = Document.require('differ/jsondiff');

Document.Storage = Document.DefaultStorage;
Document.Validator = Document.DefaultValidator;
Document.Differ = Document.DefaultDiffer;

// -----------------------
//  Export
// --------------------

module.exports = Document;
