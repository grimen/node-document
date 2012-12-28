require ('sugar');
var fun = require('funargs');

function Model (attributes) {
  var self = this;

  self.klass = self.constructor;
  self.type = self.klass.type;
  self.attributes = Object.merge({}, attributes, true);
  self.changes = null;
  self.errors = null;
  self.persisted_attributes = undefined;

  self.events = new Model.EventEmitter();

  // REVIEW: self.attributes[self.klass.id_attribute] = self.attributes[self.klass.id_attribute] || uuid();

  if (Object.isFunction(self.initialize)) {
    self.initialize();
  }
}

Model.EventEmitter = require('events').EventEmitter;

// .uuid ()
Model.uuid = require('node-uuid').v4;

// FAILS: .name
// Model.__defineGetter__('name', function() {
//   var self = this;
//   return (new self()).type;
// });

// .new ()
// .new (attributes)
Model.new = function(attributes) {
  var self = this, args = fun(arguments), err = null;

  attributes = attributes || Object.extended({});

  self.emit('new', attributes);

  var instance;

  try {
    instance = new self(attributes);
    self.emit('new', err, instance, fun(arguments));
  } catch (err) {
    // self.emit('new', err);
    throw err;
  }

  return instance;
};

// .create ()
// .create (attributes)
// .create (attributes, callback)
Model.create = function(attributes) {
  var self = this, args = fun(arguments).slice(1), options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  var instance;

  try {
    instance = new self(attributes);
  } catch (err) {
    // self.emit('create', err);
    throw err;
  }

  instance.save(function(err) {
    self.emit('create', err, instance, fun(arguments));
    callback(err, instance);
  });

  return instance;
};

// .set (id, data)
// .set (id, data, callback)
// .set (id, data, options, callback)
Model.set = function(ids, values) {
  var self = this, args = fun(arguments).slice(2), options, callback;

  ids = Array.create(ids);
  values = Array.create(values || {});

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  var ids_are_valid = ids.every(function(v) { return (Object.isString(v) || Object.isNumber(v)); });
  var values_are_valid = values.every(function(v) { return Object.isObject(v); });

  if (!ids_are_valid || !values_are_valid) {
    throw new Error("Expected Model.set([id:String, ...], [values:Object, ...], options:Object, callback:Function), got Model.set({args})".assign({args: fun(arguments)}));
  }

  var keys = ids.map(function(v) { return [self.type, (v || Model.uuid())].join('/'); });

  self.storage.set(keys, values, options, function(err, result, response) {
    self.emit('set', err, result, fun(arguments));
    callback(err, result);
  });

  return self;
};

// .get (id)
// .get (id, callback)
// .get (id, options, callback)
Model.get = function(ids) {
  var self = this, args = fun(arguments).slice(1), options, callback;

  ids = Array.create(ids);

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  var ids_are_valid = ids.every(function(v) { return (Object.isString(v) || Object.isNumber(v)); });

  if (!ids_are_valid) {
    throw new Error("Expected Model.get([id:String, ...], options:Object, callback:Function), got Model.get({args})".assign({args: args}));
  }

  var keys = ids.map(function(v) { return [self.type, (v || Model.uuid())].join('/'); });

  self.storage.get(keys, options, function(err, result, response) {
    self.emit('get', err, result, fun(arguments));
    callback(err, result);
  });

  return self;
};

// .del (id)
// .del (id, callback)
// .del (id, options, callback)
Model.del = function(ids) {
  var self = this, args = fun(arguments).slice(1), options, callback;

  ids = Array.create(ids);

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  var ids_are_valid = ids.every(function(v) { return (Object.isString(v) || Object.isNumber(v)); });

  if (!ids_are_valid) {
    throw new Error("Expected Model.set([id:String, ...], options:Object, callback:Function), got Model.set({arguments})".assign({arguments: inspect(args).replace(/\n/g, '')}));
  }

  var keys = ids.map(function(v) { return [self.type, (v || Model.uuid())].join('/'); });

  self.storage.del(keys, options, function(err, result, response) {
    self.emit('del', err, result, fun(arguments));
    callback(err, result);
  });

  return self;
};

// .end()
Model.end = function() {
  var self = this, args = fun(arguments), callback;

  callback = args.functions()[0] || function() {};

  self.emit('end');

  try {
    self.storage.end();
  } catch (err) {
    self.emit('end', err, fun(arguments));
    throw err;
  }

  callback();

  return self;
};

// .validate (attributes)
// .validate (attributes, options)
// .validate (attributes, callback)
// .validate (attributes, options, callback)
Model.validate = function(attributes) {
  var self = this, args = fun(arguments).slice(1), options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  self.validator.validate(attributes, self.schema, options, function(err, errors, valid) {
    self.errors = errors;

    self.emit('validate', err, errors, valid, fun(arguments));
    callback(err, errors, valid, {attributes: attributes});
  });

  return self;
};

