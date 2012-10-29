require('sugar');
var helper = require('../spec_helper'),
    assert = helper.assert,
    debug = helper.debug,

    Storage = require('../../lib/storage/memory'),
    storage = new Storage(),

    native = require('./native/memory');

var Spec = {

  'MemoryStorage': {
    'new': {
      '()': function() {
        assert.instanceOf ( storage, require('../../lib/storage/memory') );
        assert.instanceOf ( storage, require('../../lib/storage') );
      }
    },

    '.klass': function() {
      assert.property ( storage, 'klass' );
      assert.equal ( storage.klass, Storage );
    },

    '.url': function() {
      assert.property ( Storage, 'url' );
      assert.typeOf ( Storage.url, 'string' );
    },

    '.options': function() {
      assert.property ( Storage, 'options' );
      assert.typeOf ( Storage.options, 'object' );
    }
  },

  'MemoryStorage.prototype': {
    '#set': {
      'one': {
        '<NEW_KEY>': {
          "(<STRING_KEY>, <JSON_VALUE>)  =>  [true] (REVIEW)": function(done) {
            storage.set('set/new-one-foo_1-a', {foo: 'bar_1'}, function(storage_err, storage_response) {
              native.get('default.test', 'set', 'new-one-foo_1-a', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [true] );
                assert.deepEqual ( client_response, {foo: 'bar_1'} );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '[<NEW_KEY>]': {
          "([<STRING_KEY>], [<JSON_VALUE>])  =>  [true]": function(done) {
            storage.set(['set/new-one-foo_1-b'], [{foo: 'bar_1'}], function(storage_err, storage_response) {
              native.get('default.test', 'set', 'new-one-foo_1-b', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [true] );
                assert.deepEqual ( client_response, {foo: 'bar_1'} );
                done();
              });
            });
          }
        } // [<NEW_KEY>]
      },

      'many': {
        '[<NEW_KEY>, <NEW_KEY]': {
          "([<STRING_KEY_1>, <STRING_KEY_2>], [<JSON_VALUE_1>, <JSON_VALUE_2>])  =>  [true, true]": function(done) {
            storage.set(['set/new-many-foo_1-c', 'set/new-many-foo_2-c'], [{foo: 'bar_1'}, {foo: 'bar_2'}], function(storage_err, storage_response) {
              native.get('default.test', 'set', 'new-many-foo_1-c', function(client_err_1, client_response_1) {
                native.get('default.test', 'set', 'new-many-foo_2-c', function(client_err_2, client_response_2) {
                  assert.deepEqual ( storage_response, [true, true] );
                  assert.deepEqual ( [client_response_1, client_response_2], [{foo: 'bar_1'}, {foo: 'bar_2'}] );
                  done();
                });
              });
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY]

        '[<NEW_KEY>, <EXISTING_KEY>]': {},
        '[<EXISTING_KEY>, <NEW_KEY>]': {},
        '[<EXISTING_KEY>, <EXISTING_KEY>]': {}
      } // many
    }, // #set

    '#get': {
      'one': {
        '<NEW_KEY>': {
          "(<NEW_KEY>)  =>  [null] (REVIEW)": function(done) {
            storage.get('get/new-one-foo_1-a', function(err, storage_response) {
              assert.deepEqual ( storage_response, [null] );
              done();
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  <JSON_VALUE> (REVIEW)": function(done) {
            native.set('default.test', 'get', 'existing-one-foo_1-a', {foo: 'bar_1'}, function() {
              storage.get('get/existing-one-foo_1-a', function(err, storage_response) {
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}] );
                done();
              });
            });
          }
        }, // <EXISTING_KEY>

        '[<NEW_KEY>]': {
          "([<NEW_KEY>])  =>  [null]": function(done) {
            storage.get(['get/new-one-foo_1-b'], function(err, storage_response) {
              assert.deepEqual ( storage_response, [null] );
              done();
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [<JSON_VALUE>]": function(done) {
            native.set('default.test', 'get', 'existing-one-foo_1-c', {foo: 'bar_1'}, function() {
              storage.get(['get/existing-one-foo_1-c'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}] );
                done();
              });
            });
          }
        } // [<EXISTING_KEY>]
      }, // one

      'many': {
        '[<NEW_KEY>, <NEW_KEY>]': {
          "([<NEW_KEY>, <NEW_KEY>])  =>  [null, null]": function(done) {
            storage.get(['get/new-many-foo_1-a', 'get/new-many-foo_2-a'], function(err, storage_response) {
              assert.deepEqual ( storage_response, [null, null] );
              done();
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [null, JSON_VALUE]": function(done) {
            native.set('default.test', 'get', 'existing-many-foo_1-b', {foo: 'bar_1'}, function() {
              storage.get(['get/new-many-foo_1-b', 'get/existing-many-foo_1-b'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [null, {foo: 'bar_1'}] );
                done();
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [JSON_VALUE, null]": function(done) {
            native.set('default.test', 'get', 'existing-many-foo_1-c', {foo: 'bar_1'}, function() {
              storage.get(['get/existing-many-foo_1-c', 'get/new-many-foo_1-c'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}, null] );
                done();
              });
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [<JSON_VALUE>, <JSON_VALUE>]": function(done) {
            native.set('default.test', 'get', 'existing-many-foo_1-d', {foo: 'bar_1'}, function() {
              native.set('default.test', 'get', 'existing-many-foo_2-d', {foo: 'bar_2'}, function() {
                storage.get(['get/existing-many-foo_1-d', 'get/existing-many-foo_2-d'], function(err, storage_response) {
                  assert.deepEqual ( storage_response, [{foo: 'bar_1'}, {foo: 'bar_2'}] );
                  done();
                });
              });
            });
          }
        } // [<EXISTING_KEY>, <EXISTING_KEY>]
      } // many
    }, // #get

    '#del | #delete': {
      'one': {
        '<NEW_KEY>': {
          "(<NEW_KEY>)  =>  [false] (REVIEW)": function(done) {
            storage.del('del/new-one-foo_1-a', function(storage_err, storage_response) {
              native.get('default.test', 'del', 'new-one-foo_1-a', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( client_response, null );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  [true] (REVIEW)": function(done) {
            native.set('default.test', 'del', 'existing-one-foo_1-b', {foo: 'bar_1'}, function() {
              storage.del('del/existing-one-foo_1-b', function(storage_err, storage_response) {
                native.get('default.test', 'del', 'existing-one-foo_1-b', function(client_err, client_response) {
                  assert.deepEqual ( storage_response, [true] );
                  assert.deepEqual ( client_response, null );
                  done();
                });
              });
            });
          }
        }, // <EXISTING_KEY>

        '[<NEW_KEY>]': {
          "([<NEW_KEY>])  =>  [false]": function(done) {
            storage.del(['del/new-one-foo_1-c'], function(storage_err, storage_response) {
              native.get('default.test', 'del', 'new-one-foo_1-c', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( client_response, null );
                done();
              });
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [true]": function(done) {
            native.set('default.test', 'del', 'existing-one-foo_1-d', {foo: 'bar_1'}, function() {
              storage.del(['del/existing-one-foo_1-d'], function(storage_err, storage_response) {
                native.get('default.test', 'del', 'existing-one-foo_1-d', function(client_err, client_response) {
                  assert.deepEqual ( storage_response, [true] );
                  assert.deepEqual ( client_response, null );
                  done();
                });
              });
            });
          }
        } // [<EXISTING_KEY>]
      }, // one

      'many': {
        '[<NEW_KEY>, <NEW_KEY>]': {
          "([<NEW_KEY>, <NEW_KEY>])  =>  [false, false]": function(done) {
            storage.del(['del/new-many-foo_1-a', 'del/new-many-foo_2-a'], function(storage_err, storage_response) {
              native.get('default.test', 'del', 'new-many-foo_1-a', function(client_err_1, client_response_1) {
                native.get('default.test', 'del', 'new-many-foo_2-a', function(client_err_2, client_response_2) {
                  assert.deepEqual ( storage_response, [false, false] );
                  assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
                  done();
                });
              });
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [false, true]": function(done) {
            native.set('default.test', 'del', 'existing-many-foo_1-b', {foo: 'bar_1'}, function() {
              storage.del(['del/new-many-foo_1-b', 'del/existing-many-foo_1-b'], function(storage_err, storage_response) {
                native.get('default.test', 'del', 'new-many-foo_1-b', function(client_err_1, client_response_1) {
                  native.get('default.test', 'del', 'existing-many-foo_1-b', function(client_err_2, client_response_2) {
                    assert.deepEqual ( storage_response, [false, true] );
                    assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
                    done();
                  });
                });
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [true, false]": function(done) {
            native.set('default.test', 'del', 'existing-many-foo_1-c', {foo: 'bar_1'}, function() {
              storage.del(['del/existing-many-foo_1-c', 'del/new-many-foo_1-c'], function(storage_err, storage_response) {
                native.get('default.test', 'del', 'existing-many-foo_1-c', function(client_err_1, client_response_1) {
                  native.get('default.test', 'del', 'new-many-foo_1-c', function(client_err_2, client_response_2) {
                    assert.deepEqual ( storage_response, [true, false] );
                    assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
                    done();
                  });
                });
              });
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [true, true]": function(done) {
            native.set('default.test', 'del', 'existing-many-foo_1-d', {foo: 'bar_1'}, function() {
              native.set('default.test', 'del', 'existing-many-foo_2-d', {foo: 'bar_2'}, function() {
                storage.del(['del/existing-many-foo_1-d', 'del/existing-many-foo_2-d'], function(storage_err, storage_response) {
                  native.get('default.test', 'del', 'existing-many-foo_1-d', function(client_err_1, client_response_1) {
                    native.get('default.test', 'del', 'existing-many-foo_2-d', function(client_err_2, client_response_2) {
                      assert.deepEqual ( storage_response, [true, true] );
                      assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
                      done();
                    });
                  });
                });
              });
            });
          }
        } // [<EXISTING_KEY>, <EXISTING_KEY>]
      } // many
    } // #del
  }

};

module.exports = Spec;
