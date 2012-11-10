require('sugar');
var helper = require('../spec_helper'),
    assert = helper.assert,
    debug = helper.debug,

    JSONDiffDiffer = require('../../lib/differ/jsondiff'),
    differ = new JSONDiffDiffer();

var Spec = {

  'JSONDiffDiffer': {
    'new': {
      '()': function() {
        assert.instanceOf ( differ, require('../../lib/differ') );

        JSONDiffDiffer.reset();

        var differ2 = new JSONDiffDiffer();

        assert.equal ( differ2.url, null );
        assert.typeOf ( differ2.options, 'object' );
        assert.deepEqual ( differ2.options.custom, undefined );
      },

      '(options)': function() {
        JSONDiffDiffer.reset();

        var differ2 = new JSONDiffDiffer({custom: {foo: 'bar'}});

        assert.equal ( differ2.url, null );
        assert.typeOf ( differ2.options, 'object' );
        assert.deepEqual ( differ2.options.custom, {foo: 'bar'} );
      }
    },

    '.klass': function() {
      assert.property ( differ, 'klass' );
      assert.equal ( differ.klass, JSONDiffDiffer );
    },

    '.defaults': function() {
      assert.property ( JSONDiffDiffer, 'defaults' );

      assert.equal ( JSONDiffDiffer.defaults.url, null );
      assert.typeOf ( JSONDiffDiffer.defaults.options, 'object' );
    },

    '.options': function() {
      assert.property ( JSONDiffDiffer, 'options' );
      assert.typeOf ( JSONDiffDiffer.options, 'object' );
      assert.deepEqual ( JSONDiffDiffer.options, {} );
    },

    '.reset()': function() {
      assert.property ( JSONDiffDiffer, 'reset' );
      assert.typeOf ( JSONDiffDiffer.reset, 'function' );

      JSONDiffDiffer.options = {foo: "bar"};
      assert.deepEqual ( JSONDiffDiffer.options, {foo: "bar"} );

      JSONDiffDiffer.reset();

      assert.equal ( JSONDiffDiffer.url, null );
    }
  },

  'JSONDiffDiffer.prototype': {
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
