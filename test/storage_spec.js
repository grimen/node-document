require('sugar');
var helper = require('./spec_helper'),
    assert = helper.assert,
    debug = helper.debug,

    Storage = require('../lib/storage'),
    storage = new Storage();

var Spec = {

  'Storage': {
    'new': {
      '()': function() {
        assert.instanceOf ( storage, require('../lib/storage') );

        Storage.reset();

        var storage2 = new Storage();

        assert.equal ( storage2.url, null );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '("url")': function() {
        Storage.reset();

        var storage2 = new Storage('bogus://127.0.0.1:1234/custom');

        assert.equal ( storage2.url, 'bogus://127.0.0.1:1234/custom' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '(options)': function() {
        Storage.reset();

        var storage2 = new Storage({custom: {foo: 'bar'}});

        assert.equal ( storage2.url, null );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
      },

      '("url", options)': function() {
        Storage.reset();

        var storage2 = new Storage('bogus://127.0.0.1:1234/custom', {custom: {foo: 'bar'}});

        assert.equal ( storage2.url, 'bogus://127.0.0.1:1234/custom' );

        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
      }
    },

    '.klass': function() {
      assert.property ( storage, 'klass' );
      assert.equal ( storage.klass, require('../lib/storage') );
    },

    '.defaults': function() {
      assert.property ( Storage, 'defaults' );

      assert.equal ( Storage.defaults.url, null );
      assert.typeOf ( Storage.defaults.options, 'object' );
    },

    '.url': function() {
      assert.typeOf ( Storage.url, 'undefined' );

      Storage.reset();

      Storage.url = 'storage://127.0.0.1:1234/store';
      assert.equal ( (new Storage()).url, 'storage://127.0.0.1:1234/store' );
    },

    '.options': function() {
      assert.typeOf ( Storage.options, 'object' );
    },

    '.reset()': function() {
      assert.typeOf ( Storage.reset, 'function' );

      Storage.url = "bogus://127.0.0.1:1234/custom";
      assert.equal ( Storage.url, "bogus://127.0.0.1:1234/custom" );

      Storage.reset();

      assert.equal ( Storage.url, null );
    }
  },

  'Storage.prototype': {
    '#url': function() {
      assert.property ( storage, 'url' );
      assert.typeOf ( storage.url, 'null' );
    },

    '#options': function() {
      assert.property ( storage, 'options' );
      assert.typeOf ( storage.options, 'object' );
    },

    '#client': function() {
      assert.property ( storage, 'client' );
      assert.typeOf ( storage.client, 'null' );
    },

    '#key': function() {
      assert.isFunction ( storage.key );
      assert.throws ( storage.set, Error );
    },

    '#set': function() {
      assert.isFunction ( storage.set );
      assert.throws ( storage.set, Error );
    },

    '#get': function() {
      assert.isFunction ( storage.get );
      assert.throws ( storage.set, Error );
    },

    '#del | delete': function() {
      assert.isFunction ( storage.del );
      assert.throws ( storage.set, Error );

      assert.isFunction ( storage.delete );
      assert.throws ( storage.delete, Error );
    },

    '#end': function() {
      assert.isFunction ( storage.end );
      assert.throws ( storage.end, Error );
    }
  }
}

module.exports = Spec;
