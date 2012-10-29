require ('sugar');
var Class = require('./util/class'),
    helpers = require('./util/helpers'),
    inspect = helpers.inspect,
    debug = console.log;

var Storage = require('./storage')

// Move to extensions - how-to export to global scope in Node.js?
Array.wrap = function(value) {
  if (Object.isArray(value)) {
    return value;
  } else {
    return [value];
  }
};

Function.args = helpers.args;

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
function Document (type, storage) {
  if (Object.isEmpty(type))
    throw new Error("Expected 'Document(<type>)', got 'Document(" + type + ").");

  var self = this, args = Function.args(arguments), schema, storage, callback;

  type = args.find(function(arg) { return Object.isString(arg); });
  schema = args.find(function(arg) { return Object.isObject(arg) && !(arg instanceof Storage); });
  // storage = args.find(function(arg) { return arg && (arg instanceof Storage); });
  callback = args.find(function(arg) { return Object.isFunction(arg); });

  var klass = Class.subclass(Document.Model);

  klass.type = type;
  klass.id_attribute = 'id';
  klass.schema = Object.extended(schema || {});
  if (storage) {
    klass.storage = (storage instanceof Storage) ? storage : (new storage());
  } else {
    klass.storage = new Document.DefaultStorage();
  }

  if (Object.isFunction(callback)) {
    callback.call(klass, klass, klass.prototype); // => function(klass, proto) { this.find = this.get; this.prototype.attributes['foo'] = 'bar'; }
  }

  return klass;
}

// -----------------------
//  Class Methods
// --------------------

Document.DefaultStorage = require('./storage/memory');

Document.Validator = require('amanda')('json');

Document.Model = function(attributes) {
  this.klass = this.constructor;
  this.type = this.klass.type;
  this.attributes = Object.merge({}, attributes, true);
  // REVIEW: this.attributes.id = this.attributes.id || helpers.uuid();
  this.changes = Object.extended({});
  this.errors = Object.extended({});
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
  var self = this, args = Function.args(arguments), callback;

  callback = args.find(function(arg) { return Object.isFunction(arg); });

  var instance = self.new(attributes);

  instance.save(callback);

  return instance;
};

// .set (id, data)
// .set (id, data, callback)
// .set (id, data, options, callback)
Document.Model.set = function(ids, values) {
  // '.set %s', inspect(Function.args(arguments))
  var self = this, args = Function.args(arguments), options, callback;

  ids = Array.wrap(ids);
  values = Array.wrap(values || {});
  options = args.slice(2).find(function(arg) { return Object.isObject(arg); }) || {};
  callback = args.slice(2).find(function(arg) { return Object.isFunction(arg); });

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
  // debug('.get %s', inspect(Function.args(arguments)));
  var self = this, args = Function.args(arguments), options, callback;

  ids = Array.wrap(ids);
  options = args.slice(1).find(function(arg) { return Object.isObject(arg); }) || {};
  callback = args.slice(1).find(function(arg) { return Object.isFunction(arg); });

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
  // debug('.del %s', inspect(Function.args(arguments)));
  var self = this, args = Function.args(arguments), options, callback;

  ids = Array.wrap(ids);
  options = args.slice(1).find(function(arg) { return Object.isObject(arg); }) || {};
  callback = args.slice(1).find(function(arg) { return Object.isFunction(arg); });

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

// Document.Model.end()
Document.Model.end = function() {
  var self = this, args = Function.args(arguments), callback;

  callback = args.find(function(arg) { return Object.isFunction(arg); });

  self.storage.end();

  if (Object.isFunction(callback)) callback();

  return self;
};

// -----------------------
//  Instance Methods
// --------------------

Document.Model.prototype.__defineGetter__('id', function() {
  return this.attributes[this.klass.id_attribute];
});

Document.Model.prototype.__defineGetter__('persisted', function() {
  return Object.isObject(this.persisted_attributes);
});

Document.Model.prototype.__defineGetter__('new', function() {
  return !this.persisted;
});

Document.Model.prototype.__defineGetter__('changed', function() {
  return (this.changes.keys().length > 0);
});

Document.Model.prototype.__defineGetter__('unchanged', function() {
  return !this.changed;
});

Document.Model.prototype.__defineGetter__('valid', function() {
  var is_valid = true; // this.validate();
  return is_valid;
});

Document.Model.prototype.__defineGetter__('invalid', function() {
  return !this.valid;
})

// #has (key)
Document.Model.prototype.has = function() {
  var self = this, args = Function.args(arguments);

  if (arguments.length === 1 && Object.isString(arguments[0])) {
    var _key = '' + arguments[0];
    return Object.has(self.attributes, _key);
  } else {
    throw new Error("ArgumentError: " + helpers.inspect(arguments));
  }
};

// #set (attributes)
// #set (attribute_key, value)
Document.Model.prototype.set = function() {
  var self = this, args = Function.args(arguments);

  // TODO: Nested set: http://jsonselect.org

  if (arguments.length === 1 && (!arguments[0] || Object.isObject(arguments[0]))) {
    var _attributes = arguments[0] || {};

    self.attributes = _attributes;

    return self.attributes;

  } else if (arguments.length === 2) {
    var _key = '' + arguments[0],
        _value = arguments[1];

    self.attributes[_key] = _value;

    return self.attributes;

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(arguments));
  }
};

