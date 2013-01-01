var fun = require('funargs');

// new Validator ()
// new Validator (schema)
// new Validator (schema, options)
function Validator () {
  var self = this, args = fun(arguments);

  self.klass = self.klass || Validator;

  self.options = Object.merge(self.klass.defaults.options, args.objects()[0] || {}, true);
  self.engine = null;
}

// -----------------------
//  Class
// --------------------

// .name
Validator.__defineGetter__('name', function() {
  var self = this;
  return self.name;
});

Validator.defaults = {
  options: {}
};

Validator.options = null;

Validator.reset = function() {
  var self = this;

  if (self.defaults) {
    self.options = self.defaults.options;
  }
};

// -----------------------
//  Instance
// --------------------

// #name
Validator.prototype.__defineGetter__('name', function() {
  var self = this;
  return this.constructor.name;
});

// #_validate ()
Validator.prototype._validate = function(args, execute) {
  var self = this, attributes, schema, options, callback;

  args = fun(args);
  attributes = args.objects()[0];

  if (!Object.isObject(attributes)) {
    throw new Error("ArgumentError: Expected `attributes` <object>, got <" + typeof attributes + ">");
  }

  schema = {
    type: 'object',
    properties: args.objects()[1] || {}
  };

  if (!Object.isObject(schema)) {
    throw new Error("ArgumentError: Expected `schema` <object>, got <" + typeof schema + ">");
  }

  options = Object.merge(self.options, args.objects()[2] || {}, true);
  callback = args.functions()[0];

  var done = function(errors, valid) {
    if (callback) {
      callback(null, errors, valid);
    }
  };

  try {
    execute(attributes, schema, options, done);

  } catch (err) {
    if (callback) {
      callback(err);
    } else {
      throw err;
    }
  }

  // if (!callback) {
  //   var result;
  //   // TODO: Sync:ed call
  //   return result;
  // }
}

// #validate (attributes)
// #validate (attributes, options)
// #validate (attributes, callback)
// #validate (attributes, options, callback)
Validator.prototype.validate = function() {
  throw new Error("Not implemented");
}

// -----------------------
//  Export
// --------------------

module.exports = Validator;
