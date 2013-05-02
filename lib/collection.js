require ('sugar');
var fun = require('funargs');

// NOTE: Avoiding subclassing Array for now:
//  - http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/

// -----------------------
//  Decorator
// --------------------

function Collection () {
  var args = fun(arguments);
  var collection = Array.isArray(args[0]) ? args[0] : args;

  Collection.methods.klass.each(Collection.proxy(collection));
  Collection.methods.instance.each(Collection.proxy(collection));

  return collection;
}

Collection.proxy = function(collection) {
  return function(method) {
    if (method.getter || method.setter) {

      if (method.getter) {
        collection.__defineGetter__(method.name, Collection.map(method));
      }

      if (method.setter) {
        collection.__defineSetter__(method.name, Collection.map(method));
      }

    } else {
      collection[method.name] = Collection.map(method);
    }
  };
};

Collection.map = function(method) {
  return function() {
    var self = this, args = fun(arguments), callback;

    var returned = [];
    var returned_async = [];
    var returned_async_count = 0;

    var done = function() {
      var _args = fun(arguments);

      returned_async_count += 1;

      _args.each(function(v, i) {
        returned_async[i] = returned_async[i] || [];
        returned_async[i].push(v);
      });

      if ((returned_async_count === self.length) && callback) {
        callback.apply(self, returned_async);
      }
    };

    if (!method.each && args.functions().length) {
      callback = args.functions()[0];
      args[args.indexOf(callback)] = done;
    }

    self.each(function(model) {
      var _return;

      if (method.getter || method.setter) {
        if (method.setter && args.length > 0) {
          _return = (model[method.name] = args[0]);
        } else if (method.getter) {
          _return = model[method.name];
        }
      } else {
        if (model[method.name]) {
          _return = model[method.name].apply(model, args);
        }
      }

      returned.push(_return);
    });

    return returned;
  }
};

Collection.methods = {
  klass: [
    {name: 'name', getter: true},
    {name: 'new'},
    {name: 'create'},
    {name: 'set'},
    {name: 'get'},
    {name: 'del'},
    {name: 'exists'},
    {name: 'end'},
    {name: 'validate'},
    {name: 'diff'},
    {name: 'on', each: true},
    {name: 'off', each: true},
    {name: 'emit'}
  ],
  instance: [
    {name: 'name', getter: true},
    {name: 'id', getter: true, setter: true},
    {name: 'type', getter: true},
    {name: 'persisted', getter: true},
    {name: 'unpersisted', getter: true},
    {name: 'changes', getter: true},
    {name: 'changed', getter: true},
    {name: 'valid', getter: true},
    {name: 'invalid', getter: true},
    {name: 'storage', getter: true, setter: true},
    {name: 'validator', getter: true, setter: true},
    {name: 'differ', getter: true, setter: true},
    {name: 'attributes', getter: true, setter: true}, // NOTE: Document([post, article]).attributes.title = 'A' won't work naturally - fix with nested-getters-hack on attributes?
    {name: 'persisted_attributes', getter: true, setter: true},
    {name: 'unchanged', getter: true},
    {name: 'errors', getter: true},
    {name: 'get'},
    {name: 'set'},
    {name: 'attr'},
    {name: 'reset'},
    {name: 'clear'},
    {name: 'toJSON'},
    {name: 'toString'},
    {name: 'valueOf'},
    // {name: 'inspect'}, // RESERVED: Cannot override this in Node.js; specs pass but when running in REPL this breaks `[].inspect`.
    {name: 'clone'},
    {name: 'destroy'},
    {name: 'save'},
    {name: 'fetch'},
    {name: 'on', each: true},
    {name: 'off', each: true},
    {name: 'emit'}
  ]
};

// -----------------------
//  Export
// --------------------

module.exports = Collection;
