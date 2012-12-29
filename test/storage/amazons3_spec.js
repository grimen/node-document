require('colors');

if (!process.env.AMAZON_S3_URL) {
  console.warn('\n[NOTICE]: Required to run all tests: `process.env.AMAZON_S3_URL`'.red);
  return;
  // process.env.AMAZON_S3_URL = 'https://s3.amazonaws.com/node-document-default-test';
}

if (!process.env.AMAZON_S3_URL_AUTHORIZED) {
  console.warn('\n[NOTICE]: Required to run all tests: `process.env.AMAZON_S3_URL_AUTHORIZED`');
  return;
}

if (!process.env.AMAZON_S3_URL_UNAUTHORIZED) {
  console.warn('\n[NOTICE]: Required to run all tests: `process.env.AMAZON_S3_URL_UNAUTHORIZED`');
  return;
}

require('sugar');
var helper = require('../spec_helper'),
    assert = helper.assert,
    flag = helper.flag,
    debug = helper.debug,

    Storage = require('../../lib/storage/amazons3'),
    storage = new Storage(),

    native = require('./native/amazons3');

process.env.AMAZON_S3_URL_AUTHORIZED = process.env.AMAZON_S3_URL_AUTHORIZED || '<AUTHORIZED-URL>';
process.env.AMAZON_S3_URL_UNAUTHORIZED = process.env.AMAZON_S3_URL_UNAUTHORIZED || '<UNAUTHORIZED-URL>';

console.log("\nAMAZON_S3_URL_AUTHORIZED = %s\nAMAZON_S3_URL_UNAUTHORIZED = %s", process.env.AMAZON_S3_URL_AUTHORIZED, process.env.AMAZON_S3_URL_UNAUTHORIZED);

