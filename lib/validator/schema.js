require('sugar');
var util = require('util'),

    Validator = require('./');

// -----------------------
//  Constructor
// --------------------

// new Schema ()
// new Schema (options)
function Schema () {
  var self = this;

  self.klass = Schema;
  self.klass.super_.apply(self, arguments);

  self.engine = require('schema')(self.options.env, self.options);
}

util.inherits(Schema, Validator);

// -----------------------
//  Class
// --------------------

Schema.defaults = {
  options: {
    env: 'default'
  }
};

Schema.options = Object.clone(Schema.defaults.options, true);

Schema.reset = Validator.reset;

// -----------------------
//  Instance
// --------------------

// #validate (attributes)
// #validate (attributes, options)
// #validate (attributes, callback)
// #validate (attributes, options, callback)
Schema.prototype.validate = function() {
  var self = this;

  self._validate(arguments, function(attributes, schema, options, done) {
    var result = self.engine.Schema.create(schema).validate(attributes);

    var errors = (result.errors || []).length ? result.errors : null;
    var valid = Object.isEmpty(errors || {});

    done(errors, valid);
  });
};

// -----------------------
//  Export
// --------------------

module.exports = Schema;
