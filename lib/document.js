require ('sugar');
var Class = require('./util/class'),
    helpers = require('./util/helpers'),
    fun = require('funargs'),
    inspect = helpers.inspect,
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
  if (Object.isEmpty(type))
    throw new Error("Expected 'Document(<type>)', got 'Document(" + type + ").");

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

  if (Object.isFunction(callback)) {
    try {
      callback.call(klass, klass, klass.prototype); // => function(klass, proto) { this.find = this.get; this.prototype.attributes['foo'] = 'bar'; }
    } catch (err) {
      // BUG: Parse error sometimes, but no clue why yet.
    }
  }

  return klass;
}

// -----------------------
//  Class
// --------------------

Document.DefaultStorage = require('./storage/memory');
Document.DefaultValidator = require('./validator/amanda');
Document.DefaultDiffer = require('./differ/jsondiff');

Document.Storage = Document.DefaultStorage;
Document.Validator = Document.DefaultValidator;
Document.Differ = Document.DefaultDiffer;

Document.Model = function(attributes) {
  this.klass = this.constructor;
  this.type = this.klass.type;
  this.attributes = Object.merge({}, attributes, true);
  // REVIEW: this.attributes.id = this.attributes.id || helpers.uuid();
  this.changes = null;
  this.errors = null;
  this.persisted_attributes = undefined;

  if (Object.isFunction(this.initialize)) this.initialize();
}

// .new()
// .new(attributes)
Document.Model.new = function(attributes) {
  attributes = attributes || Object.extended({});

  var instance = new this(attributes);

  return instance;
};

// REVIEW: Best way of implementing this?
// .create()
// .create(attributes)
// .create(attributes, callback)
Document.Model.create = function(attributes) {
  var self = this, args = fun(arguments), options, callback;

  options = args.objects()[1] || {};
  callback = args.functions()[0] || function() {};

  var instance = new self(attributes);

  instance.save(callback);

  return instance;
};

// .set (id, data)
// .set (id, data, callback)
// .set (id, data, options, callback)
Document.Model.set = function(ids, values) {
  // '.set %s', inspect(fun(arguments))
  var self = this, args = fun(arguments).slice(2), options, callback;

  ids = Array.wrap(ids);
  values = Array.wrap(values || {});

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  // debug(ids, values, options, callback);

  if ( !ids.every(function(v) { return (Object.isString(v) || Object.isNumber(v)); }) )
    throw new Error("A. Expected Document.Model.set([id:String, ...], [values:Object, ...], options:Object, callback:Function), got Document.Model.set({arguments})".assign({arguments: inspect(args).replace(/\n/g, '')}));

  if ( !values.every(function(v) { return (Object.isObject(v)); }) )
    throw new Error("B. Expected Document.Model.set([id:String, ...], [values:Object, ...], options:Object, callback:Function), got Document.Model.set({arguments})".assign({arguments: inspect(args).replace(/\n/g, '')}));

  var keys = ids.map(function(v) { return [self.type, (v || helpers.uuid())].join('/'); });

  // debug(keys);

  self.storage.set(keys, values, options, function(err, result, response) {
    // debug('Document.set :: OK  ->  %s', inspect(args));

    // TODO: Return [<#Document>, <#Document>, ...]

    if (Object.isFunction(callback)) callback(err, result);
  });

  return self;
};

// .get (id)
// .get (id, callback)
// .get (id, options, callback)
Document.Model.get = function(ids) {
  // debug('.get %s', inspect(fun(arguments)));
  var self = this, args = fun(arguments).slice(1), options, callback;

  ids = Array.wrap(ids);

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  // debug(ids, options, callback);

  if ( !ids.every(function(v) { return (Object.isString(v) || Object.isNumber(v)); }) )
    throw new Error("Expected Document.Model.set([id:String, ...], options:Object, callback:Function), got Document.Model.set({arguments})".assign({arguments: inspect(args).replace(/\n/g, '')}));

  var keys = ids.map(function(v) { return [self.type, (v || helpers.uuid())].join('/'); });

  // debug(keys);

  self.storage.get(keys, options, function(err, result, response) {
    // debug('Document.get :: OK  ->  %s', inspect(args));

    // TODO: Return [<#Document>, <#Document>, ...]

    if (Object.isFunction(callback)) callback(err, result);
  });

  return self;
};

// .del (id)
// .del (id, callback)
// .del (id, options, callback)
Document.Model.del = function(ids) {
  // debug('.del %s', inspect(fun(arguments)));
  var self = this, args = fun(arguments).slice(1), options, callback;

  ids = Array.wrap(ids);

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  // debug(ids, options, callback);

  if ( !ids.every(function(v) { return (Object.isString(v) || Object.isNumber(v)); }) )
    throw new Error("Expected Document.Model.set([id:String, ...], options:Object, callback:Function), got Document.Model.set({arguments})".assign({arguments: inspect(args).replace(/\n/g, '')}));

  var keys = ids.map(function(v) { return [self.type, (v || helpers.uuid())].join('/'); });

  // debug(keys);

  self.storage.delete(keys, options, function(err, result, response) {
    // debug('Document.delete :: OK  ->  %s', inspect(args));

    // TODO: Return [<#Document>, <#Document>, ...]

    if (Object.isFunction(callback)) callback(err, result);
  });

  return self;
};

