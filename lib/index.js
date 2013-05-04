require ('sugar');
var fun = require('funargs'),
    debug = console.log;

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
    throw new Error("Expected `Document(<type>)` or `Document(<collection>)`, got `Document(" + type + ")`.");
  }

  // Collection -> decorate
  if (Array.isArray(type)) {
    return Document.Collection(type);
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

  storage = Document.detect(args, Document.Storage);
  validator = Document.detect(args, Document.Validator);
  differ = Document.detect(args, Document.Differ);
  schema = args.objects().find(function(arg) { return !(arg instanceof Document.Storage); }); // TODO: !(arg instanceof Adapter)
  callback = args.functions()[0] || function() {};

  var klass = Document.Class.subclass(Document.Model);

  klass.meta = Document.meta;
  klass.meta._prefix = '_';

  klass.type = type;
  klass.id = Document.id;
  klass.schema = Object.extended(schema || {});

  klass.Storage = Document.Storage;
  klass.Validator = Document.Validator;
  klass.Differ = Document.Differ;

  klass.DefaultStorage = Document.DefaultStorage;
  klass.DefaultValidator = Document.DefaultValidator;
  klass.DefaultDiffer = Document.DefaultDiffer;

  klass.use('storage', storage, Document.storage);
  klass.use('validator', validator, Document.validator);
  klass.use('differ', differ, Document.differ);

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

Document.meta = function(key) {
  var self = this;
  var prefixed_key = ((self.storage && self.storage.meta && self.storage.meta._prefix) || self.meta._prefix || '') + key;
  return prefixed_key;
};

Document.id = function(record) {
  return Document.uuid();
};

Document.detect = function(args, klass) {
  return args.compact().find(function(arg) { return (arg instanceof klass) || (arg.prototype instanceof klass); })
};

Document.use = function(type, adapter) {
  // REFACTOR: `instanceof Adapter` when available.
  switch (type) {
  case 'storage':
    Document[type] = adapter || Document.DefaultStorage;
    break;
  case 'validator':
    Document[type] = adapter || Document.DefaultValidator;
    break;
  case 'differ':
    Document[type] = adapter || Document.DefaultDiffer;
    break;
  }
};

// HACK: ...until Node.js `require` supports `instanceof` on modules loaded more than once. (bug in Node.js)
Document.Storage = global.NodeDocumentStorage || (global.NodeDocumentStorage = require('node-document-storage'));
Document.Validator = global.NodeDocumentValidator || (global.NodeDocumentValidator = require('node-document-validator'));
Document.Differ = global.NodeDocumentDiffer || (global.NodeDocumentDiffer = require('node-document-differ'));

Document.DefaultStorage = require('node-document-storage-global');
Document.DefaultValidator = require('node-document-validator-schema');
Document.DefaultDiffer = require('node-document-differ-jsondiff');

Document.storage = Document.DefaultStorage;
Document.validator = Document.DefaultValidator;
Document.differ = Document.DefaultDiffer;

Document.Class = require('./class');
Document.Model = require('./model');
Document.Collection = require('./collection');


// -----------------------
//  Export
// --------------------

module.exports = Document;
