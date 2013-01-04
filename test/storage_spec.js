var helper = require('./helper'),
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

    '.name': function() {
      assert.property ( Storage, 'name' );
      assert.equal ( Storage.name, 'Storage' );
    },

    '.defaults': function() {
      assert.property ( Storage, 'defaults' );

      assert.equal ( Storage.defaults.url, null );
      assert.typeOf ( Storage.defaults.options, 'object' );
    },

    '.url': function() {
      assert.property ( Storage, 'url' );
      assert.typeOf ( Storage.url, 'null' );

      Storage.reset();

      Storage.url = 'storage://127.0.0.1:1234/store';
      assert.equal ( (new Storage()).url, 'storage://127.0.0.1:1234/store' );
    },

    '.options': function() {
      assert.property ( Storage, 'options' );
      assert.typeOf ( Storage.options, 'object' );
    },

    '.reset()': function() {
      assert.property ( Storage, 'reset' );
      assert.typeOf ( Storage.reset, 'function' );

      Storage.url = "bogus://127.0.0.1:1234/custom";
      assert.equal ( Storage.url, "bogus://127.0.0.1:1234/custom" );

      Storage.reset();

      assert.equal ( Storage.url, null );
    }
  },

  'Storage.prototype': {
    '#name': function() {
      assert.property ( storage, 'name' );
      assert.equal ( storage.name, 'Storage' );
    },

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

    '#ready': function() {
      assert.property ( storage, 'ready' );
      assert.typeOf ( storage.ready, 'boolean' );
    },

    '#queue': function() {
      assert.property ( storage, 'queue' );
      assert.typeOf ( storage.queue, 'array' );
    },

    '#key': function() {
      assert.property ( storage, 'key' );
      assert.typeOf ( storage.key, 'function' );
      assert.throws ( storage.key, Error );
    },

    '#set': function() {
      assert.property ( storage, 'set' );
      assert.typeOf ( storage.set, 'function' );
      assert.throws ( storage.set, Error );
    },

    '#get': function() {
      assert.property ( storage, 'get' );
      assert.typeOf ( storage.get, 'function' );
      assert.throws ( storage.get, Error );
    },

    '#del': function() {
      assert.property ( storage, 'del' );
      assert.typeOf ( storage.del, 'function' );
      assert.throws ( storage.del, Error );
    },

    '#exists': function() {
      assert.property ( storage, 'exists' );
      assert.typeOf ( storage.exists, 'function' );
      assert.throws ( storage.exists, Error );
    },

    '#end': function() {
      assert.property ( storage, 'end' );
      assert.typeOf ( storage.end, 'function' );
      assert.doesNotThrow ( storage.end, Error );
    },

    '#pack': function() {
      assert.property ( storage, 'pack' );
      assert.typeOf ( storage.pack, 'function' );
      assert.deepEqual ( storage.pack({foo: 'bar'}), {foo: 'bar'} );
    },

    '#unpack': function() {
      assert.property ( storage, 'unpack' );
      assert.typeOf ( storage.unpack, 'function' );
      assert.deepEqual ( storage.pack({foo: 'bar'}), {foo: 'bar'} );
    },

    '#on': function() {
      assert.property ( storage, 'on' );
      assert.typeOf ( storage.on, 'function' );
      assert.throws ( storage.on, Error );
    },

    '#off': function() {
      assert.property ( storage, 'off' );
      assert.typeOf ( storage.off, 'function' );
      assert.throws ( storage.off, Error );
    },

    '#emit': function() {
      assert.property ( storage, 'emit' );
      assert.typeOf ( storage.emit, 'function' );
      assert.throws ( storage.emit, Error );
    }
  }
}

module.exports = Spec;
