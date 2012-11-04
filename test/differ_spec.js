require('sugar');
var helper = require('./spec_helper'),
    assert = helper.assert,
    debug = helper.debug,

    Differ = require('../lib/differ'),
    differ = new Differ();

var Spec = {

  'Differ': {
    'new': {
      '()': function() {
        assert.instanceOf ( differ, require('../lib/differ') );

        Differ.reset();

        var differ2 = new Differ();

        assert.equal ( differ2.url, null );
        assert.typeOf ( differ2.options, 'object' );
        assert.deepEqual ( differ2.options.custom, undefined );
      },

      '(options)': function() {
        Differ.reset();

        var differ2 = new Differ({custom: {foo: 'bar'}});

        assert.equal ( differ2.url, null );
        assert.typeOf ( differ2.options, 'object' );
        assert.deepEqual ( differ2.options.custom, {foo: 'bar'} );
      }
    },

    '.klass': function() {
      assert.property ( differ, 'klass' );
      assert.equal ( differ.klass, require('../lib/differ') );
    },

    '.defaults': function() {
      assert.property ( Differ, 'defaults' );

      assert.equal ( Differ.defaults.url, null );
      assert.typeOf ( Differ.defaults.options, 'object' );
    },

    '.options': function() {
      assert.property ( Differ, 'options' );
      assert.typeOf ( Differ.options, 'null' );
    },

    '.reset()': function() {
      assert.property ( Differ, 'reset' );
      assert.typeOf ( Differ.reset, 'function' );

      Differ.options = {foo: "bar"};
      assert.deepEqual ( Differ.options, {foo: "bar"} );

      Differ.reset();

      assert.equal ( Differ.url, null );
    }
  },

  'Differ.prototype': {
    '#options': function() {
      assert.property ( differ, 'options' );
      assert.typeOf ( differ.options, 'object' );
    },

    '#engine': function() {
      assert.property ( differ, 'engine' );
      assert.typeOf ( differ.engine, 'null' );
    },

    '#diff': function() {
      assert.property ( differ, 'diff' );
      assert.typeOf ( differ.diff, 'function' );
      assert.throws ( differ.diff, Error );
    }
  }
}

module.exports = Spec;
