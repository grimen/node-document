var helper = require('./helper'),
    assert = helper.assert,
    debug = helper.debug,

    Validator = require('../lib/validator'),
    validator = new Validator();

var Spec = {

  'Validator': {
    'new': {
      '()': function() {
        assert.instanceOf ( validator, require('../lib/validator') );

        Validator.reset();

        var validator2 = new Validator();

        assert.equal ( validator2.url, null );
        assert.typeOf ( validator2.options, 'object' );
        assert.deepEqual ( validator2.options.custom, undefined );
      },

      '(options)': function() {
        Validator.reset();

        var validator2 = new Validator({custom: {foo: 'bar'}});

        assert.equal ( validator2.url, null );
        assert.typeOf ( validator2.options, 'object' );
        assert.deepEqual ( validator2.options.custom, {foo: 'bar'} );
      }
    },

    '.klass': function() {
      assert.property ( validator, 'klass' );
      assert.equal ( validator.klass, Validator );
    },

    '.name': function() {
      assert.property ( Validator, 'name' );
      assert.equal ( Validator.name, 'Validator' );
    },

    '.defaults': function() {
      assert.property ( Validator, 'defaults' );

      assert.typeOf ( Validator.defaults.options, 'object' );
    },

    '.options': function() {
      assert.property ( Validator, 'options' );
      assert.typeOf ( Validator.options, 'null' );
    },

    '.reset()': function() {
      assert.property ( Validator, 'reset' );
      assert.typeOf ( Validator.reset, 'function' );

      Validator.options = {foo: "bar"};
      assert.deepEqual ( Validator.options, {foo: "bar"} );
      assert.deepEqual ( Validator.defaults.options, {} );

      Validator.reset();

      assert.equal ( Validator.options, Validator.defaults.options );
    }
  },

  'Validator.prototype': {
    '#name': function() {
      assert.property ( validator, 'name' );
      assert.equal ( validator.name, 'Validator' );
    },

    '#options': function() {
      assert.property ( validator, 'options' );
      assert.typeOf ( validator.options, 'object' );
    },

    '#engine': function() {
      assert.property ( validator, 'engine' );
      assert.typeOf ( validator.engine, 'null' );
    },

    '#validate': function() {
      assert.property ( validator, 'validate' );
      assert.typeOf ( validator.validate, 'function' );
      assert.throws ( validator.validate, Error );
    }
  }
}

module.exports = Spec;
