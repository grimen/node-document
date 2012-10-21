require('sugar');
var helper = require('../spec_helper'),
    assert = helper.assert,
    debug = helper.debug,

    Storage = require('../../lib/storage/elasticsearch'),
    storage = new Storage(),

    Client = require('elastical'),
    client = new Client.Client();

var Spec = {

  '#set': {
    'one': {
      '<NEW_KEY>': {
        "(<STRING_KEY>, <JSON_VALUE>)  =>  [true] (REVIEW)": function(done) {
          storage.set('set/new-one-foo_1-a', {foo: 'bar_1'}, function(storage_err, storage_response) {
            client.get('default.test', 'new-one-foo_1-a', {_type: 'set'}, function(client_err, client_response) {
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
            client.get('default.test', 'new-one-foo_1-b', {_type: 'set'}, function(client_err, client_response) {
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
            client.get('default.test', 'new-many-foo_1-c', {_type: 'set'}, function(client_err_1, client_response_1) {
              client.get('default.test', 'new-many-foo_2-c', {_type: 'set'}, function(client_err_2, client_response_2) {
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
          storage.get('get/new-one-foo_1-a', function(storage_err, storage_response) {
            assert.deepEqual ( storage_response, [null] );
            done();
          });
        }
      }, // <NEW_KEY>

      '<EXISTING_KEY>': {
        "(<EXISTING_KEY>)  =>  [<JSON_VALUE>]  (REVIEW)": function(done) {
          client.index('default.test', 'get', {foo: 'bar_1'}, {id: 'existing-one-foo_1-b', create: false}, function(client_err, client_response) {
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
          client.index('default.test', 'get', {foo: 'bar_1'}, {id: 'existing-one-foo_1-d', create: false}, function(client_err, client_response) {
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
          client.index('default.test', 'get', {foo: 'bar_1'}, {id: 'existing-many-foo_1-b', create: false}, function(client_err, client_response) {
            storage.get(['get/new-many-foo_1-b', 'get/existing-many-foo_1-b'], function(storage_err, storage_response) {
              assert.deepEqual ( storage_response, [null, {foo: 'bar_1'}] );
              done();
            });
          });
        }
      }, // [<NEW_KEY>, <EXISTING_KEY>]

      '[<EXISTING_KEY>, <NEW_KEY>]': {
        "([<EXISTING_KEY>, <NEW_KEY>])  =>  [JSON_VALUE, null]": function(done) {
          client.index('default.test', 'get', {foo: 'bar_1'}, {id: 'existing-many-foo_1-c', create: false}, function(client_err, client_response) {
            storage.get(['get/existing-many-foo_1-c', 'get/new-many-foo_1-c'], function(storage_err, storage_response) {
              assert.deepEqual ( storage_response, [{foo: 'bar_1'}, null] );
              done();
            });
          });
        }
      }, // [<EXISTING_KEY>, <NEW_KEY>]

      '[<EXISTING_KEY>, <EXISTING_KEY>]': {
        "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [<JSON_VALUE>, <JSON_VALUE>]": function(done) {
          client.index('default.test', 'get', {foo: 'bar_1'}, {id: 'existing-many-foo_1-d', create: false}, function() {
            client.index('default.test', 'get', {foo: 'bar_2'}, {id: 'existing-many-foo_2-d', create: false}, function() {
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
        "(<NEW_KEY>)  =>  [false] (REVIEW)": function(done) {
          storage.del('delete/new-one-foo_1-a', function(storage_err, storage_response) {
            client.get('default.test', 'new-one-foo_1-a', {type: 'delete'}, function(client_err, client_response) {
              assert.deepEqual ( storage_response, [false] );
              assert.deepEqual ( client_response, null );
              done();
            });
          });
        }
      }, // <NEW_KEY>

      '<EXISTING_KEY>': {
        "(<EXISTING_KEY>)  =>  [true] (REVIEW)": function(done) {
          client.index('default.test', 'delete', {foo: 'bar_1'}, {id: 'existing-one-foo_1-b', create: false}, function() {
            storage.del('delete/existing-one-foo_1-b', function(storage_err, storage_response) {
              client.get('default.test', 'existing-one-foo_1-b', {type: 'delete'}, function(client_err, client_response) {
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
          storage.del(['delete/new-one-foo_1-c'], function(storage_err, storage_response) {
            client.get('default.test', 'existing-one-foo_1-c', {type: 'delete'}, function(client_err, client_response) {
              assert.deepEqual ( storage_response, [false] );
              assert.deepEqual ( client_response, null );
              done();
            });
          });
        }
      }, // [<NEW_KEY>]

      '[<EXISTING_KEY>]': {
        "([<EXISTING_KEY>])  =>  [true]": function(done) {
          client.index('default.test', 'delete', {foo: 'bar_1'}, {id: 'existing-one-foo_1-d', create: false}, function() {
            storage.del(['delete/existing-one-foo_1-d'], function(storage_err, storage_response) {
              client.get('default.test', 'existing-one-foo_1-d', {type: 'delete'}, function(client_err, client_response) {
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
          storage.del(['delete/new-many-foo_1-a', 'delete/new-many-foo_2-a'], function(storage_err, storage_response) {
            client.get('default.test', 'new-many-foo_1-a', {type: 'delete'}, function(client_err_1, client_response_1) {
              client.get('default.test', 'new-many-foo_2-a', {type: 'delete'}, function(client_err_2, client_response_2) {
                assert.deepEqual ( storage_response, [false, false] );
                assert.deepEqual ( [client_response_1, client_response_2], [null, null] );
              });
            });
          });
        }
      }, // [<NEW_KEY>, <NEW_KEY>]

      '[<NEW_KEY>, <EXISTING_KEY>]': {
        "([<NEW_KEY>, <EXISTING_KEY>])  =>  [false, true]": function(done) {
          client.index('default.test', 'delete', {foo: 'bar_1'}, {id: 'existing-many-foo_1-b', create: false}, function() {
            storage.del(['delete/new-many-foo_1-b', 'delete/existing-many-foo_1-b'], function(storage_err, storage_response) {
              client.get('default.test', 'new-many-foo_1-b', {type: 'delete'}, function(client_err_1, client_response_1) {
                client.get('default.test', 'existing-many-foo_1-b', {type: 'delete'}, function(client_err_2, client_response_2) {
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
          client.index('default.test', 'delete', {foo: 'bar_1'}, {id: 'existing-many-foo_1-c', create: false}, function() {
            storage.del(['delete/existing-many-foo_1-c', 'delete/new-many-foo_1-c'], function(storage_err, storage_response) {
              client.get('default.test', 'existing-many-foo_1-c', {type: 'delete'}, function(client_err_1, client_response_1) {
                client.get('default.test', 'new-many-foo_1-c', {type: 'delete'}, function(client_err_2, client_response_2) {
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
          client.index('default.test', 'delete', {foo: 'bar_1'}, {id: 'existing-many-foo_1-d', create: false}, function() {
            client.index('default.test', 'delete', {foo: 'bar_2'}, {id: 'existing-many-foo_2-d', create: false}, function() {
              storage.del(['delete/existing-many-foo_1-d', 'delete/existing-many-foo_2-d'], function(storage_err, storage_response) {
                client.get('default.test', 'existing-many-foo_1-d', {type: 'delete'}, function(client_err_1, client_response_1) {
                  client.get('default.test', 'existing-many-foo_2-d', {type: 'delete'}, function(client_err_2, client_response_2) {
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

};

module.exports = Spec;