// #get ()
// #get (attribute_key)
Document.Model.prototype.get = function() {
  var self = this, args = Function.args(arguments);

  // TODO: Nested get: http://jsonselect.org

  if (arguments.length === 0) {
    return self.attributes;

  } else if (arguments.length === 1) {
    var _key = arguments[0];
    return self.attributes[_key];

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(arguments));
  }
};

// #del (attribute_key)
// #del (attribute_keys)
Document.Model.prototype.del = function() {
  var self = this, args = Function.args(arguments);

  if (arguments.length === 1) {
    var _keys =  Object.isArray(arguments[0]) ? arguments[0] : [arguments[0]];
    _keys.each(function(_key) {
      delete self.attributes[_key];
    });
    return self.attributes;

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(arguments));
  }
}

// #attr (attribute_key)
// #attr (attribute_key, value)
Document.Model.prototype.attr = function() {
  var self = this, args = Function.args(arguments);

  if ( arguments.length === 0 || (arguments.length === 1 && Object.isString(arguments[0])) ) {
    var _key = arguments[0];
    return arguments.length === 1 ? self.get(_key) : self.get();

  } else if ( arguments.length === 2 || (arguments.length === 1 && Object.isObject(arguments[0])) ) {
    return arguments.length === 1 ? self.set(arguments[0]) :  self.set(arguments[0], arguments[1]);

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(arguments));
  }
};

// #save ()
// #save (callback)
// #save (options, callback)
Document.Model.prototype.save = function() {
  var self = this, args = Function.args(arguments), options, callback;

  options = args.find(function(arg) { return Object.isObject(arg); }) || {};
  callback = args.find(function(arg) { return Object.isFunction(arg); });

  options = Object.extended({}).merge(options);

  self.attributes.id = self.attributes.id || helpers.uuid();

  // debug('Document#save()  ->  %s', inspect(self.id));

  // TODO: <<< self.validate() >>>

  if (self.valid) {
    self.klass.set(self.id, self.attributes, options, function(err, result, response) {
      // debug('Document#save :: OK  ->  %s', inspect(args));

      if (!Array.wrap(err).compact().length) {
        self.persisted_attributes = Object.clone(self.attributes);
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

// #destroy ()
// #destroy (callback)
// #destroy (options, callback)
Document.Model.prototype.destroy = function() {
  var self = this, args = Function.args(arguments), options, callback;

  options = args.find(function(arg) { return Object.isObject(arg); }) || {};
  callback = args.find(function(arg) { return Object.isFunction(arg); });

  // debug('Document#destroy()  ->  %s', inspect(self.id));

  if (Object.isString(self.id) || Object.isNumber(self.id)) {
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
  var self = this, args = Function.args(arguments), options, callback;

  options = args.find(function(arg) { return Object.isObject(arg); }) || {};
  callback = args.find(function(arg) { return Object.isFunction(arg); });

  options = Object.extended({}).merge(options);

  // debug('Document#fetch()  ->  %s', inspect(self.id));

  if (Object.isString(self.id) || Object.isNumber(self.id)) {
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
  var self = this, args = Function.args(arguments);
  var copy = new self.constructor(self.attributes);

  delete copy.attributes.id;

  return copy;
};

// #clear ()
// #clear (options)
Document.Model.prototype.clear = function(what) {
  var self = this, args = Function.args(arguments);

  if (arguments.length === 0 || what === 'attributes') {
    self.attributes = Object.extended({});
  }

  if (arguments.length === 0 || what === 'changes') {
    self.changes = Object.extended({});
  }

  if (arguments.length === 0 || what === 'errors') {
    self.errors = Object.extended({});
  }

  return self;
};

// #reset ()
// #reset (options)
Document.Model.prototype.reset = function() {
  var self = this, args = Function.args(arguments), options;

  if (Object.isObject(arguments[1])) {
    options = arguments[0];
  } else {
    options = {};
  }

  self.attributes = self.persisted_attributes;

  return self;
};

// .validate (callback)
// .validate (options, callback)
Document.Model.validate = function() {
  var self = this, args = Function.args(arguments), options, callback;

  attributes = args.shift() || {};

  options = args.find(function(arg) { return Object.isObject(arg) });
  callback = args.find(function(arg) { return Object.isFunction(arg) });

  var default_options = {
    singleError: false
  };

  options = Object.extended(default_options).merge(options);

  var _schema = {
    type: 'object',
    properties: self.schema || {}
  };

  self.Validator.validate(self.attributes, _schema, options, callback);

  return self;
};

// #validate (callback)
// #validate (options, callback)
Document.Model.prototype.validate = function() {
  var self = this, args = Function.args(arguments), options, callback;

  options = args.find(function(arg) { return Object.isObject(arg) });
  callback = args.find(function(arg) { return Object.isFunction(arg) });

  self.klass.Validator.validate(self.attributes, options, callback);

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

module.exports = Document;