// .diff (a, b)
// .diff (a, b, options)
// .diff (a, b, callback)
// .diff (a, b, options, callback)
Model.diff = function(attributes_a, attributes_b) {
  var self = this, args = fun(arguments).slice(2), options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  self.differ.diff(attributes_a, attributes_b, options, function(err, diff, identical) {
    self.changes = diff;

    // NOTE: Diffing is synchronous but validation is not, should be same API:s and behavious - non-hackish solution?

    self.emit('diff', err, diff, identical, fun(arguments));
    callback(err, diff, identical, {a: attributes_a, b: attributes_b});
  });

  return self;
};

Model.events = new Model.EventEmitter();

// .on (event, listener)
Model.on = function() {
  var self = this, result;
  result = self.events.addListener.apply(self, arguments)
  return result;
};

// .off (event, listener)
Model.off = function() {
  var self = this, result;
  result = self.events.removeListener.apply(self, arguments);
  return result;
};

// .emit (event, [arg1], [arg2], [...])
Model.emit = function() {
  var self = this, result;
  result = self.events.emit.apply(self, arguments);
  return result;
};


// -----------------------
//  Instance
// --------------------

// #name
Model.prototype.__defineGetter__('name', function() {
  var self = this;
  return self.type;
});

// #storage
Model.prototype.__defineGetter__('storage', function() {
  var self = this;
  return self.klass.storage;
});

// #validator
Model.prototype.__defineGetter__('validator', function() {
  var self = this;
  return self.klass.validator;
});

// #differ
Model.prototype.__defineGetter__('differ', function() {
  var self = this;
  return self.klass.differ;
});

// #id
Model.prototype.__defineGetter__('id', function() {
  var self = this, result;
  result = self.attributes[self.klass.id_attribute];
  return result;
});

// #persisted
Model.prototype.__defineGetter__('persisted', function() {
  var self = this, result;
  result = Object.isObject(self.persisted_attributes);
  return result;
});

// #new
Model.prototype.__defineGetter__('new', function() {
  var self = this, result;
  result = !self.persisted;
  return result;
});

// #changed
Model.prototype.__defineGetter__('changed', function() {
  var self = this, result;
  result = !Object.isEmpty(self.changes || {});
  return result;
});

// #unchanged
Model.prototype.__defineGetter__('unchanged', function() {
  var self = this, result;
  result = !self.changed;
  return result;
});

// #valid
Model.prototype.__defineGetter__('valid', function() {
  var self = this, result;
  result = Object.isEmpty(self.errors || {}); // NOTE: Requires async call to #validate. :/
  return result;
});

// #invalid
Model.prototype.__defineGetter__('invalid', function() {
  var self = this, result;
  result = !self.valid;
  return result;
})

// #set (attributes)
Model.prototype.set = function() {
  var self = this, args = fun(arguments), err = null, result;

  var set_object = (args.length === 1) && (!args[0] || Object.isObject(args[0]));

  if (set_object) {
    var _attributes = args[0] || {};

    result = self.attributes = _attributes;

    self.emit('set', err, result, fun(arguments));

    return result;

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(args));
  }
};

// #get ()
Model.prototype.get = function() {
  var self = this, args = fun(arguments), err = null, result;

  var get_object = (args.length === 0);

  if (get_object) {
    result = self.attributes;

    self.emit('get', err, result, fun(arguments));

    return result;

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(args));
  }
};

// #attr (attributes)
Model.prototype.attr = function() {
  var self = this, args = fun(arguments), err = null, result;

  var get = (args.length === 0);
  var set = (args.length === 1 && Object.isObject(args[0]));

  if (get) {
    result = self.get();

    self.emit('attr', err, result, fun(arguments));

    return result;

  } else if (set) {
    result = self.set(args[0]);

    self.emit('attr', err, result, fun(arguments));

    return result;

  } else {
    throw new Error("ArgumentError: " + helpers.inspect(args));
  }
};

// #save ()
// #save (callback)
// #save (options, callback)
Model.prototype.save = function() {
  var self = this, args = fun(arguments), err = null, options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  self.attributes[self.klass.id_attribute] = self.attributes[self.klass.id_attribute] || Model.uuid();

  self.validate(function() {
    if (self.valid) {
      self.klass.set(self.id, self.attributes, options, function(err, result, response) {
        result = Object.isArray(result) ? result.first() : result;
        err = Object.isArray(err) ? err.first() : err;

        if (!err) {
          self.persisted_attributes = Object.clone(self.attributes);
        }

        self.clear('errors');
        self.clear('changes');

        self.emit('save', err, result, fun(arguments));
        callback(err, result, args);
      });

    } else {
      var result = [false];

      self.emit('save', err, result, fun(arguments));
      callback(null, self, result);
    }
  });

  return self;
};