// .delete (id)
// .delete (id, callback)
// .delete (id, options, callback)
Document.Model.delete = Document.Model.del; // alias

// .end()
Document.Model.end = function() {
  var self = this, args = fun(arguments), callback;

  callback = args.functions()[0] || function() {};

  self.storage.end();

  if (Object.isFunction(callback)) callback();

  return self;
};

Document.Model.validate = function(attributes) {
  var self = this, args = fun(arguments).slice(1), options, callback;

  options = args.objects()[1] || {};
  callback = args.functions()[0] || function() {};

  self.validator.validate(attributes, self.schema, options, function(errors, valid) {
    self.errors = errors;

    callback(errors, valid, {attributes: attributes});
  });

  // REVIEW: Support sync call? Will need to hack any adapters then, e.g. `Amanda` which is async.

  return self;
};

Document.Model.diff = function(attributes_a, attributes_b) {
  var self = this, args = fun(arguments).slice(2), options, callback;

  options = args.objects()[1] || {};
  callback = args.functions()[0] || function() {};

  self.differ.diff(attributes_a, attributes_b, options, function(diff, identical) {
    self.changes = diff;

    // REVIEW: Diffing is synchronous but validation is now, should be same API:s and behavious - non-hackish solution?

    callback(diff, identical, {a: attributes_a, b: attributes_b});
  });

  // REVIEW: Support sync call?

  return self;
};


// -----------------------
//  Instance
// --------------------

Document.Model.prototype.__defineGetter__('id', function() {
  var _id = this.attributes[this.klass.id_attribute];
  return _id;
});

Document.Model.prototype.__defineGetter__('persisted', function() {
  var _persisted = Object.isObject(this.persisted_attributes);
  return _persisted;
});

Document.Model.prototype.__defineGetter__('new', function() {
  var _new = !this.persisted;
  return _new;
});

Document.Model.prototype.__defineGetter__('changed', function() {
  var _changed = !Object.isEmpty(this.changes);
  return _changed;
});

Document.Model.prototype.__defineGetter__('unchanged', function() {
  var _unchanged = !this.changed;
  return _unchanged;
});

Document.Model.prototype.__defineGetter__('valid', function() {
  var _valid = Object.isEmpty(this.errors); // FIXME: Need to be synchronous: `this.validate()`
  return _valid;
});

Document.Model.prototype.__defineGetter__('invalid', function() {
  var invalid = !this.valid;
  return invalid;
})

// #has (key)
Document.Model.prototype.has = function() {
  var self = this, args = fun(arguments);

  if (args.length === 1 && Object.isString(args[0])) {
    var _key = '' + args[0];
    return Object.has(self.attributes, _key);
  } else {
    throw new Error("ArgumentError: " + helpers.inspect(args));
  }
};

// #set (attributes)
// #set (attribute_key, value)
Document.Model.prototype.set = function() {
  var self = this, args = fun(arguments);

  var set_object = (args.length === 1) && (!args[0] || Object.isObject(args[0]));
  var set_key_value = (args.length === 2);

  if (set_object) {
    var _attributes = args[0] || {};

    self.attributes = _attributes;

    return self.attributes;

  } else if (set_key_value) {
    var _key = '' + args[0],
        _value = args[1];

    self.attributes[_key] = _value;

    return self.attributes;

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(args));
  }
};

// #get ()
// #get (attribute_key)
Document.Model.prototype.get = function() {
  var self = this, args = fun(arguments);

  var get_all = (args.length === 0);
  var get_one = (args.length === 1);

  if (get_all) {
    return self.attributes;

  } else if (get_one) {
    var _key = args[0];
    return self.attributes[_key];

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(args));
  }
};

// #del (attribute_key)
// #del (attribute_keys)
Document.Model.prototype.del = function() {
  var self = this, args = fun(arguments);

  var del = (args.length === 1);

  if (del) {
    var _key = args[0];

    delete self.attributes[_key];

    return self.attributes;

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(args));
  }
}

// #attr (attribute_key)
// #attr (attribute_key, value)
Document.Model.prototype.attr = function() {
  var self = this, args = fun(arguments);

  var get = args.length === 0 || (args.length === 1 && Object.isString(args[0]));
  var set = args.length === 2 || (args.length === 1 && Object.isObject(args[0]));

  if (get) {
    var _key = args[0];
    return args.length === 1 ? self.get(_key) : self.get();

  } else if (set) {
    return args.length === 1 ? self.set(args[0]) :  self.set(args[0], args[1]);

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(args));
  }
};

