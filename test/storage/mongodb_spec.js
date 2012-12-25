require('sugar');
var helper = require('../spec_helper'),
    assert = helper.assert,
    flag = helper.flag,
    debug = helper.debug;

    Storage = require('../../lib/storage/mongodb'),
    storage = new Storage();

    native = require('./native/mongodb');

process.env.MONGODB_URL_AUTHORIZED = process.env.MONGODB_URL_AUTHORIZED || 'mongodb://heroku:f51b96d19b73a934b3d2a0d43e4b7aa7@alex.mongohq.com:10020/app9156953';
process.env.MONGODB_URL_UNAUTHORIZED = process.env.MONGODB_URL_UNAUTHORIZED || 'mongodb://heroku:123@alex.mongohq.com:10020/app9156953';

console.log("\nMONGODB_URL_AUTHORIZED = %s\nMONGODB_URL_UNAUTHORIZED = %s", process.env.MONGODB_URL_AUTHORIZED, process.env.MONGODB_URL_UNAUTHORIZED);

var Spec = {

  'MongoDB': {
    'new': {
      '()': function() {
        assert.instanceOf ( storage, require('../../lib/storage/mongodb') );
        assert.instanceOf ( storage, require('../../lib/storage') );

        Storage.reset();

        var storage2 = new Storage();

        assert.equal ( storage2.url, 'mongodb://localhost:27017/default-test' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '("url")': function() {
        Storage.reset();

        var storage2 = new Storage('mongodb://127.0.0.1:27017/custom');

        assert.equal ( storage2.url, 'mongodb://127.0.0.1:27017/custom' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '(options)': function() {
        Storage.reset();

        var storage2 = new Storage({custom: {foo: 'bar'}});

        assert.equal ( storage2.url, 'mongodb://localhost:27017/default-test' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
      },

      '("url", options)': function() {
        Storage.reset();

        var storage2 = new Storage('mongodb://127.0.0.1:27017/custom', {custom: {foo: 'bar'}});

        assert.equal ( storage2.url, 'mongodb://127.0.0.1:27017/custom' );

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

      assert.equal ( Storage.defaults.url, 'mongodb://localhost:27017/default-test' );
      assert.typeOf ( Storage.defaults.options, 'object' );
    },

    '.url': function() {
      assert.typeOf ( Storage.url, 'string' );
      assert.equal ( Storage.url, 'mongodb://localhost:27017/default-test' );
    },

    '.options': function() {
      assert.typeOf ( Storage.options, 'object' );
    },

    '.reset()': function() {
      assert.typeOf ( Storage.reset, 'function' );

      Storage.url = "mongodb://127.0.0.1:27017/custom";
      assert.equal ( Storage.url, "mongodb://127.0.0.1:27017/custom" );

      Storage.reset();

      assert.equal ( Storage.url, 'mongodb://localhost:27017/default-test' );
    }
  },

  'MongoDB.prototype': {
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

    'Connection': {
      'auth': {
        'ERR': function(done) {
          if (!flag(process.env.NODE_DOCUMENT_TEST_AUTH)) {
            done();
            return;
          }

          var storage = new Storage(process.env.MONGODB_URL_UNAUTHORIZED);

          storage.on('error', function() {});

          storage.on('ready', function(err) {
            assert.notTypeOf ( err, 'null' );

            process.nextTick(function() {
              assert.lengthOf ( storage.queue, 3 );

              assert.deepEqual ( storage.queue[0].slice(0,3), ['set', 'unauthorized/new-one-foo_1-a', {foo: 'bar_1'}] );
              assert.deepEqual ( storage.queue[1].slice(0,3), ['get', 'unauthorized/new-one-foo_1-b'] );
              assert.deepEqual ( storage.queue[2].slice(0,3), ['del', 'unauthorized/new-one-foo_1-c'] );

              done();
            });
          });

          storage.set('unauthorized/new-one-foo_1-a', {foo: 'bar_1'});
          storage.get('unauthorized/new-one-foo_1-b');
          storage.del('unauthorized/new-one-foo_1-c');
        }, // auth ERR

        'OK': function(done) {
          if (!flag(process.env.NODE_DOCUMENT_TEST_AUTH)) {
            done();
            return;
          }

          var storage = new Storage(process.env.MONGODB_URL_AUTHORIZED);

          storage.on('error', function() {});

          storage.on('ready', function(err) {
            assert.typeOf ( err, 'null' );

            process.nextTick(function() {
              assert.lengthOf ( storage.queue, 0 );

              done();
            });
          });

          storage.set('authorized/new-one-foo_1-a', {foo: 'bar_1'});
          storage.get('authorized/new-one-foo_1-b');
          storage.del('authorized/new-one-foo_1-c');
        } // auth OK
      }
    },

    '#set': {
      'one': {
        '<NEW_KEY>': {
          "(<STRING_KEY>, <JSON_VALUE>)  =>  [true]": function(done) {
            storage.set('set/new-one-foo_1-a', {foo: 'bar_1'}, function(storage_err, storage_response) {
              native.get('default-test', 'set', 'new-one-foo_1-a', function(native_err, native_response) {
                assert.deepEqual ( storage_response, [true] );
                assert.deepEqual ( JSON.stringify(native_response), JSON.stringify({foo: 'bar_1', _id: 'new-one-foo_1-a'}) );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '[<NEW_KEY>]': {
          "([<STRING_KEY>], [<JSON_VALUE>])  =>  [true]": function(done) {
            storage.set(['set/new-one-foo_1-b'], [{foo: 'bar_1'}], function(storage_err, storage_response) {
              native.get('default-test', 'set', 'new-one-foo_1-b', function(native_err, native_response) {
                assert.deepEqual ( storage_response, [true] );
                assert.deepEqual ( JSON.stringify(native_response), JSON.stringify({foo: 'bar_1', _id: 'new-one-foo_1-b'}) );
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
              native.get('default-test', 'set', 'new-many-foo_1-c', function(native_err_1, native_response_1) {
                native.get('default-test', 'set', 'new-many-foo_2-c', function(native_err_2, native_response_2) {
                  assert.deepEqual ( storage_response, [true, true] );
                  assert.deepEqual ( JSON.stringify([native_response_1, native_response_2]), JSON.stringify([{foo: 'bar_1', _id: 'new-many-foo_1-c'}, {foo: 'bar_2', _id: 'new-many-foo_2-c'}]) );
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
            storage.get('get/new-one-foo_1-a', function(storage_err, storage_response) {
              assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([null]) );
              done();
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  [<JSON_VALUE>]default-test', 'set', '": function(done) {
            native.set('default-test', 'get', 'existing-one-foo_1-b', {foo: 'bar_1'}, function(native_err, native_response) {
              storage.get(['get/existing-one-foo_1-b'], function(storage_err, storage_response) {
                assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([{foo: 'bar_1', _id: 'existing-one-foo_1-b'}]) );
                done();
              });
            });
          }
        }, // <EXISTING_KEY>

        '[<NEW_KEY>]': {
          "([<NEW_KEY>])  =>  [null]": function(done) {
            storage.get(['get/new-one-foo_1-c'], function(storage_err, storage_response) {
              assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([null]) );
              done();
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [<JSON_VALUE>]": function(done) {
            native.set('default-test', 'get', 'existing-one-foo_1-d', {foo: 'bar_1'}, function(native_err, native_response) {
              storage.get(['get/existing-one-foo_1-d'], function(storage_err, storage_response) {
                assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([{foo: 'bar_1', _id: 'existing-one-foo_1-d'}]) );
                done();
              });
            });
          }
        } // [<EXISTING_KEY>]
      }, // one

      'many': {
        '[<NEW_KEY>, <NEW_KEY>]': {
          "([<NEW_KEY>, <NEW_KEY>])  =>  [null, null]": function(done) {
            storage.get(['get/new-many-foo_1-a', 'get/new-many-foo_2-a'], function(storage_err, storage_response) {
              assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([null, null]) );
              done();
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [null, JSON_VALUE]": function(done) {
            native.set('default-test', 'get', 'existing-many-foo_1-b', {foo: 'bar_1'}, function(native_err, native_response) {
              storage.get(['get/new-many-foo_1-b', 'get/existing-many-foo_1-b'], function(storage_err, storage_response) {
                assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([null, {foo: 'bar_1', _id: 'existing-many-foo_1-b'}]) );
                done();
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [JSON_VALUE, null]": function(done) {
            native.set('default-test', 'get', 'existing-many-foo_1-c', {foo: 'bar_1'}, function(native_err, native_response) {
              storage.get(['get/existing-many-foo_1-c', 'get/new-many-foo_1-c'], function(storage_err, storage_response) {
                assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([{foo: 'bar_1', _id: 'existing-many-foo_1-c'}, null]) );
                done();
              });
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [<JSON_VALUE>, <JSON_VALUE>]": function(done) {
            native.set('default-test', 'get', 'existing-many-foo_1-d', {foo: 'bar_1'}, function() {
              native.set('default-test', 'get', 'existing-many-foo_2-d', {foo: 'bar_2'}, function() {
                storage.get(['get/existing-many-foo_1-d', 'get/existing-many-foo_2-d'], function(storage_err, storage_response) {
                  assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([{foo: 'bar_1', _id: 'existing-many-foo_1-d'}, {foo: 'bar_2', _id: 'existing-many-foo_2-d'}]) );
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
          "(<NEW_KEY>)  =>  [false]": function(done) {
            storage.del('delete/new-one-foo_1-a', function(storage_err, storage_response) {
              native.get('default-test', 'delete', 'new-one-foo_1-a', function(native_err, native_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( JSON.stringify(native_response), JSON.stringify(null) );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  [true]": function(done) {
            native.set('default-test', 'delete', 'existing-one-foo_1-b', {foo: 'bar_1'}, function() {
              storage.del('delete/existing-one-foo_1-b', function(storage_err, storage_response) {
                native.get('default-test', 'delete', 'existing-one-foo_1-b', function(native_err, native_response) {
                  assert.deepEqual ( storage_response, [true] );
                  assert.deepEqual ( JSON.stringify(native_response), JSON.stringify(null) );
                  done();
                });
              });
            });
          }
        }, // <EXISTING_KEY>

        '[<NEW_KEY>]': {
          "([<NEW_KEY>])  =>  [false]": function(done) {
            storage.del(['delete/new-one-foo_1-c'], function(storage_err, storage_response) {
              native.get('default-test', 'delete', 'new-one-foo_1-c', function(native_err, native_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( JSON.stringify(native_response), JSON.stringify(null) );
                done();
              });
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [true]": function(done) {
            native.set('default-test', 'delete', 'existing-one-foo_1-d', {foo: 'bar_1'}, function() {
              storage.del(['delete/existing-one-foo_1-d'], function(storage_err, storage_response) {
                native.get('default-test', 'delete', 'existing-one-foo_1-d', function(native_err, native_response) {
                  assert.deepEqual ( storage_response, [true] );
                  assert.deepEqual (JSON.stringify(native_response), JSON.stringify(null) );
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
            storage.del(['delete/new-many-foo_1-a', 'delete/new-many-foo_2-a'], function(storage_err, storage_response) {
              native.get('default-test', 'delete', 'new-many-foo_1-a', function(native_err_1, native_response_1) {
                native.get('default-test', 'delete', 'new-many-foo_2-a', function(native_err_2, native_response_2) {
                  assert.deepEqual ( storage_response, [false, false] );
                  assert.deepEqual ( [native_response_1, native_response_2], [null, null] );
                  done();
                });
              });
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [false, true]": function(done) {
            native.set('default-test', 'delete', 'existing-many-foo_1-b', {foo: 'bar_1'}, function() {
              storage.del(['delete/new-many-foo_1-b', 'delete/existing-many-foo_1-b'], function(storage_err, storage_response) {
                native.get('default-test', 'delete', 'new-many-foo_1-b', function(native_err_1, native_response_1) {
                  native.get('default-test', 'delete', 'existing-many-foo_1-b', function(native_err_2, native_response_2) {
                    assert.deepEqual ( storage_response, [false, true] );
                    assert.deepEqual ( [native_response_1, native_response_2], [null, null] );
                    done();
                  });
                });
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [true, false]": function(done) {
            native.set('default-test', 'delete', 'existing-many-foo_1-c', {foo: 'bar_1'}, function() {
              storage.del(['delete/existing-many-foo_1-c', 'delete/new-many-foo_1-c'], function(storage_err, storage_response) {
                native.get('default-test', 'delete', 'existing-many-foo_1-c', function(native_err_1, native_response_1) {
                  native.get('default-test', 'delete', 'new-many-foo_1-c', function(native_err_2, native_response_2) {
                    assert.deepEqual ( storage_response, [true, false] );
                    assert.deepEqual ( [native_response_1, native_response_2], [null, null] );
                    done();
                  });
                });
              });
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [true, true]": function(done) {
            native.set('default-test', 'delete', 'existing-many-foo_1-d', {foo: 'bar_1'}, function() {
              native.set('default-test', 'delete', 'existing-many-foo_2-d', {foo: 'bar_2'}, function() {
                storage.del(['delete/existing-many-foo_1-d', 'delete/existing-many-foo_2-d'], function(storage_err, storage_response) {
                  native.get('default-test', 'delete', 'existing-many-foo_1-d', function(native_err_1, native_response_1) {
                    native.get('default-test', 'delete', 'existing-many-foo_2-d', function(native_err_2, native_response_2) {
                      assert.deepEqual ( storage_response, [true, true] );
                      assert.deepEqual ( [native_response_1, native_response_2], [null, null] );
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
