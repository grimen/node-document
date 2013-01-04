var helper = require('../helper'),
    assert = helper.assert,
    flag = helper.flag,
    debug = helper.debug;

var Differ = require('../../lib/differ/objectdiff'),
    differ = new Differ();

var Spec = {

  'ObjectDiff': {
    'new': {
      '()': function() {
        assert.instanceOf ( differ, require('../../lib/differ') );

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
      assert.equal ( differ.klass, Differ );
    },

    '.defaults': function() {
      assert.property ( Differ, 'defaults' );

      assert.equal ( Differ.defaults.url, null );
      assert.typeOf ( Differ.defaults.options, 'object' );
    },

    '.options': function() {
      assert.property ( Differ, 'options' );
      assert.typeOf ( Differ.options, 'object' );
      assert.deepEqual ( Differ.options, {} );
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

  'ObjectDiff.prototype': {
    '#options': function() {
      assert.property ( differ, 'options' );
      assert.typeOf ( differ.options, 'object' );
    },

    '#engine': function() {
      assert.property ( differ, 'engine' );
      assert.typeOf ( differ.engine, 'object' );
    },

    '#diff': {
      '': function() {
        assert.property ( differ, 'diff' );
        assert.typeOf ( differ.diff, 'function' );
        assert.throws ( differ.diff, Error );
      },

      '(a, b) - when original data': function(done) {
        var a = {a: "foo", b: "bar"};
        var b = {a: "foo", b: "bar"};

        differ.diff(a, b, function(err, diff, identical) {
          assert.typeOf ( diff, 'null' );
          assert.equal ( identical, true );
          done();
        });
      },

      '(a, b) - when changed data': function(done) {
        var a = {a: "foo", b: "bar"};
        var b = {a: "foo", b: "bar", c: "baz"};

        differ.diff(a, b, function(err, diff, identical) {
          assert.typeOf ( diff, 'object' );
          assert.equal ( identical, false );
          done();
        });
      },

      '(a, b, options) - when original data': function(done) {
        var a = {a: "foo", b: "bar"};
        var b = {a: "foo", b: "bar"};

        differ.diff(a, b, {}, function(err, diff, identical) {
          assert.typeOf ( diff, 'null' );
          assert.equal ( identical, true );
          done();
        });
      },

      '(a, b, options) - when changed data': function(done) {
        var a = {a: "foo", b: "bar"};
        var b = {a: "foo", b: "bar", c: "baz"};

        differ.diff(a, b, {}, function(err, diff, identical) {
          assert.typeOf ( diff, 'object' );
          assert.equal ( identical, false );
          done();
        });
      }
    }
  }
}

module.exports = Spec;