// #save ()
// #save (callback)
// #save (options, callback)
Document.Model.prototype.save = function() {
  var self = this, args = fun(arguments), options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  self.attributes.id = self.attributes.id || helpers.uuid();

  // debug('Document#save()  ->  %s', inspect(self.id));

  self.validate(function() {
    if (self.valid) {
      self.klass.set(self.id, self.attributes, options, function(err, result, response) {
        // debug('Document#save :: OK  ->  %s', inspect(args));

        if (!Array.wrap(err).compact().length) {
          self.persisted_attributes = Object.clone(self.attributes);
        }

        self.clear('errors');
        self.clear('changes');

        if (Object.isFunction(callback)) callback(err, self, result);
      });

    } else {
      if (Object.isFunction(callback)) callback(null, self, [false]);
    }
  });

  return self;
};

// #destroy ()
// #destroy (callback)
// #destroy (options, callback)
Document.Model.prototype.destroy = function() {
  var self = this, args = fun(arguments), options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  // debug('Document#destroy()  ->  %s', inspect(self.id));

  var valid_id = Object.isString(self.id) || Object.isNumber(self.id);

  if (valid_id) {
    self.klass.del(self.id, options, function(err, result) {
      // debug('Document#destroy :: OK  ->  %s', inspect(args));

      result = Object.isArray(result) ? result.first : result;

      if (Array.wrap(err).compact().length) {
        // error
      } else {
        self.persisted_attributes = undefined;
        delete self.attributes.id;
      }

      self.clear('errors');
      self.clear('changes');

      if (Object.isFunction(callback)) callback(err, self, result); // REVIEW: Use Backbone-Document-style (model, response)?
    });

  } else {
    if (Object.isFunction(callback)) callback(null, self, [false]);
  }

  return self;
};

// #fetch ()
// #fetch (callback)
// #fetch (options, callback)
Document.Model.prototype.fetch = function() {
  var self = this, args = fun(arguments), options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  // debug('Document#fetch()  ->  %s', inspect(self.id));

  var valid_id = Object.isString(self.id) || Object.isNumber(self.id);

  if (valid_id) {
    var id = self.id;

    self.klass.get(self.id, options, function(err, result) {
      // debug('Document#fetch() :: OK  ->  %s', inspect(args));

      result = Object.isArray(result) ? result.first() : result;

      self.attributes = Object.extended(result || {});
      self.attributes.id = self.attributes.id || id;

      if (Array.wrap(err).compact().length) {
        // error
      } else {
        if (result) {
          self.persisted_attributes = Object.clone(self.attributes);
        } else {
          self.persisted_attributes = undefined;
        }
      }

      self.clear('errors');
      self.clear('changes');

      if (Object.isFunction(callback)) callback(err, self, result);
    });

  } else {
    if (Object.isFunction(callback)) callback(null, self, [false]);
  }

  return self;
};

// #clone ()
// #clone (options)
Document.Model.prototype.clone = function() {
  var self = this, args = fun(arguments);
  var copy = new self.constructor(self.attributes);

  delete copy.attributes.id;

  return copy;
};

// #clear ()
// #clear (options)
Document.Model.prototype.clear = function(what) {
  var self = this, args = fun(arguments);

  var clear_all = (args.length === 0);

  if (clear_all || what === 'attributes') {
    self.attributes = Object.extended({});
  }

  if (clear_all || what === 'changes') {
    self.changes = null;
  }

  if (clear_all || what === 'errors') {
    self.errors = null;
  }

  return self;
};

// #reset ()
// #reset (options)
Document.Model.prototype.reset = function() {
  var self = this, args = fun(arguments), options;

  options = args.objects()[0];

  self.attributes = self.persisted_attributes;

  return self;
};

// #validate (callback)
// #validate (options, callback)
Document.Model.prototype.validate = function() {
  var self = this, args = fun(arguments), options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  self.klass.validate(self.attributes, options, function(errors, valid, data) {
    self.errors = errors;

    callback(errors, valid, data);
  });

  return self;
};

// #diff (callback)
// #diff (options, callback)
Document.Model.prototype.diff = function() {
  var self = this, args = fun(arguments), options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  self.klass.diff(self.persisted_attributes, self.attributes, function(diff, identical, data) {
    self.changes = diff;

    callback(diff, identical, data);
  });

  return self;
};

// #toJSON ()
Document.Model.prototype.toJSON = function() {
  var self = this;
  return self.get();
};

// #toString ()
Document.Model.prototype.toString = function() {
  var self = this;
  return JSON.stringify(self.toJSON());
};

// FAILS: #inspect ()
// Document.Model.prototype.inspect = function() {
//   var self = this;
//   return require('util').inspect(Class.extend(self));
// };

// -----------------------
//  Export
// --------------------

module.exports = Document;
