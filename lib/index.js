require ('sugar');
var fun = require('funargs'),
    debug = console.log;

// HACK: ...until Node.js `require` supports `instanceof` on modules loaded more than once. (bug in Node.js)
var Storage = global.NodeDocumentStorage || (global.NodeDocumentStorage = require('node-document-storage'));
var Validator = global.NodeDocumentValidator || (global.NodeDocumentValidator = require('node-document-validator'));
var Differ = global.NodeDocumentDiffer || (global.NodeDocumentDiffer = require('node-document-differ'));

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

  if (args.strings().length > 1) {
    var storage_url = args.strings()[1];
    var storage_id = require('url').parse(storage_url).protocol;

    if (storage_id) {
      storage_id = storage_id.replace(/\W/gi, '');

      var _Storage = require('node-document-storage-' + storage_id);
      var _storage = new _Storage(storage_url);

      args.push(_storage);
    }
  }

  storage = storage || args.compact().find(function(arg) { return (arg instanceof Storage) || (arg.prototype instanceof Storage); });
  validator = args.compact().find(function(arg) { return (arg instanceof Validator) || (arg.prototype instanceof Validator); });
  differ = args.compact().find(function(arg) { return (arg instanceof Differ) || (arg.prototype instanceof Differ); });
  schema = args.objects().find(function(arg) { return !(arg instanceof Storage); });

  callback = args.functions()[0] || function() {};

  var klass = Document.Class.subclass(Document.Model);

  klass.type = type;
  klass.id_attribute = 'id';
  klass.id = Document.id;
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

Document.uuid = require('node-uuid').v4;

Document.id = function(record) {
  return Document.uuid();
};

Document.Class = require('./class');
Document.Model = require('./model');

Document.DefaultStorage = require('node-document-storage-global');
Document.DefaultValidator = require('node-document-validator-amanda');
Document.DefaultDiffer = require('node-document-differ-jsondiff');

Document.Storage = Document.DefaultStorage;
Document.Validator = Document.DefaultValidator;
Document.Differ = Document.DefaultDiffer;

// -----------------------
//  Export
// --------------------

module.exports = Document;
