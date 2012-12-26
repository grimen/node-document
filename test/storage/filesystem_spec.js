require('sugar');
var helper = require('../spec_helper'),
    assert = helper.assert,
    debug = helper.debug,

    Storage = require('../../lib/storage/filesystem'),
    storage = new Storage(),

    native = require('./native/filesystem');

var Spec = {

  'FileSystem': {
    'new': {
      '()': function() {
        assert.instanceOf ( storage, require('../../lib/storage/filesystem') );
        assert.instanceOf ( storage, require('../../lib/storage') );

        Storage.reset();

        var storage2 = new Storage();

        assert.equal ( storage2.url, 'file:///tmp/default-test' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '("url")': function() {
        Storage.reset();

        var storage2 = new Storage('file:///tmp/custom');

        assert.equal ( storage2.url, 'file:///tmp/custom' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '(options)': function() {
        Storage.reset();

        var storage2 = new Storage({custom: {foo: 'bar'}});

        assert.equal ( storage2.url, 'file:///tmp/default-test' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
      },

      '("url", options)': function() {
        Storage.reset();

        var storage2 = new Storage('file:///tmp/custom', {custom: {foo: 'bar'}});

        assert.equal ( storage2.url, 'file:///tmp/custom' );

        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
      }
    },

    '.klass': function() {
      assert.property ( storage, 'klass' );
      assert.equal ( storage.klass, Storage );
    },

    '.defaults': function() {
      assert.property ( Storage, 'defaults' );

      assert.equal ( Storage.defaults.url, 'file:///tmp/default-test' );
      assert.typeOf ( Storage.defaults.options, 'object' );
    },

    '.url': function() {
      assert.typeOf ( Storage.url, 'string' );
      assert.equal ( Storage.url, 'file:///tmp/default-test' );
    },

    '.options': function() {
      assert.typeOf ( Storage.options, 'object' );
    },

    '.reset()': function() {
      assert.typeOf ( Storage.reset, 'function' );

      Storage.url = "file:///tmp/custom";
      assert.equal ( Storage.url, "file:///tmp/custom" );

      Storage.reset();

      assert.equal ( Storage.url, 'file:///tmp/default-test' );
    }
  },

  'FileSystem.prototype': {
    '#url': function() {
      assert.property ( storage, 'url' );
      assert.typeOf ( storage.url, 'string' );
    },

    '#options': function() {
      assert.property ( storage, 'options' );
      assert.typeOf ( storage.options, 'object' );
    },

    '#client': function() {
      assert.property ( storage, 'client' );
      // assert.typeOf ( storage.client, 'object' );
    },

    '#set': {
      'one': {
        '<NEW_KEY>': {
          "(<STRING_KEY>, <JSON_VALUE>)  =>  [true]": function(done) {
            storage.set('set/new-one-foo_1-a', {foo: 'bar_1'}, function(storage_err, storage_response) {
              native.get('/tmp/default-test', 'set', 'new-one-foo_1-a', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [true] );
                assert.deepEqual ( client_response, JSON.stringify({foo: 'bar_1'}) );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '[<NEW_KEY>]': {
          "([<STRING_KEY>], [<JSON_VALUE>])  =>  [true]": function(done) {
            storage.set(['set/new-one-foo_1-b'], [{foo: 'bar_1'}], function(storage_err, storage_response) {
              native.get('/tmp/default-test', 'set', 'new-one-foo_1-b', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [true] );
                assert.deepEqual ( client_response, JSON.stringify({foo: 'bar_1'}) );
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
              native.get('/tmp/default-test', 'set', 'new-many-foo_1-c', function(client_err_1, client_response_1) {
                native.get('/tmp/default-test', 'set', 'new-many-foo_2-c', function(client_err_2, client_response_2) {
                  assert.deepEqual ( storage_response, [true, true] );
                  assert.deepEqual ( [client_response_1, client_response_2], [JSON.stringify({foo: 'bar_1'}), JSON.stringify({foo: 'bar_2'})] );
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
          "(<NEW_KEY>)  =>  [null]": function(done) {
            storage.get('get/new-one-foo_1-a', function(err, storage_response) {
              assert.deepEqual ( storage_response, [null] );
              done();
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  <JSON_VALUE>": function(done) {
            native.set('/tmp/default-test', 'get', 'existing-one-foo_1-a', JSON.stringify({foo: 'bar_1'}), function() {
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
            native.set('/tmp/default-test', 'get', 'existing-one-foo_1-c', JSON.stringify({foo: 'bar_1'}), function() {
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
            native.set('/tmp/default-test', 'get', 'existing-many-foo_1-b', JSON.stringify({foo: 'bar_1'}), function() {
              storage.get(['get/new-many-foo_1-b', 'get/existing-many-foo_1-b'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [null, {foo: 'bar_1'}] );
                done();
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [JSON_VALUE, null]": function(done) {
            native.set('/tmp/default-test', 'get', 'existing-many-foo_1-c', JSON.stringify({foo: 'bar_1'}), function() {
              storage.get(['get/existing-many-foo_1-c', 'get/new-many-foo_1-c'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}, null] );
                done();
              });
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [<JSON_VALUE>, <JSON_VALUE>]": function(done) {
            native.set('/tmp/default-test', 'get', 'existing-many-foo_1-d', JSON.stringify({foo: 'bar_1'}), function() {
              native.set('/tmp/default-test', 'get', 'existing-many-foo_2-d', JSON.stringify({foo: 'bar_2'}), function() {
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

    '#del': {
      'one': {
        '<NEW_KEY>': {
          "(<NEW_KEY>)  =>  [false]": function(done) {
            storage.del('del/new-one-foo_1-a', function(storage_err, storage_response) {
              native.get('/tmp/default-test', 'del', 'new-one-foo_1-a', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( client_response, null );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  [true]": function(done) {
            native.set('/tmp/default-test', 'del', 'existing-one-foo_1-b', JSON.stringify({foo: 'bar_1'}), function() {
              storage.del('del/existing-one-foo_1-b', function(storage_err, storage_response) {
                native.get('/tmp/default-test', 'del', 'existing-one-foo_1-b', function(client_err, client_response) {
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
              native.get('/tmp/default-test', 'del', 'new-one-foo_1-c', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( client_response, null );
                done();
              });
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [true]": function(done) {
            native.set('/tmp/default-test', 'del', 'existing-one-foo_1-d', JSON.stringify({foo: 'bar_1'}), function() {
              storage.del(['del/existing-one-foo_1-d'], function(storage_err, storage_response) {
                native.get('/tmp/default-test', 'del', 'existing-one-foo_1-d', function(client_err, client_response) {
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
              native.get('/tmp/default-test', 'del', 'new-many-foo_1-a', function(client_err_1, client_response_1) {
                native.get('/tmp/default-test', 'del', 'new-many-foo_2-a', function(client_err_2, client_response_2) {
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
            native.set('/tmp/default-test', 'del', 'existing-many-foo_1-b', JSON.stringify({foo: 'bar_1'}), function() {
              storage.del(['del/new-many-foo_1-b', 'del/existing-many-foo_1-b'], function(storage_err, storage_response) {
                native.get('/tmp/default-test', 'del', 'new-many-foo_1-b', function(client_err_1, client_response_1) {
                  native.get('/tmp/default-test', 'del', 'existing-many-foo_1-b', function(client_err_2, client_response_2) {
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
            native.set('/tmp/default-test', 'del', 'existing-many-foo_1-c', JSON.stringify({foo: 'bar_1'}), function() {
              storage.del(['del/existing-many-foo_1-c', 'del/new-many-foo_1-c'], function(storage_err, storage_response) {
                native.get('/tmp/default-test', 'del', 'existing-many-foo_1-c', function(client_err_1, client_response_1) {
                  native.get('/tmp/default-test', 'del', 'new-many-foo_1-c', function(client_err_2, client_response_2) {
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
            native.set('/tmp/default-test', 'del', 'existing-many-foo_1-d', JSON.stringify({foo: 'bar_1'}), function() {
              native.set('/tmp/default-test', 'del', 'existing-many-foo_2-d', JSON.stringify({foo: 'bar_2'}), function() {
                storage.del(['del/existing-many-foo_1-d', 'del/existing-many-foo_2-d'], function(storage_err, storage_response) {
                  native.get('/tmp/default-test', 'del', 'existing-many-foo_1-d', function(client_err_1, client_response_1) {
                    native.get('/tmp/default-test', 'del', 'existing-many-foo_2-d', function(client_err_2, client_response_2) {
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
