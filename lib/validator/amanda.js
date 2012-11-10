require('sugar');
var fun = require('funargs');

var Validator = require('./');

// -----------------------
//  Constructor
// --------------------

// new AmandaValidator()
// new AmandaValidator(options)
function AmandaValidator () {
  this.constructor.apply(this, arguments);
  this.klass = AmandaValidator;

  var args = fun(arguments);

  this.options = Object.merge(this.klass.defaults.options, args.objects()[0] || {}, true);

  this.engine = require('amanda')('json');
}

AmandaValidator.prototype = new Validator();

// -----------------------
//  Class
// --------------------

AmandaValidator.defaults = {
  options: {
    singleError: false
  }
};

AmandaValidator.options = AmandaValidator.defaults.options;

AmandaValidator.reset = Validator.reset;

// -----------------------
//  Instance
// --------------------

// validate (attributes)
// validate (attributes, options)
// validate (attributes, callback)
// validate (attributes, options, callback)
AmandaValidator.prototype.validate = function() {
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
      var valid = Object.isEmpty(errors);

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

module.exports = AmandaValidator;
