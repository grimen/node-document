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
      }
    },

    '.klass': function() {
      assert.instanceOf ( storage.klass, require('../lib/storage') );
    }
  },

  'Storage.prototype': {
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