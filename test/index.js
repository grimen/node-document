var helper = require('./helper'),
    assert = helper.assert,
    debug = helper.debug;

var Document = require('../'),
    Storage = Document.DefaultStorage;

var Post,
    doc;

// -----------------------
//  Test
// --------------------

module.exports = {

  'Document': {
    '()': {
      'should raise error: require document "type" argument': function() {
        assert.throws(function() {
          Post = Document();
        });
      }
    },

    '("type")': {
      before: function() {
        Post = Document('Post');
      },

      'should successfully create a model': function() {
        assert.typeOf ( Post, 'function' );
      },

      '.type': function() {
        assert.deepEqual ( Post.type, 'Post' );
      },

      '.schema': function() {
        assert.deepEqual ( Post.schema, {} );
      },

      '.storage': function() {
        assert.instanceOf ( Post.storage, Document.DefaultStorage );
      },

      '.set': function() {
        assert.typeOf ( Post.set, 'function' );
      },

      '.get': function() {
        assert.typeOf ( Post.get, 'function' );
      },

      '.del': function() {
        assert.typeOf ( Post.del, 'function' );
      },

      '.end': function() {
        assert.typeOf ( Post.end, 'function' );
      }
    },

    '("type", storage)': {
      before: function() {
        Post = Document('Post', new Storage());
      },

      'should successfully create a model': function() {
        assert.typeOf ( Post, 'function' );
      },

      '.type': function() {
        assert.deepEqual ( Post.type, 'Post' );
      },

      '.schema': function() {
        assert.deepEqual ( Post.schema, {} );
      },

      '.storage': function() {
        assert.instanceOf ( Post.storage, Storage );
      }
    },

    '("type", Storage)': {
      before: function() {
        Post = Document('Post', Storage);
      },

      'should successfully create a model': function() {
        assert.typeOf ( Post, 'function' );
      },

      '.type': function() {
        assert.deepEqual ( Post.type, 'Post' );
      },

      '.schema': function() {
        assert.deepEqual ( Post.schema, {} );
      },

      '.storage': function() {
        assert.instanceOf ( Post.storage, Storage );
      }
    },

    '("type", "<storage_url>")': {
      before: function() {
        Post = Document('Post', 'fs:///tmp/default-test');
      },

      'should successfully create a model': function() {
        assert.typeOf ( Post, 'function' );
      },

      '.type': function() {
        assert.deepEqual ( Post.type, 'Post' );
      },

      '.schema': function() {
        assert.deepEqual ( Post.schema, {} );
      },

      '.storage': function() {
        assert.equal ( Post.storage.klass.id, 'fs' );
        assert.instanceOf ( Post.storage, require('node-document-storage-fs') );
      }
    },

    'new': {
      '()': function() {
        doc = new Post();

        assert.typeOf ( doc, 'object' );
        assert.typeOf ( doc.attributes, 'object' );
        assert.typeOf ( doc.changes, 'null' );
        assert.typeOf ( doc.errors, 'null' );

        assert.deepEqual ( doc.attributes, {} );
        assert.equal ( doc.id, doc.attributes.id );
      },

      '(attributes)': function() {
        doc = new Post({title: "A title", description: "Lorem ipsum..."});

        assert.typeOf ( doc, 'object' );
        assert.typeOf ( doc.attributes, 'object' );
        assert.typeOf ( doc.changes, 'null' );
        assert.typeOf ( doc.errors, 'null' );

        assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
        assert.equal ( doc.id, doc.attributes.id );
      }
    },

    'require': {
      '(valid_adapter_path)': function() {
        assert.equal ( Document.require('class'), Document.Class );
      },

      '(invalid_adapter_path)': function() {
        assert.throws (function() {
          Document.require('storage/bogus');
        });
      }
    }
  }, // Document


  'Document.Model': {
    before: function() {
      Post = Document('Post');
    },

    'Creation': {
      '.new': {
        '()': function() {
          doc = Post.new();

          assert.typeOf ( doc, 'object' );
          assert.typeOf ( doc.attributes, 'object' );
          assert.typeOf ( doc.changes, 'null' );
          assert.typeOf ( doc.errors, 'null' );

          assert.deepEqual ( doc.attributes, {} );
          assert.equal ( doc.id, doc.attributes._id );
        },

        '(attributes)': function() {
          doc = Post.new({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc, 'object' );
          assert.typeOf ( doc.attributes, 'object' );
          assert.typeOf ( doc.changes, 'null' );
          assert.typeOf ( doc.errors, 'null' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.equal ( doc.id, doc.attributes.id );
        }
      }
    }, // Creation


    'Persistance': {
      '.create': {
        'this': function(done) {
          Post.set(0, {}, function() {
            assert.equal ( this, Post );
            done();
          });
        },

        '()': function(done) {
          Post.create(function(err, doc) {
            assert.deepEqual ( doc.attributes, {_id: doc.id} );
            assert.deepEqual ( doc.changes, null );
            assert.deepEqual ( doc.errors, null );
            assert.equal ( doc.persisted, true );
            assert.equal ( doc.new, false );
            done();
          });
        },

        '({})': function(done) {
          Post.create({title: "A title", description: "Lorem ipsum..."}, function(err, doc) {
            assert.deepEqual ( doc.attributes, {_id: doc.id, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( doc.changes, null );
            assert.deepEqual ( doc.errors, null );
            assert.equal ( doc.persisted, true );
            assert.equal ( doc.new, false );
            done();
          });
        }
      },

      '.set': {
        'this': function(done) {
          Post.set(0, {}, function() {
            assert.equal ( this, Post );
            done();
          });
        },

        '()': function() {
          assert.throws(function() {
            Post.set(function(err, result) {});
          });
        },

        // .set 1

        '(1)': function() {
          assert.throws(function() {
            Post.set(1, function(err, result) {});
          });
        },

        '(1, {})': function(done) {
          Post.set(1, {foo: 'bar 1'}, function(err, result) {
            assert.equal ( this, Post );
            assert.deepEqual ( result, [true] );
            done();
          });
        },

        '(1, {}, {})': function(done) {
          Post.set(1, {foo: 'bar 1'}, {}, function(err, result) {
            assert.deepEqual ( result, [true] );
            done();
          });
        },

        // .set *

        '([1, 2])': function() {
          assert.throws(function() {
            Post.set([1, 2], function(err) {
              assert.notTypeOf ( err, 'null' );
            });
          });
        },

        '([1, 2], {})': function() {
          assert.throws(function() {
            Post.set([1, 2], {foo: 'bar 1'}, function(err) {
              assert.notTypeOf ( err, 'null' );
            });
          });
        },

        '([1, 2], [{}])': function() {
          assert.throws(function() {
            Post.set([1, 2], [{foo: 'bar 1'}], function(err) {});
          });
        },

        '([1, 2], [{}, {}])': function(done) {
          Post.set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], function(err, result) {
            assert.deepEqual ( result, [true, true] );
            done();
          });
        },

        '([1, 2], [{}, {}], {})': function(done) {
          Post.set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], {}, function(err, result) {
            assert.deepEqual ( result, [true, true] );
            done();
          });
        }
      }, // .set


      '.get': {
        'this': function(done) {
          Post.get(0, function() {
            assert.equal ( this, Post );
            done();
          });
        },

        '()': function() {
          assert.throws(function() {
            Post.get(function(err, result) {});
          });
        },

        // .get 1

        '(1)': function(done) {
          Post.get(1, function(err, result) {
            assert.deepEqual ( result, [{foo: 'bar 1'}] );
            done();
          });
        },

        '(1, {})': function(done) {
          Post.get(1, {}, function(err, result) {
            assert.deepEqual ( result, [{foo: 'bar 1'}] );
            done();
          });
        },

        // .get *

        '([1, 2])': function(done) {
          Post.get([1, 2], function(err, result) {
            assert.deepEqual ( result, [{foo: 'bar 1'}, {foo: 'bar 2'}] );
            done();
          });
        },

        '([1, 2], {})': function(done) {
          Post.get([1, 2], {}, function(err, result) {
            assert.deepEqual ( result, [{foo: 'bar 1'}, {foo: 'bar 2'}] );
            done();
          });
        }
      }, // .get

      '.del': {
        'this': function(done) {
          Post.del(0, function() {
            assert.equal ( this, Post );
            done();
          });
        },

        '()': function() {
          assert.throws(function() {
            Post.del(function(err, result) {});
          });
        },

        // .del 1

        '(1)': function(done) {
          Post.del(1, function(err, result) {
            assert.deepEqual ( result, [true] );
            done();
          });
        },

        '(1, {})': function(done) {
          Post.del(1, {}, function(err, result) {
            assert.deepEqual ( result, [false] );
            done();
          });
        },

        // .del *

        '([1, 2])': function(done) {
          Post.del([1, 2], function(err, result) {
            assert.deepEqual ( result, [false, true] );
            done();
          });
        },

        '([1, 2], {})': function(done) {
          Post.del([1, 2], {}, function(err, result) {
            assert.deepEqual ( result, [false, false] );
            done();
          });
        }
      }, // .del

      '.exists': {
        'this': function(done) {
          Post.exists(0, function() {
            assert.equal ( this, Post );
            done();
          });
        },

        '()': function() {
          assert.throws(function() {
            Post.exists(function(err, result) {});
          });
        },

        // .exists 1

        '(1)': function(done) {
          Post.del(1, function(err, result) {
            Post.exists(1, function(err, result) {
              assert.deepEqual ( result, [false] );

              Post.set(1, {foo: 'bar 1'}, function(err, result) {
                Post.exists(1, function(err, result) {
                  assert.deepEqual ( result, [true] );
                });
              });

              done();
            });
          });
        },

        '(1, {})': function(done) {
          Post.del(1, function(err, result) {
            Post.exists(1, {}, function(err, result) {
              assert.deepEqual ( result, [false] );

              Post.set(1, {foo: 'bar 1'}, function(err, result) {
                Post.exists(1, {}, function(err, result) {
                  assert.deepEqual ( result, [true] );
                });
              });

              done();
            });
          });
        },

        // .exists *

        '([1, 2])': function(done) {
          Post.del([1, 2], function() {
            Post.exists([1, 2], function(err, result) {
              assert.deepEqual ( result, [false, false] );

              Post.set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], function() {
                Post.exists([1, 2], function(err, result) {
                  assert.deepEqual ( result, [true, true] );
                  done();
                });
              });
            });
          });
        },

        '([1, 2], {})': function(done) {
          Post.del([1, 2], function() {
            Post.exists([1, 2], {}, function(err, result) {
              assert.deepEqual ( result, [false, false] );

              Post.set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], function(err, result) {
                Post.exists([1, 2], {}, function(err, result) {
                  assert.deepEqual ( result, [true, true] );
                  done();
                });
              });
            });
          });
        }
      }, // .exists

      '.end': {
        'this': function(done) {
          Post.end(function() {
            assert.equal ( this, Post );
            done();
          });
        },

        '()': function() {
          assert.ok ( Post.end(function(err, result) {}) );
        }
      } // .end
    }, // Persistance

    'Generators': {
      '.id': {
        'Default': function() {
          assert.typeOf ( Post.id, 'function' );
          assert.typeOf ( Post.id(), 'string' );
          assert.equal ( Post.id().length, 36 );
        },

        'Custom': function() {
          Document.id = function(record) { return [record.key, 123].join('-'); };

          Post = Document('Post');

          assert.equal ( Document.id({key: 'foo'}), 'foo-123' );
          assert.equal ( Post.id({key: 'bar'}), 'bar-123' );

          Post.id = function(record) { return [record.key, 'abc'].join('-'); };

          assert.equal ( Document.id({key: 'foo'}), 'foo-123' );
          assert.equal ( Post.id({key: 'bar'}), 'bar-abc' );
        }
      }
    }, // Generators

    'Validation / Schema': {
      '.validate': {
        before: function() {
          Post = Document('Post', {
            title: {
              required: true,
              type: 'string',
              length: 7
            }
          });
        },

        'this': function(done) {
          Post.validate({}, function() {
            assert.equal ( this, Post );
            done();
          });
        },

        '(attributes) - when valid data': function(done) {
          var data = {title: "A title"};

          Post.validate(data, function(err, errors, valid) {
            assert.typeOf ( errors, 'null' );
            assert.equal ( valid, true );
            done();
          });
        },

        '(attributes) - when invalid data': function(done) {
          var data = {title: "A"};

          Post.validate(data, function(err, errors, valid) {
            assert.typeOf ( errors, 'object' );
            assert.equal ( errors.length, 1 );
            assert.equal ( valid, false );
            done();
          });
        },

        '(attributes, options) - when valid data': function(done) {
          var data = {title: "A title"};

          Post.validate(data, {}, function(err, errors, valid) {
            assert.typeOf ( errors, 'null' );
            assert.equal ( valid, true );
            done();
          });
        },

        '(attributes, options) - when invalid data': function(done) {
          var data = {title: "A"};

          Post.validate(data, {}, function(err, errors, valid) {
            assert.typeOf ( errors, 'object' );
            assert.equal ( errors.length, 1 );
            assert.equal ( valid, false );
            done();
          });
        }
      } // .validate
    }, // Validation

    'Diffing': {
      '.diff': {
        before: function() {
          Post = Document('Post');
        },

        'this': function(done) {
          Post.diff({}, {}, function() {
            assert.equal ( this, Post );
            done();
          });
        },

        '(attributes) - when identical data': function(done) {
          var data_a = {title: "A title"},
              data_b = {title: "A title"};

          Post.diff(data_a, data_b, function(err, diff, identical) {
            assert.typeOf ( diff, 'null' );
            assert.equal ( identical, true );
            done();
          });
        },

        '(attributes) - when different data': function(done) {
          var data_a = {title: "A title"},
              data_b = {title: "A title 2"};

          Post.diff(data_a, data_b, function(err, diff, identical) {
            assert.typeOf ( diff, 'object' );
            assert.equal ( identical, false );
            done();
          });
        },

        '(attributes, options) - when identical data': function(done) {
          var data_a = {title: "A title"},
              data_b = {title: "A title"};

          Post.diff(data_a, data_b, {}, function(err, diff, identical) {
            assert.typeOf ( diff, 'null' );
            assert.equal ( identical, true );
            done();
          });
        },

        '(attributes, options) - when different data': function(done) {
          var data_a = {title: "A title"},
              data_b = {title: "A title 2"};

          Post.diff(data_a, data_b, {}, function(err, diff, identical) {
            assert.typeOf ( diff, 'object' );
            assert.equal ( identical, false );
            done();
          });
        }
      } // .diff
    }, // Diffing

    'Events': {
      'emit': function() {
        assert.property ( Post, 'emit');
        assert.typeOf ( Post.emit, 'function');

        Post.emit('event', 1, 2, 3);
      },

      'on': function() {
        assert.property ( Post, 'on');
        assert.typeOf ( Post.on, 'function');

        var callback = function(a, b, c) {
          assert.deepEqual ( [a, b, c], [1, 2, 3] );
        };

        Post.on('event', callback);

        Post.emit('event', 1, 2, 3);
      },

      'off': function() {
        assert.property ( Post, 'off');
        assert.typeOf ( Post.off, 'function');

        var callback = function(a, b, c) {
          assert.deepEqual ( [a, b, c], [1, 2, 3] );
        };

        Post.on('event', callback);
        Post.off('event', callback);

        Post.emit('event', 1, 2, 3);
      }
    } // Events
  }, // Document.Model

  'Document.Model.prototype': {
    before: function() {
      Post = Document('Post');
    },

    'Instance': {
      before: function() {
        doc = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '#klass': function() {
        assert.equal ( doc.klass, Post );
      },

      '#type': function() {
        assert.equal ( doc.type, 'Post' );
      },

      '#storage': function() {
        assert.equal ( doc.storage, doc.klass.storage );
      },

      '#validator': function() {
        assert.equal ( doc.validator, doc.klass.validator );
      },

      '#differ': function() {
        assert.equal ( doc.differ, doc.klass.differ );
      }
    },

    'Attributes': {
      before: function() {
        doc = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '#attributes': function() {
        assert.typeOf ( doc.attributes, 'object');
      },

      '#id': function() {
        assert.equal ( doc.id, undefined );

        doc.attributes._id = 123;
        assert.equal ( doc.id, 123 );

        doc.attributes._id = "123-abc";
        assert.equal ( doc.id, "123-abc" );

        doc.attributes._id = null;
        assert.equal ( doc.id, null );
      },

      '#get': {
        '()': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.get, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.get(), {title: "A title", description: "Lorem ipsum..."} );
        }
      },

      '#set': {
        '(object)': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.set, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.set({title: "A modified title", published: true}), {title: "A modified title", published: true} );
          assert.deepEqual ( doc.attributes, {title: "A modified title", published: true} );

          // TODO: Merging?
          // assert.deepEqual ( doc.set({title: "A modified title", published: true}), {title: "A modified title", description: "Lorem ipsum...", published: true} );
          // assert.deepEqual ( doc.attributes, {title: "A modified title", description: "Lorem ipsum...", published: true} );
        }
      },

      '#attr': {
        '()': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.attr, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.attr(), {title: "A title", description: "Lorem ipsum..."} );
        },

        '(object)': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.attr, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.set({title: "A modified title", published: true}), {title: "A modified title", published: true} );
          assert.deepEqual ( doc.attributes, {title: "A modified title", published: true} );

          // TODO: Merging?
          // assert.deepEqual ( doc.set({title: "A modified title", published: true}), {title: "A modified title", description: "Lorem ipsum...", published: true} );
          // assert.deepEqual ( doc.attributes, {title: "A modified title", description: "Lorem ipsum...", published: true} );
        }
      },

      '#reset': {
        '()': function() {
          doc = new Post();

          assert.deepEqual ( doc.persisted_attributes, undefined );

          doc.persisted_attributes = {title: "A title", description: "Lorem ipsum..."};

          assert.deepEqual ( doc.attributes, {} );
          assert.deepEqual ( doc.changes, null );
          assert.deepEqual ( doc.errors, null );

          doc.reset();

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.changes, null );
          assert.deepEqual ( doc.errors, null );
        }
      },

      '#clear': {
        '()': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          doc.clear();

          assert.deepEqual ( doc.attributes, {} );
          assert.deepEqual ( doc.changes, null );
          assert.deepEqual ( doc.errors, null );
        },

        '("attributes")': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          doc.clear('attributes');

          assert.deepEqual ( doc.attributes, {} );
          assert.deepEqual ( doc.changes, null );
          assert.deepEqual ( doc.errors, null );
        },

        '("changes")': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          doc.clear('changes');

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.changes, null );
          assert.deepEqual ( doc.errors, null );
        },

        '("errors")': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          doc.clear('errors');

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.changes, null );
          assert.deepEqual ( doc.errors, null );
        }
      }
    }, // Attributes

    'Changes': {
      before: function() {
        Post = Document('Post');
        doc = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '.Differ': {
        '': function() {
          assert.property ( Document, 'Differ' );
          assert.equal ( Document.Differ, Document.DefaultDiffer );
        }
      },

      '.differ': {
        '': function() {
          assert.property ( Post, 'differ' );
          assert.instanceOf ( Post.differ, Document.Differ );
        }
      },

      '#changes': {
        '': function() {
          assert.property ( doc, 'changes' );
          assert.typeOf ( doc.changes, 'null');
        },

        '() - when original data': function(done) {
          doc.persisted_attributes = {a: "foo", b: "bar"};
          doc.attributes = {a: "foo", b: "bar"};

          doc.diff(function(err, diff, identical) {
            assert.equal ( this, doc );
            assert.typeOf ( diff, 'null' );
            assert.equal ( identical, true );
            done();
          });
        },

        '() - when changed data': function(done) {
          doc.persisted_attributes = {a: "foo", b: "bar"};
          doc.attributes = {a: "foo", b: "bar", c: "baz"};

          doc.diff(function(err, diff, identical) {
            assert.equal ( this, doc );
            assert.typeOf ( diff, 'object' );
            assert.equal ( identical, false );
            done();
          });
        }
      }
    },

    'Serialization': {
      before: function() {
        doc = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '#toJSON': {
        '=> JSON object (#attributes)': function() {
          assert.typeOf ( doc.toJSON, 'function' );
          assert.deepEqual ( doc.toJSON(), {title: "A title", description: "Lorem ipsum..."});
        }
      },

      '#toString': {
        '=> JSON string (#attributes)': function() {
          assert.typeOf ( doc.toString, 'function' );
          assert.deepEqual ( doc.toString(), JSON.stringify({title: "A title", description: "Lorem ipsum..."}) );
        }
      },

      '#valueOf': {
        '=> JSON string (#attributes)': function() {
          assert.typeOf ( doc.valueOf, 'function' );
          assert.deepEqual ( doc.valueOf(), doc );
        }
      },

      '#inspect': {
        '=> JSON object (#)': function() {
          assert.typeOf ( doc.inspect, 'function' );
          assert.deepEqual ( doc.inspect(), require('util').inspect({title: "A title", description: "Lorem ipsum..."}) );
        }
      }
    }, // Serialization

    'Validation': {
      before: function() {
        Post = Document('Post', {
          title: {
            required: true,
            type: 'string',
            length: 7
          }
        });

        doc = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '.Validator': {
        '': function() {
          assert.property ( Document, 'Validator' );
          assert.equal ( Document.Validator, Document.DefaultValidator );
        }
      },

      '.validator': {
        '': function() {
          assert.property ( Post, 'validator' );
          assert.instanceOf ( Post.validator, Document.Validator );
        }
      },

      '#errors': {
        '': function() {
          assert.property ( doc, 'errors' );
          assert.typeOf ( doc.errors, 'null');
        },

        '() - when valid data': function(done) {
          doc.attributes.title = "A title";

          doc.validate(function(err, errors) {
            assert.typeOf ( errors, 'null' );
            assert.equal ( errors, null );
            done();
          });
        },

        '() - when invalid data': function(done) {
          doc.attributes.title = "A";

          doc.validate(function(err, errors) {
            assert.typeOf ( errors, 'object' );
            assert.equal ( errors.length, 1 );
            done();
          });
        }
      },

      '#validate': {
        '': function() {
          assert.property ( doc, 'validate' );
          assert.typeOf ( doc.validate, 'function' );
        },

        '() - when valid data': function(done) {
          doc.attributes.title = "A title";

          doc.validate(function(err, errors, valid) {
            assert.equal ( this, doc );
            assert.typeOf ( errors, 'null' );
            assert.equal ( valid, true );
            done();
          });
        },

        '() - when invalid data': function(done) {
          doc.attributes.title = "A";

          doc.validate(function(err, errors, valid) {
            assert.equal ( this, doc );
            assert.typeOf ( errors, 'object' );
            assert.equal ( errors.length, 1 );
            assert.equal ( valid, false );
            done();
          });
        }
      },

      '#valid': {
        '': function() {
          assert.property ( doc, 'valid' );
          assert.typeOf ( doc.valid, 'boolean' );
        },

        '() - when valid data': function(done) {
          doc.attributes.title = "A title";

          // TODO: Make sync version - async makes no sense for basic JSON validation.

          doc.validate(function() {
            assert.equal ( doc.valid, true );
            done();
          });
        },

        '() - when invalid data': function(done) {
          doc.attributes.title = "A";

          // TODO: Make sync version - async makes no sense for basic JSON validation.

          doc.validate(function() {
            assert.equal ( doc.valid, false );
            done();
          });
        }
      },

      '#invalid': {
        '': function() {
          assert.property ( doc, 'invalid' );
          assert.typeOf ( doc.invalid, 'boolean' );
        },

        '() - when valid data': function(done) {
          doc.attributes.title = "A title";

          // TODO: Make sync version - async makes no sense for basic JSON validation.

          doc.validate(function() {
            assert.equal ( doc.invalid, false );
            done();
          });
        },

        '() - when invalid data': function(done) {
          doc.attributes.title = "A";

          // TODO: Make sync version - async makes no sense for basic JSON validation.

          doc.validate(function() {
            assert.equal ( doc.invalid, true );
            done();
          });
        }
      }
    }, // Validation

    'Creation': {
      '#clone': {
        '()': function() {
          doc = new Post({_id: 1, title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.errors, null );

          assert.deepEqual ( doc.attributes, {_id: 1, title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.changes, null );
          assert.deepEqual ( doc.errors, null );

          var cloned_doc = doc.clone();

          assert.typeOf ( cloned_doc.id, 'undefined' );
          assert.deepEqual ( cloned_doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( cloned_doc.changes, null );
          assert.deepEqual ( cloned_doc.errors, null );

          var cloned_doc_2 = cloned_doc.clone();

          assert.typeOf ( cloned_doc_2.id, 'undefined' );
          assert.deepEqual ( cloned_doc_2.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( cloned_doc_2.changes, null );
          assert.deepEqual ( cloned_doc_2.errors, null );
        }
      }
    }, // Creation

    'Persistance': {
      before: function() {
        doc = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '#destroy': {
        'this': function(done) {
          doc.destroy(function() {
            assert.equal ( this, doc );
            done();
          });
        },

        'new': {
          '()': function(done) {
            doc = new Post({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( doc.id, undefined );
            assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( doc.changes, null );
            assert.deepEqual ( doc.errors, null );
            assert.deepEqual ( doc.persisted, false );
            assert.deepEqual ( doc.new, true );

            doc.destroy(function(err, result) {
              assert.deepEqual ( err, null );
              assert.deepEqual ( result, false );

              assert.typeOf ( doc.id, 'undefined' );
              assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( doc.changes, null );
              assert.deepEqual ( doc.errors, null );
              assert.deepEqual ( doc.persisted, false );
              assert.deepEqual ( doc.new, true );
              done();
            });
          }
        },

        'persisted': {
          '()': function(done) {
            doc = new Post({_id: 5, title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( doc.id, 5 );
            assert.deepEqual ( doc.attributes, {_id: 5, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( doc.changes, null );
            assert.deepEqual ( doc.errors, null );
            assert.deepEqual ( doc.persisted, false );
            assert.deepEqual ( doc.new, true );

            Post.set(5, {title: "A title", description: "Lorem ipsum..."}, function() {
              doc.destroy(function(err, result) {
                assert.deepEqual ( err, null );
                assert.deepEqual ( result, false );

                assert.deepEqual ( doc.id, undefined );
                assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( doc.changes, null );
                assert.deepEqual ( doc.errors, null );
                assert.deepEqual ( doc.persisted, false );
                assert.deepEqual ( doc.new, true );
                done();
              });
            });
          }
        }
      }, // #destroy

      '#save': {
        'this': function(done) {
          doc.save(function() {
            assert.equal ( this, doc );
            done();
          });
        },

        'new': {
          '()': function(done) {
            var doc = new Post({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( doc.id, undefined );
            assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( doc.changes, null );
            assert.deepEqual ( doc.errors, null );
            assert.deepEqual ( doc.persisted, false );
            assert.deepEqual ( doc.new, true );

            doc.save(function(err, result) {
              assert.deepEqual ( err, null );
              assert.deepEqual ( result, true );

              assert.typeOf ( doc.id, 'string' );
              assert.deepEqual ( doc.attributes, {_id: doc.id, title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( doc.changes, null );
              assert.deepEqual ( doc.errors, null );
              assert.deepEqual ( doc.persisted, true );
              assert.deepEqual ( doc.new, false );
              done();
            });
          }
        },

        'persisted': {
          '()': function(done) {
            var doc = new Post({_id: 5, title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( doc.id, 5 );
            assert.deepEqual ( doc.attributes, {_id: 5, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( doc.changes, null );
            assert.deepEqual ( doc.errors, null );
            assert.deepEqual ( doc.persisted, false );
            assert.deepEqual ( doc.new, true );

            Post.set(5, {title: "A title", description: "Lorem ipsum..."}, function() {
              doc.save(function(err, result) {
                assert.equal ( this, doc );
                assert.deepEqual ( err, null );
                assert.deepEqual ( result, true );

                assert.typeOf ( doc.id, 'number' ); // REVIEW: ...or cast to string always?
                assert.deepEqual ( doc.attributes, {_id: doc.id, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( doc.changes, null );
                assert.deepEqual ( doc.errors, null );
                assert.deepEqual ( doc.persisted, true );
                assert.deepEqual ( doc.new, false );
                done();
              });
            });
          }
        }
      }, // #save

      '#fetch': {
        'this': function(done) {
          doc.fetch(function() {
            assert.equal ( this, doc );
            done();
          });
        },

        'ID specified - new': {
          '()': function(done) {
            doc = new Post({_id: 'fetch-1', title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( doc.id, 'fetch-1' );
            assert.deepEqual ( doc.attributes, {_id: 'fetch-1', title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( doc.changes, null );
            assert.deepEqual ( doc.errors, null );
            assert.deepEqual ( doc.persisted, false );
            assert.deepEqual ( doc.new, true );

            Post.del('fetch-1', function() {
              doc.fetch(function(err, result) {
                assert.equal ( this, doc );
                assert.deepEqual ( err, null );
                assert.deepEqual ( result, null );

                assert.deepEqual ( doc.id, 'fetch-1' );
                assert.deepEqual ( doc.attributes, {_id: 'fetch-1'} );
                assert.deepEqual ( doc.changes, null );
                assert.deepEqual ( doc.errors, null );
                assert.deepEqual ( doc.persisted, false );
                assert.deepEqual ( doc.new, true );
                done();
              });
            });
          }
        },

        'ID specified - existing': {
          '()': function(done) {
            doc = new Post({_id: 2, title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( doc.id, 2 );
            assert.deepEqual ( doc.attributes, {_id: 2, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( doc.changes, null );
            assert.deepEqual ( doc.errors, null );
            assert.deepEqual ( doc.persisted, false );
            assert.deepEqual ( doc.new, true );

            Post.set(2, {_id: 2, title: "A title", description: "Lorem ipsum..."}, function() {
              doc.fetch(function(err, result) {
                assert.equal ( this, doc );
                assert.deepEqual ( err, null );
                assert.deepEqual ( result, {_id: 2, title: "A title", description: "Lorem ipsum..."} );

                assert.deepEqual ( doc.id, 2 );
                assert.deepEqual ( doc.attributes, {_id: 2, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( doc.changes, null );
                assert.deepEqual ( doc.errors, null );
                assert.deepEqual ( doc.persisted, true );
                assert.deepEqual ( doc.new, false );
                done();
              });
            });
          }
        },

        'ID not specified': {
          '()': function(done) {
            doc = new Post({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( doc.id, undefined );
            assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( doc.changes, null );
            assert.deepEqual ( doc.errors, null );
            assert.deepEqual ( doc.persisted, false );
            assert.deepEqual ( doc.new, true );

            doc.fetch(function(err, result) {
              assert.equal ( this, doc );
              assert.deepEqual ( err, null );
              assert.deepEqual ( result, false );

              assert.typeOf ( doc.id, 'undefined' );
              assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( doc.changes, null );
              assert.deepEqual ( doc.errors, null );
              assert.deepEqual ( doc.persisted, false );
              assert.deepEqual ( doc.new, true );
              done();
            });
          }
        }
      } // #fetch
    }, // Persistance

    'Events': {
      before: function() {
        Post = Document('Post');
        doc = new Post();
      },

      'emit': function() {
        assert.property ( Post, 'emit');
        assert.typeOf ( Post.emit, 'function');

        doc.emit('event', 1, 2, 3);
      },

      'on': function() {
        assert.property ( doc, 'on');
        assert.typeOf ( doc.on, 'function');

        var callback = function(a, b, c) {
          assert.deepEqual ( [a, b, c], [1, 2, 3] );
        };

        doc.on('event', callback);

        doc.emit('event', 1, 2, 3);
      },

      'off': function() {
        assert.property ( Post, 'off');
        assert.typeOf ( Post.off, 'function');

        var callback = function(a, b, c) {
          assert.deepEqual ( [a, b, c], [1, 2, 3] );
        };

        doc.on('event', callback);
        doc.off('event', callback);

        doc.emit('event', 1, 2, 3);
      }
    } // Events

  } // Document.Model.prototype

};
