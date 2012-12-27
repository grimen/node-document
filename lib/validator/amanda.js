require('sugar');
var fun = require('funargs'),
    util = require('util'),

    Validator = require('./');

// -----------------------
//  Constructor
// --------------------

// new Amanda ()
// new Amanda (options)
function Amanda () {
  var self = this, args = fun(arguments);

  self.klass = Amanda;
  self.klass.super_.apply(self, arguments);

  self.options = Object.merge(self.klass.defaults.options, args.objects()[0] || {}, true);
  self.engine = require('amanda')('json');
}

util.inherits(Amanda, Validator);

// -----------------------
//  Class
// --------------------

Amanda.defaults = {
  options: {
    singleError: false
  }
};

Amanda.options = Object.clone(Amanda.defaults.options, true);

Amanda.reset = Validator.reset;

// -----------------------
//  Instance
// --------------------

// #validate (attributes)
// #validate (attributes, options)
// #validate (attributes, callback)
// #validate (attributes, options, callback)
Amanda.prototype.validate = function() {
  var self = this, args = fun(arguments), data, schema, options, callback;

  data = args.objects()[0];

  if (!Object.isObject(data)) {
    throw new Error("ArgumentError: Expected `data` <object>, got <" + typeof data + ">");
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

  try {
    self.engine.validate(data, schema, options, function(validation_errors) {
      var errors = validation_errors || null;
      var valid = Object.isEmpty(errors || {});

      if (callback) {
        callback(null, errors, valid);
      }
    });

  } catch (err) {
    if (callback) {
      callback(err);
    } else {
      throw err;
    }
  }

  if (!callback) {
    var result;
    // TODO: Sync:ed call
    return result;
  }
};

// -----------------------
//  Export
// --------------------

module.exports = Amanda;
