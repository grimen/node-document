require('sugar');
var helper = require('../spec_helper'),
    assert = helper.assert,
    debug = helper.debug,

    AmandaValidator = require('../../lib/validator/amanda'),
    validator = new AmandaValidator();

var schema;

var Spec = {

  'AmandaAmandaValidator': {
    'new': {
      '()': function() {
        assert.instanceOf ( validator, require('../../lib/validator/amanda') );

        AmandaValidator.reset();

        var validator2 = new AmandaValidator();

        assert.equal ( validator2.url, null );
        assert.typeOf ( validator2.options, 'object' );
        assert.deepEqual ( validator2.options.custom, undefined );
      },

      '(options)': function() {
        AmandaValidator.reset();

        var validator2 = new AmandaValidator({custom: {foo: 'bar'}});

        assert.equal ( validator2.url, null );
        assert.typeOf ( validator2.options, 'object' );
        assert.deepEqual ( validator2.options.custom, {foo: 'bar'} );
      }
    },

    '.klass': function() {
      assert.property ( validator, 'klass' );
      assert.equal ( validator.klass, AmandaValidator );
    },

    '.defaults': function() {
      assert.property ( AmandaValidator, 'defaults' );

      assert.equal ( AmandaValidator.defaults.url, null );
      assert.typeOf ( AmandaValidator.defaults.options, 'object' );
    },

    '.options': function() {
      assert.property ( AmandaValidator, 'options' );
      assert.typeOf ( AmandaValidator.options, 'object' );
      assert.deepEqual ( AmandaValidator.options, {singleError: false} );
    },

    '.reset()': function() {
      assert.property ( AmandaValidator, 'reset' );
      assert.typeOf ( AmandaValidator.reset, 'function' );

      AmandaValidator.options = {foo: "bar"};
      assert.deepEqual ( AmandaValidator.options, {foo: "bar"} );

      AmandaValidator.reset();

      assert.equal ( AmandaValidator.url, null );
    }
  },

  'AmandaValidator.prototype': {
    '#options': function() {
      assert.property ( validator, 'options' );
      assert.typeOf ( validator.options, 'object' );
    },

    '#engine': function() {
      assert.property ( validator, 'engine' );
      assert.typeOf ( validator.engine, 'object' );
      assert.deepEqual ( validator.engine, require('amanda')('json') );
    },

    '#validate': {
      before: function() {
        schema = {
          title: {
            required: true,
            type: 'string',
            length: 7
          }
        };
      },

      '': function() {
        assert.property ( validator, 'validate' );
        assert.typeOf ( validator.validate, 'function' );
      },

      '(attributes) - when valid data': function(done) {
        var data = {title: "A title"};

        validator.validate(data, schema, function(errors, valid) {
          assert.typeOf ( errors, 'null' );
          assert.equal ( valid, true );
          done();
        });
      },

      '(attributes) - when invalid data': function(done) {
        var data = {title: "A"};

        validator.validate(data, schema, function(errors, valid) {
          assert.typeOf ( errors, 'object' );
          assert.equal ( errors.length, 1 );
          assert.equal ( valid, false );
          done();
        });
      },

      '(attributes, options) - when valid data': function(done) {
        var data = {title: "A title"};

        validator.validate(data, schema, {}, function(errors, valid) {
          assert.typeOf ( errors, 'null' );
          assert.equal ( valid, true );
          done();
        });
      },

      '(attributes, options) - when invalid data': function(done) {
        var data = {title: "A"};

        validator.validate(data, schema, {}, function(errors, valid) {
          assert.typeOf ( errors, 'object' );
          assert.equal ( errors.length, 1 );
          assert.equal ( valid, false );
          done();
        });
      }
    }
  }
}

module.exports = Spec;