// #destroy ()
// #destroy (callback)
// #destroy (options, callback)
Model.prototype.destroy = function() {
  var self = this, args = fun(arguments), err = null, options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  var valid_id = Object.isString(self.id) || Object.isNumber(self.id);

  if (valid_id) {
    self.klass.del(self.id, options, function(err, result) {
      result = Object.isArray(result) ? result.first() : result;
      err = Object.isArray(err) ? err.first() : err;

      if (!err) {
        self.persisted_attributes = undefined;
        delete self.attributes[self.klass.id_attribute];
      }

      self.clear('errors');
      self.clear('changes');

      self.emit('destroy', err, result, fun(arguments));
      callback(err, result, args);
    });

  } else {
    var result = [false];

    self.emit('destroy', err, result, fun(arguments));
    callback(err, result, args);
  }

  return self;
};

// #fetch ()
// #fetch (callback)
// #fetch (options, callback)
Model.prototype.fetch = function() {
  var self = this, args = fun(arguments), err = null, options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  var valid_id = Object.isString(self.id) || Object.isNumber(self.id);

  if (valid_id) {
    var id = self.id;

    self.klass.get(self.id, options, function(err, result) {
      result = Object.isArray(result) ? result.first() : result;
      err = Object.isArray(err) ? err.first() : err;

      self.attributes = Object.extended(result || {});
      self.attributes[self.klass.id_attribute] = self.attributes[self.klass.id_attribute] || id;

      if (!err) {
        if (result) {
          self.persisted_attributes = Object.clone(self.attributes);
        } else {
          self.persisted_attributes = undefined;
        }
      }

      self.clear('errors');
      self.clear('changes');

      self.emit('fetch', err, result, fun(arguments));
      callback(err, result, args);
    });

  } else {
    var result = [false];

    self.emit('destroy', err, result, fun(arguments));
    callback(err, result, args);
  }

  return self;
};

// #clone ()
// #clone (options)
Model.prototype.clone = function() {
  var self = this, args = fun(arguments), err = null, copy;

  try {
    copy = new self.constructor(self.attributes);
    delete copy.attributes[self.klass.id_attribute];
    self.emit('clone', err, copy, fun(arguments));
  } catch (err) {
    self.emit('clone', err, copy, fun(arguments));
  }

  delete copy.attributes[self.klass.id_attribute];

  return copy;
};

// #clear ()
// #clear (options)
Model.prototype.clear = function(what) {
  var self = this, args = fun(arguments), err = null, clear_all;

  clear_all = (args.length === 0);

  if (clear_all || what === 'attributes') {
    self.attributes = Object.extended({});
  }

  if (clear_all || what === 'changes') {
    self.changes = null;
  }

  if (clear_all || what === 'errors') {
    self.errors = null;
  }

  self.emit('clear', err, undefined, fun(arguments));

  return self;
};

// #reset ()
// #reset (options)
Model.prototype.reset = function() {
  var self = this, args = fun(arguments), err = null, options;

  options = args.objects()[0];

  self.attributes = self.persisted_attributes;

  self.emit('reset', err, undefined, fun(arguments));

  return self;
};

// #validate (callback)
// #validate (options, callback)
Model.prototype.validate = function() {
  var self = this, args = fun(arguments), err = null, options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  self.klass.validate(self.attributes, options, function(err, errors, valid, data) {
    self.errors = errors;

    self.emit('validate', err, errors, valid, fun(arguments));
    callback(err, errors, valid);
  });

  return self;
};

// #diff (callback)
// #diff (options, callback)
Model.prototype.diff = function() {
  var self = this, args = fun(arguments), err = null, options, callback;

  options = args.objects()[0] || {};
  callback = args.functions()[0] || function() {};

  self.klass.diff(self.persisted_attributes, self.attributes, function(err, diff, identical) {
    self.changes = diff;

    self.emit('diff', err, diff, identical, fun(arguments));
    callback(err, diff, identical);
  });

  return self;
};

// #toJSON ()
Model.prototype.toJSON = function() {
  var self = this;
  return self.get();
};

// #toString ()
Model.prototype.toString = function() {
  var self = this;
  return JSON.stringify(self.toJSON());
};

// #inspect ()
Model.prototype.inspect = function() {
  var self = this;
  return require('util').inspect(Object.clone(self.attributes, true));
};

// #on (event, listener)
Model.prototype.on = function() {
  var self = this, result;
  result = self.events.addListener.apply(self, arguments);
  return result;
};

// #off (event, listener)
Model.prototype.off = function() {
  var self = this, result;
  result = self.events.removeListener.apply(self, arguments);
  return result;
};

// #emit (event, [arg1], [arg2], [...])
Model.prototype.emit = function() {
  var self = this, result;
  result = self.events.emit.apply(self, arguments);
  return result;
};

// -----------------------
//  Export
// --------------------

module.exports = Model;
