require('sugar');
var helper = require('../spec_helper'),
    assert = helper.assert,
    debug = helper.debug;

    Storage = require('../../lib/storage/mongodb'),
    storage = new Storage();

    driver = require('mongodb'),
    Client = driver.Db,
    Server = driver.Server,
    client = new Client('default_test', new Server('localhost', 27017), {safe:false});

var native = {
  get: function(type, id, callback) {
    var client = new Client('default_test', new Server('localhost', 27017), {safe:false});
    client.open(function(err, db) {
      db.collection(type, function(err, collection) {
        collection.findOne({_id:id}, function(err, doc) {
          db.close();
          callback(err, doc);
        });
      });
    });
  },
  set: function(type, id, data, callback) {
    var client = new Client('default_test', new Server('localhost', 27017), {safe:false});
    client.open(function(err, db) {
      db.collection(type, function(err, collection) {
        data._id = id;
        collection.update({_id:id}, data, {upsert:true, safe:true}, function(err, count) {
          db.close();
          callback(err, count);
        });
      });
    });
  },
  del: function(type, id, callback) {
    var client = new Client('default_test', new Server('localhost', 27017), {safe:false});
    client.open(function(err, db) {
      db.collection(type, function(err, collection) {
        collection.remove({_id:id}, {safe:true}, function(err, doc) {
          db.close();
          callback(err, doc);
        });
      });
    });
  }
};

var Spec = {

  '#set': {
    'one': {
      '<NEW_KEY>': {
        "(<STRING_KEY>, <JSON_VALUE>)  =>  [true] (REVIEW)": function(done) {
          storage.set('set/new-one-foo_1-a', {foo: 'bar_1'}, function(storage_err, storage_response) {
            native.get('set', 'new-one-foo_1-a', function(native_err, native_response) {
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
            native.get('set', 'new-one-foo_1-b', function(native_err, native_response) {
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
            native.get('set', 'new-many-foo_1-c', function(native_err_1, native_response_1) {
              native.get('set', 'new-many-foo_2-c', function(native_err_2, native_response_2) {
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
        "(<NEW_KEY>)  =>  [null] (REVIEW)": function(done) {
          storage.get('get/new-one-foo_1-a', function(storage_err, storage_response) {
            assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([null]) );
            done();
          });
        }
      }, // <NEW_KEY>

      '<EXISTING_KEY>': {
        "(<EXISTING_KEY>)  =>  [<JSON_VALUE>]  (REVIEW)": function(done) {
          native.set('get', 'existing-one-foo_1-b', {foo: 'bar_1'}, function(native_err, native_response) {
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
          native.set('get', 'existing-one-foo_1-d', {foo: 'bar_1'}, function(native_err, native_response) {
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
          native.set('get', 'existing-many-foo_1-b', {foo: 'bar_1'}, function(native_err, native_response) {
            storage.get(['get/new-many-foo_1-b', 'get/existing-many-foo_1-b'], function(storage_err, storage_response) {
              assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([null, {foo: 'bar_1', _id: 'existing-many-foo_1-b'}]) );
              done();
            });
          });
        }
      }, // [<NEW_KEY>, <EXISTING_KEY>]

      '[<EXISTING_KEY>, <NEW_KEY>]': {
        "([<EXISTING_KEY>, <NEW_KEY>])  =>  [JSON_VALUE, null]": function(done) {
          native.set('get', 'existing-many-foo_1-c', {foo: 'bar_1'}, function(native_err, native_response) {
            storage.get(['get/existing-many-foo_1-c', 'get/new-many-foo_1-c'], function(storage_err, storage_response) {
              assert.deepEqual ( JSON.stringify(storage_response), JSON.stringify([{foo: 'bar_1', _id: 'existing-many-foo_1-c'}, null]) );
              done();
            });
          });
        }
      }, // [<EXISTING_KEY>, <NEW_KEY>]

      '[<EXISTING_KEY>, <EXISTING_KEY>]': {
        "([<EXISTING_KEY>, <EXISTING_KEY>])  =>  [<JSON_VALUE>, <JSON_VALUE>]": function(done) {
          native.set('get', 'existing-many-foo_1-d', {foo: 'bar_1'}, function() {
            native.set('get', 'existing-many-foo_2-d', {foo: 'bar_2'}, function() {
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
        "(<NEW_KEY>)  =>  [false] (REVIEW)": function(done) {
          storage.del('delete/new-one-foo_1-a', function(storage_err, storage_response) {
            native.get('delete', 'new-one-foo_1-a', function(native_err, native_response) {
              assert.deepEqual ( storage_response, [false] );
              assert.deepEqual ( JSON.stringify(native_response), JSON.stringify(null) );
              done();
            });
          });
        }
      }, // <NEW_KEY>

      '<EXISTING_KEY>': {
        "(<EXISTING_KEY>)  =>  [true] (REVIEW)": function(done) {
          native.set('delete', 'existing-one-foo_1-b', {foo: 'bar_1'}, function() {
            storage.del('delete/existing-one-foo_1-b', function(storage_err, storage_response) {
              native.get('delete', 'existing-one-foo_1-b', function(native_err, native_response) {
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
            native.get('delete', 'new-one-foo_1-c', function(native_err, native_response) {
              assert.deepEqual ( storage_response, [false] );
              assert.deepEqual ( JSON.stringify(native_response), JSON.stringify(null) );
              done();
            });
          });
        }
      }, // [<NEW_KEY>]

      '[<EXISTING_KEY>]': {
        "([<EXISTING_KEY>])  =>  [true]": function(done) {
          native.set('delete', 'existing-one-foo_1-d', {foo: 'bar_1'}, function() {
            storage.del(['delete/existing-one-foo_1-d'], function(storage_err, storage_response) {
              native.get('delete', 'existing-one-foo_1-d', function(native_err, native_response) {
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
            native.get('delete', 'new-many-foo_1-a', function(native_err_1, native_response_1) {
              native.get('delete', 'new-many-foo_2-a', function(native_err_2, native_response_2) {
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
          native.set('delete', 'existing-many-foo_1-b', {foo: 'bar_1'}, function() {
            storage.del(['delete/new-many-foo_1-b', 'delete/existing-many-foo_1-b'], function(storage_err, storage_response) {
              native.get('delete', 'new-many-foo_1-b', function(native_err_1, native_response_1) {
                native.get('delete', 'existing-many-foo_1-b', function(native_err_2, native_response_2) {
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
          native.set('delete', 'existing-many-foo_1-c', {foo: 'bar_1'}, function() {
            storage.del(['delete/existing-many-foo_1-c', 'delete/new-many-foo_1-c'], function(storage_err, storage_response) {
              native.get('delete', 'existing-many-foo_1-c', function(native_err_1, native_response_1) {
                native.get('delete', 'new-many-foo_1-c', function(native_err_2, native_response_2) {
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
          native.set('delete', 'existing-many-foo_1-d', {foo: 'bar_1'}, function() {
            native.set('delete', 'existing-many-foo_2-d', {foo: 'bar_2'}, function() {
              storage.del(['delete/existing-many-foo_1-d', 'delete/existing-many-foo_2-d'], function(storage_err, storage_response) {
                native.get('delete', 'existing-many-foo_1-d', function(native_err_1, native_response_1) {
                  native.get('delete', 'existing-many-foo_2-d', function(native_err_2, native_response_2) {
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
};

module.exports = Spec;
