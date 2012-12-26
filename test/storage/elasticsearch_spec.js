require('sugar');
var helper = require('../spec_helper'),
    assert = helper.assert,
    flag = helper.flag,
    debug = helper.debug,

    Storage = require('../../lib/storage/elasticsearch'),
    storage = new Storage(),

    native = require('./native/elasticsearch');

process.env.ELASTICSEARCH_URL_AUTHORIZED = process.env.ELASTICSEARCH_URL_AUTHORIZED || 'http://vt4t5uu0:pk9q6whooingl4uo@jasmine-4473159.us-east-1.bonsai.io:80/test';
process.env.ELASTICSEARCH_URL_UNAUTHORIZED = process.env.ELASTICSEARCH_URL_UNAUTHORIZED || 'http://vt4t5uu0:123@jasmine-4473159.us-east-1.bonsai.io:80/test';

console.log("\nELASTICSEARCH_URL_AUTHORIZED = %s\nELASTICSEARCH_URL_UNAUTHORIZED = %s", process.env.ELASTICSEARCH_URL_AUTHORIZED, process.env.ELASTICSEARCH_URL_UNAUTHORIZED);

var Spec = {

  'ElasticSearch': {
    'new': {
      '()': function() {
        assert.instanceOf ( storage, require('../../lib/storage/elasticsearch') );
        assert.instanceOf ( storage, require('../../lib/storage') );

        Storage.reset();

        var storage2 = new Storage();

        assert.equal ( storage2.url, 'http://localhost:9200/default-test' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '("url")': function() {
        Storage.reset();

        var storage2 = new Storage('http://127.0.0.1:9200/custom');

        assert.equal ( storage2.url, 'http://127.0.0.1:9200/custom' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '(options)': function() {
        Storage.reset();

        var storage2 = new Storage({custom: {foo: 'bar'}});

        assert.equal ( storage2.url, 'http://localhost:9200/default-test' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
      },

      '("url", options)': function() {
        Storage.reset();

        var storage2 = new Storage('http://127.0.0.1:9200/custom', {custom: {foo: 'bar'}});

        assert.equal ( storage2.url, 'http://127.0.0.1:9200/custom' );

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

      assert.equal ( Storage.defaults.url, 'http://localhost:9200/default-test' );
      assert.typeOf ( Storage.defaults.options, 'object' );
    },

    '.url': function() {
      assert.typeOf ( Storage.url, 'string' );
      assert.equal ( Storage.url, 'http://localhost:9200/default-test' );
    },

    '.options': function() {
      assert.typeOf ( Storage.options, 'object' );
    },

    '.reset()': function() {
      assert.typeOf ( Storage.reset, 'function' );

      Storage.url = "http://127.0.0.1:9200/custom";
      assert.equal ( Storage.url, "http://127.0.0.1:9200/custom" );

      Storage.reset();

      assert.equal ( Storage.url, 'http://localhost:9200/default-test' );
    }
  },

  'ElasticSearch.prototype': {
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

          var storage = new Storage(process.env.ELASTICSEARCH_URL_UNAUTHORIZED);

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

          var storage = new Storage(process.env.ELASTICSEARCH_URL_AUTHORIZED);

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
      } // auth
    }, // Connection

    '#set': {
      'one': {
        '<NEW_KEY>': {
          "(<STRING_KEY>, <JSON_VALUE>)  =>  [true]": function(done) {
            storage.set('set/new-one-foo_1-a', {foo: 'bar_1'}, function(storage_err, storage_response) {
              native.get('default-test', 'set', 'new-one-foo_1-a', function(client_err, client_response) {
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
              native.get('default-test', 'set', 'new-one-foo_1-b', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [true] );
                assert.deepEqual ( client_response, {foo: 'bar_1'} );
                done();
              });
            });
          }
        } // '[<NEW_KEY>]
      }, // one

      'many': {
        '[<NEW_KEY>, <NEW_KEY]': {
          "([<STRING_KEY_1>, <STRING_KEY_2>], [<JSON_VALUE_1>, <JSON_VALUE_2>])  =>  [true, true]": function(done) {
            storage.set(['set/new-many-foo_1-c', 'set/new-many-foo_2-c'], [{foo: 'bar_1'}, {foo: 'bar_2'}], function(storage_err, storage_response) {
              native.get('default-test', 'set', 'new-many-foo_1-c', function(client_err_1, client_response_1) {
                native.get('default-test', 'set', 'new-many-foo_2-c', function(client_err_2, client_response_2) {
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
          "(<NEW_KEY>)  =>  [null]": function(done) {
            storage.get('get/new-one-foo_1-a', function(storage_err, storage_response) {
              assert.deepEqual ( storage_response, [null] );
              done();
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  [<JSON_VALUE>]', 'set', '": function(done) {
            native.set('default-test', 'get', 'existing-one-foo_1-b', {foo: 'bar_1'}, function() {
              storage.get(['get/existing-one-foo_1-b'], function(storage_err, storage_response) {
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}] );
                done();
              });
            });
          }
        }, // <EXISTING_KEY>

        '[<NEW_KEY>]': {
          "([<NEW_KEY>])  =>  [null]": function(done) {
            storage.get(['get/new-one-foo_1-c'], function(storage_err, storage_response) {
              assert.deepEqual ( storage_response, [null] );
              done();
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [<JSON_VALUE>]": function(done) {
            native.set('default-test', 'get', 'existing-one-foo_1-d', {foo: 'bar_1'}, function() {
              storage.get(['get/existing-one-foo_1-d'], function(storage_err, storage_response) {
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
            storage.get(['get/new-many-foo_1-a', 'get/new-many-foo_2-a'], function(storage_err, storage_response) {
              assert.deepEqual ( storage_response, [null, null] );
              done();
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [null, JSON_VALUE]": function(done) {
            native.set('default-test', 'get', 'existing-many-foo_1-b', {foo: 'bar_1'}, function() {
              storage.get(['get/new-many-foo_1-b', 'get/existing-many-foo_1-b'], function(storage_err, storage_response) {
                assert.deepEqual ( storage_response, [null, {foo: 'bar_1'}] );
                done();
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [JSON_VALUE, null]": function(done) {
            native.set('default-test', 'get', 'existing-many-foo_1-c', {foo: 'bar_1'}, function() {
              storage.get(['get/existing-many-foo_1-c', 'get/new-many-foo_1-c'], function(storage_err, storage_response) {
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}, null] );
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
          "(<NEW_KEY>)  =>  [false]": function(done) {
            storage.del('del/new-one-foo_1-a', function(storage_err, storage_response) {
              native.get('default-test', 'del', 'new-one-foo_1-a', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( client_response, null );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  [true]": function(done) {
            native.set('default-test', 'del', 'existing-one-foo_1-b', {foo: 'bar_1'}, function() {
              storage.del('del/existing-one-foo_1-b', function(storage_err, storage_response) {
                native.get('default-test', 'del', 'existing-one-foo_1-b', function(client_err, client_response) {
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
              native.get('default-test', 'del', 'existing-one-foo_1-c', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.deepEqual ( client_response, null );
                done();
              });
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [true]": function(done) {
            native.set('default-test', 'del', 'existing-one-foo_1-d', {foo: 'bar_1'}, function() {
              storage.del(['del/existing-one-foo_1-d'], function(storage_err, storage_response) {
                native.get('default-test', 'del', 'existing-one-foo_1-d', function(client_err, client_response) {
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
          "([<NEW_KEY>, <NEW_KEY>])  =>  [false, false]": function() {
            storage.del(['del/new-many-foo_1-a', 'del/new-many-foo_2-a'], function(storage_err, storage_response) {
              native.get('default-test', 'del', 'new-many-foo_1-a', function(client_err_1, client_response_1) {
                native.get('default-test', 'del', 'new-many-foo_2-a', function(client_err_2, client_response_2) {
                  assert.deepEqual ( storage_response, [false, false] );
                  assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
                });
              });
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [false, true]": function(done) {
            native.set('default-test', 'del', 'existing-many-foo_1-b', {foo: 'bar_1'}, function() {
              storage.del(['del/new-many-foo_1-b', 'del/existing-many-foo_1-b'], function(storage_err, storage_response) {
                native.get('default-test', 'del', 'new-many-foo_1-b', function(client_err_1, client_response_1) {
                  native.get('default-test', 'del', 'existing-many-foo_1-b', function(client_err_2, client_response_2) {
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
            native.set('default-test', 'del', 'existing-many-foo_1-c', {foo: 'bar_1'}, function() {
              storage.del(['del/existing-many-foo_1-c', 'del/new-many-foo_1-c'], function(storage_err, storage_response) {
                native.get('default-test', 'del', 'existing-many-foo_1-c', function(client_err_1, client_response_1) {
                  native.get('default-test', 'del', 'new-many-foo_1-c', function(client_err_2, client_response_2) {
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
            native.set('default-test', 'del', 'existing-many-foo_1-d', {foo: 'bar_1'}, function() {
              native.set('default-test', 'del', 'existing-many-foo_2-d', {foo: 'bar_2'}, function() {
                storage.del(['del/existing-many-foo_1-d', 'del/existing-many-foo_2-d'], function(storage_err, storage_response) {
                  native.get('default-test', 'del', 'existing-many-foo_1-d', function(client_err_1, client_response_1) {
                    native.get('default-test', 'del', 'existing-many-foo_2-d', function(client_err_2, client_response_2) {
                      assert.deepEqual ( storage_response, [true, true] );
                      assert.deepEqual ( [client_response_1, client_response_2], [null , null] );
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