var Spec = {

  'AmazonS3': {
    'new': {
      '()': function() {
        assert.instanceOf ( storage, require('../../lib/storage/amazons3') );
        assert.instanceOf ( storage, require('../../lib/storage') );

        Storage.reset();

        var storage2 = new Storage();

        assert.equal ( storage2.url, '' + process.env.AMAZON_S3_URL );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '("url")': function() {
        Storage.reset();

        var storage2 = new Storage('https://s3.amazonaws.com/custom');

        assert.equal ( storage2.url, 'https://s3.amazonaws.com/custom' );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, undefined );
      },

      '(options)': function() {
        Storage.reset();

        var storage2 = new Storage({custom: {foo: 'bar'}});

        assert.equal ( storage2.url, '' + process.env.AMAZON_S3_URL );
        assert.typeOf ( storage2.options, 'object' );
        assert.deepEqual ( storage2.options.custom, {foo: 'bar'} );
      },

      '("url", options)': function() {
        Storage.reset();

        var storage2 = new Storage('https://s3.amazonaws.com/custom', {custom: {foo: 'bar'}});

        assert.equal ( storage2.url, 'https://s3.amazonaws.com/custom' );

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

      assert.equal ( Storage.defaults.url, '' + process.env.AMAZON_S3_URL );
      assert.typeOf ( Storage.defaults.options, 'object' );
    },

    '.url': function() {
      assert.typeOf ( Storage.url, 'string' );
      assert.equal ( Storage.url, '' + process.env.AMAZON_S3_URL );
    },

    '.options': function() {
      assert.typeOf ( Storage.options, 'object' );
    },

    '.reset()': function() {
      assert.typeOf ( Storage.reset, 'function' );

      Storage.url = "https://s3.amazonaws.com/custom";
      assert.equal ( Storage.url, "https://s3.amazonaws.com/custom" );

      Storage.reset();

      assert.equal ( Storage.url, '' + process.env.AMAZON_S3_URL );
    }
  },

  'AmazonS3.prototype': {
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

          var storage = new Storage(process.env.AMAZON_S3_URL_UNAUTHORIZED);

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

          var storage = new Storage(process.env.AMAZON_S3_URL_AUTHORIZED);

          storage.on('error', function() {});

          storage.on('ready', function(err) {
            if (err) {
              console.log(err)
            }
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
              native.get('node-document-default-test', 'set', 'new-one-foo_1-a', function(client_err, client_response) {
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
              native.get('node-document-default-test', 'set', 'new-one-foo_1-b', function(client_err, client_response) {
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
              native.get('node-document-default-test', 'set', 'new-many-foo_1-c', function(client_err_1, client_response_1) {
                native.get('node-document-default-test', 'set', 'new-many-foo_2-c', function(client_err_2, client_response_2) {
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
            native.set('node-document-default-test', 'get', 'existing-one-foo_1-a', JSON.stringify({foo: 'bar_1'}), function() {
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
            native.set('node-document-default-test', 'get', 'existing-one-foo_1-c', JSON.stringify({foo: 'bar_1'}), function() {
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
            native.set('node-document-default-test', 'get', 'existing-many-foo_1-b', JSON.stringify({foo: 'bar_1'}), function() {
              storage.get(['get/new-many-foo_1-b', 'get/existing-many-foo_1-b'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [null, {foo: 'bar_1'}] );
                done();
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [JSON_VALUE, null]": function(done) {
            native.set('node-document-default-test', 'get', 'existing-many-foo_1-c', JSON.stringify({foo: 'bar_1'}), function() {
              storage.get(['get/existing-many-foo_1-c', 'get/new-many-foo_1-c'], function(err, storage_response) {
                assert.deepEqual ( storage_response, [{foo: 'bar_1'}, null] );
                done();
              });
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [<JSON_VALUE>, <JSON_VALUE>]": function(done) {
            native.set('node-document-default-test', 'get', 'existing-many-foo_1-d', JSON.stringify({foo: 'bar_1'}), function() {
              native.set('node-document-default-test', 'get', 'existing-many-foo_2-d', JSON.stringify({foo: 'bar_2'}), function() {
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
              native.get('node-document-default-test', 'del', 'new-one-foo_1-a', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.match ( client_response, (/\<Error\>\<Code\>NoSuchKey/) );
                done();
              });
            });
          }
        }, // <NEW_KEY>

        '<EXISTING_KEY>': {
          "(<EXISTING_KEY>)  =>  [true]": function(done) {
            native.set('node-document-default-test', 'del', 'existing-one-foo_1-b', JSON.stringify({foo: 'bar_1'}), function() {
              storage.del('del/existing-one-foo_1-b', function(storage_err, storage_response) {
                native.get('node-document-default-test', 'del', 'existing-one-foo_1-b', function(client_err, client_response) {
                  assert.deepEqual ( storage_response, [true] );
                  assert.match ( client_response, (/\<Error\>\<Code\>NoSuchKey/) );
                  done();
                });
              });
            });
          }
        }, // <EXISTING_KEY>

        '[<NEW_KEY>]': {
          "([<NEW_KEY>])  =>  [false]": function(done) {
            storage.del(['del/new-one-foo_1-c'], function(storage_err, storage_response) {
              native.get('node-document-default-test', 'del', 'new-one-foo_1-c', function(client_err, client_response) {
                assert.deepEqual ( storage_response, [false] );
                assert.match ( client_response, (/\<Error\>\<Code\>NoSuchKey/) );
                done();
              });
            });
          }
        }, // [<NEW_KEY>]

        '[<EXISTING_KEY>]': {
          "([<EXISTING_KEY>])  =>  [true]": function(done) {
            native.set('node-document-default-test', 'del', 'existing-one-foo_1-d', JSON.stringify({foo: 'bar_1'}), function() {
              storage.del(['del/existing-one-foo_1-d'], function(storage_err, storage_response) {
                native.get('node-document-default-test', 'del', 'existing-one-foo_1-d', function(client_err, client_response) {
                  assert.deepEqual ( storage_response, [true] );
                  assert.match ( client_response, (/\<Error\>\<Code\>NoSuchKey/) );
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
              native.get('node-document-default-test', 'del', 'new-many-foo_1-a', function(client_err_1, client_response_1) {
                native.get('node-document-default-test', 'del', 'new-many-foo_2-a', function(client_err_2, client_response_2) {
                  assert.deepEqual ( storage_response, [false, false] );
                  assert.match ( client_response_1, (/\<Error\>\<Code\>NoSuchKey/) );
                  assert.match ( client_response_2, (/\<Error\>\<Code\>NoSuchKey/) );
                  done();
                });
              });
            });
          }
        }, // [<NEW_KEY>, <NEW_KEY>]

        '[<NEW_KEY>, <EXISTING_KEY>]': {
          "([<NEW_KEY>, <EXISTING_KEY>])  =>  [false, true]": function(done) {
            native.set('node-document-default-test', 'del', 'existing-many-foo_1-b', JSON.stringify({foo: 'bar_1'}), function() {
              storage.del(['del/new-many-foo_1-b', 'del/existing-many-foo_1-b'], function(storage_err, storage_response) {
                native.get('node-document-default-test', 'del', 'new-many-foo_1-b', function(client_err_1, client_response_1) {
                  native.get('node-document-default-test', 'del', 'existing-many-foo_1-b', function(client_err_2, client_response_2) {
                    assert.deepEqual ( storage_response, [false, true] );
                    assert.match ( client_response_1, (/\<Error\>\<Code\>NoSuchKey/) );
                    assert.match ( client_response_2, (/\<Error\>\<Code\>NoSuchKey/) );
                    done();
                  });
                });
              });
            });
          }
        }, // [<NEW_KEY>, <EXISTING_KEY>]

        '[<EXISTING_KEY>, <NEW_KEY>]': {
          "([<EXISTING_KEY>, <NEW_KEY>])  =>  [true, false]": function(done) {
            native.set('node-document-default-test', 'del', 'existing-many-foo_1-c', JSON.stringify({foo: 'bar_1'}), function() {
              storage.del(['del/existing-many-foo_1-c', 'del/new-many-foo_1-c'], function(storage_err, storage_response) {
                native.get('node-document-default-test', 'del', 'existing-many-foo_1-c', function(client_err_1, client_response_1) {
                  native.get('node-document-default-test', 'del', 'new-many-foo_1-c', function(client_err_2, client_response_2) {
                    assert.deepEqual ( storage_response, [true, false] );
                    assert.match ( client_response_1, (/\<Error\>\<Code\>NoSuchKey/) );
                    assert.match ( client_response_2, (/\<Error\>\<Code\>NoSuchKey/) );
                    done();
                  });
                });
              });
              done();
            });
          }
        }, // [<EXISTING_KEY>, <NEW_KEY>]

        '[<EXISTING_KEY>, <EXISTING_KEY>]': {
          "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [true, true]": function(done) {
            native.set('node-document-default-test', 'del', 'existing-many-foo_1-d', JSON.stringify({foo: 'bar_1'}), function() {
              native.set('node-document-default-test', 'del', 'existing-many-foo_2-d', JSON.stringify({foo: 'bar_2'}), function() {
                storage.del(['del/existing-many-foo_1-d', 'del/existing-many-foo_2-d'], function(storage_err, storage_response) {
                  native.get('node-document-default-test', 'del', 'existing-many-foo_1-d', function(client_err_1, client_response_1) {
                    native.get('node-document-default-test', 'del', 'existing-many-foo_2-d', function(client_err_2, client_response_2) {
                      assert.deepEqual ( storage_response, [true, true] );
                      assert.match ( client_response_1, (/\<Error\>\<Code\>NoSuchKey/) );
                      assert.match ( client_response_2, (/\<Error\>\<Code\>NoSuchKey/) );
                      done();
                    });
                  });
                });
                done();
              });
            });
          }
        } // [<EXISTING_KEY>, <EXISTING_KEY>]
      } // many
    } // #del
  }

};

module.exports = Spec;
