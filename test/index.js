var helper = require('./helper'),
    assert = helper.assert,
    debug = helper.debug;

var Document = require('../');
var Storage = Document.DefaultStorage;

var Post;
var Article;

var post;
var posts;

var article;

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
        post = new Post();

        assert.typeOf ( post, 'object' );
        assert.typeOf ( post.attributes, 'object' );
        assert.typeOf ( post.changes, 'null' );
        assert.typeOf ( post.errors, 'null' );

        assert.deepEqual ( post.attributes, {} );
        assert.equal ( post.id, post.attributes._id );
      },

      '(attributes)': function() {
        post = new Post({title: "A title", description: "Lorem ipsum..."});

        assert.typeOf ( post, 'object' );
        assert.typeOf ( post.attributes, 'object' );
        assert.typeOf ( post.changes, 'null' );
        assert.typeOf ( post.errors, 'null' );

        assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
        assert.equal ( post.id, post.attributes._id );
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
      Article = Document('Article');
    },

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

    'Creation': {
      '.new': {
        '()': function() {
          post = Post.new();

          assert.typeOf ( post, 'object' );
          assert.typeOf ( post.attributes, 'object' );
          assert.typeOf ( post.changes, 'null' );
          assert.typeOf ( post.errors, 'null' );

          assert.deepEqual ( post.attributes, {} );
          assert.equal ( post.id, post.attributes._id );
        },

        '(attributes)': function() {
          post = Post.new({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( post, 'object' );
          assert.typeOf ( post.attributes, 'object' );
          assert.typeOf ( post.changes, 'null' );
          assert.typeOf ( post.errors, 'null' );

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.equal ( post.id, post.attributes._id );
        },

        'Collection': {
          '()': function() {
            posts = Document([Post, Article]).new();

            assert.typeOf ( posts, 'array' );
            assert.lengthOf ( posts, 2 );

            assert.typeOf ( posts[0].attributes, 'object' );
            assert.typeOf ( posts[1].attributes, 'object' );
            assert.typeOf ( posts[0].changes, 'null' );
            assert.typeOf ( posts[1].changes, 'null' );
            assert.typeOf ( posts[0].errors, 'null' );
            assert.typeOf ( posts[1].errors, 'null' );

            assert.deepEqual ( posts[0].attributes, {} );
            assert.deepEqual ( posts[1].attributes, {} );
            assert.equal ( posts[0].id, posts[0].attributes._id );
            assert.equal ( posts[1].id, posts[1].attributes._id );
          },

          '(attributes)': function() {
            posts = Document([Post, Article]).new({title: "A title", description: "Lorem ipsum..."});

            assert.typeOf ( posts, 'array' );
            assert.lengthOf ( posts, 2 );

            assert.typeOf ( posts[0].attributes, 'object' );
            assert.typeOf ( posts[1].attributes, 'object' );
            assert.typeOf ( posts[0].changes, 'null' );
            assert.typeOf ( posts[1].changes, 'null' );
            assert.typeOf ( posts[0].errors, 'null' );
            assert.typeOf ( posts[1].errors, 'null' );

            assert.deepEqual ( posts[0].attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( posts[1].attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.equal ( posts[0].id, posts[0].attributes._id );
            assert.equal ( posts[1].id, posts[1].attributes._id );
          }
        }
      }
    }, // Creation


    'Persistance': {
      '.create': {
        'this': function(done) {
          Post.create(0, {}, function(err) {
            assert.typeOf ( err, 'null' );
            assert.equal ( this, Post );
            done();
          });
        },

        '()': function(done) {
          Post.create(function(err, post) {
            assert.typeOf ( err, 'null' );

            assert.deepEqual ( post.attributes, {_id: post.id} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.equal ( post.persisted, true );
            assert.equal ( post.unpersisted, false );
            done();
          });
        },

        '({})': function(done) {
          Post.create({title: "A title", description: "Lorem ipsum..."}, function(err, post) {
            assert.typeOf ( err, 'null' );

            assert.deepEqual ( post.attributes, {_id: post.id, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.equal ( post.persisted, true );
            assert.equal ( post.unpersisted, false );
            done();
          });
        },

        'Collection': {
          'this': function(done) {
            Document([Post, Article]).create(0, {}, function(err) {
              assert.typeOf ( err, 'array' );
              assert.equal ( err[0], null );
              assert.equal ( err[1], null );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], Post );
              assert.equal ( this[1], Article );
              done();
            });
          },

          '()': function(done) {
            Document([Post, Article]).create(function(err, post) {
              assert.typeOf ( err, 'array' );
              assert.equal ( err[0], null );
              assert.equal ( err[1], null );

              assert.typeOf ( post, 'array' );
              assert.deepEqual ( post[0].attributes, {_id: post[0].id} );
              assert.deepEqual ( post[1].attributes, {_id: post[1].id} );
              assert.deepEqual ( post[0].changes, null );
              assert.deepEqual ( post[1].changes, null );
              assert.deepEqual ( post[0].errors, null );
              assert.deepEqual ( post[1].errors, null );
              assert.equal ( post[0].persisted, true );
              assert.equal ( post[1].persisted, true );
              assert.equal ( post[0].unpersisted, false );
              assert.equal ( post[1].unpersisted, false );
              done();
            });
          },

          '({})': function(done) {
            Document([Post, Article]).create({title: "A title", description: "Lorem ipsum..."}, function(err, post) {
              assert.typeOf ( err, 'array' );
              assert.equal ( err[0], null );
              assert.equal ( err[1], null );

              assert.typeOf ( post, 'array' );
              assert.deepEqual ( post[0].attributes, {_id: post[0].id, title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post[1].attributes, {_id: post[1].id, title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post[0].changes, null );
              assert.deepEqual ( post[1].changes, null );
              assert.deepEqual ( post[0].errors, null );
              assert.deepEqual ( post[1].errors, null );
              assert.equal ( post[0].persisted, true );
              assert.equal ( post[1].persisted, true );
              assert.equal ( post[0].unpersisted, false );
              assert.equal ( post[1].unpersisted, false );
              done();
            });
          },
        }
      },

      '.set': {
        'this': function(done) {
          Post.set(0, {}, function(err) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

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
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

            assert.deepEqual ( result, [true] );
            done();
          });
        },

        '(1, {}, {})': function(done) {
          Post.set(1, {foo: 'bar 1'}, {}, function(err, result) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

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
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null, null] );

            assert.typeOf ( result, 'array' );
            assert.deepEqual ( result, [true, true] );
            done();
          });
        },

        '([1, 2], [{}, {}], {})': function(done) {
          Post.set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], {}, function(err, result) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null, null] );

            assert.typeOf ( result, 'array' );
            assert.deepEqual ( result, [true, true] );
            done();
          });
        },

        'Collection': {
          'this': function(done) {
            Document([Post, Article]).set(0, {}, function(err) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err[0], [null] );
              assert.deepEqual ( err[1], [null] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], Post );
              assert.equal ( this[1], Article );
              done();
            });
          },

          '()': function() {
            assert.throws(function() {
              Document([Post, Article]).set(function(err, result) {});
            });
          },

          // .set 1

          '(1)': function() {
            assert.throws(function() {
              Document([Post, Article]).set(1, function(err, result) {});
            });
          },

          '(1, {})': function(done) {
            Document([Post, Article]).set(1, {foo: 'bar 1'}, function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null], [null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[true], [true]] );
              done();
            });
          },

          '(1, {}, {})': function(done) {
            Document([Post, Article]).set(1, {foo: 'bar 1'}, {}, function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null], [null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[true], [true]] );
              done();
            });
          },

          // .set *

          '([1, 2])': function() {
            assert.throws(function() {
              Document([Post, Article]).set([1, 2], function(err) {
                assert.typeOf ( err, 'array' );
                assert.notTypeOf ( err[0], 'null' );
              });
            });
          },

          '([1, 2], {})': function() {
            assert.throws(function() {
              Document([Post, Article]).set([1, 2], {foo: 'bar 1'}, function(err) {
                assert.typeOf ( err, 'array' );
                assert.notTypeOf ( err[0], 'null' );
              });
            });
          },

          '([1, 2], [{}])': function() {
            assert.throws(function() {
              Document([Post, Article]).set([1, 2], [{foo: 'bar 1'}], function(err) {});
            });
          },

          '([1, 2], [{}, {}])': function(done) {
            Document([Post, Article]).set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null, null], [null, null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[true, true], [true, true]] );
              done();
            });
          },

          '([1, 2], [{}, {}], {})': function(done) {
            Document([Post, Article]).set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], {}, function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null, null], [null, null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[true, true], [true, true]] );
              done();
            });
          }
        }
      }, // .set


      '.get': {
        'this': function(done) {
          Post.get(0, function(err) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

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
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

            assert.deepEqual ( result, [{foo: 'bar 1'}] );
            done();
          });
        },

        '(1, {})': function(done) {
          Post.get(1, {}, function(err, result) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

            assert.deepEqual ( result, [{foo: 'bar 1'}] );
            done();
          });
        },

        // .get *

        '([1, 2])': function(done) {
          Post.get([1, 2], function(err, result) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null, null] );

            assert.deepEqual ( result, [{foo: 'bar 1'}, {foo: 'bar 2'}] );
            done();
          });
        },

        '([1, 2], {})': function(done) {
          Post.get([1, 2], {}, function(err, result) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null, null] );

            assert.deepEqual ( result, [{foo: 'bar 1'}, {foo: 'bar 2'}] );
            done();
          });
        },

        'Collection': {
          'this': function(done) {
            Document([Post, Article]).get(0, function(err) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null], [null]] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], Post );
              assert.equal ( this[1], Article );
              done();
            });
          },

          '()': function() {
            assert.throws(function() {
              Document([Post, Article]).get(function(err, result) {});
            });
          },

          // // .get 1

          '(1)': function(done) {
            Document([Post, Article]).get(1, function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null], [null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[{foo: 'bar 1'}], [{foo: 'bar 1'}]] );
              done();
            });
          },

          '(1, {})': function(done) {
            Document([Post, Article]).get(1, {}, function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null], [null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[{foo: 'bar 1'}], [{foo: 'bar 1'}]] );
              done();
            });
          },

          // // .get *

          '([1, 2])': function(done) {
            Document([Post, Article]).get([1, 2], function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null, null], [null, null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[{foo: 'bar 1'}, {foo: 'bar 2'}], [{foo: 'bar 1'}, {foo: 'bar 2'}]] );
              done();
            });
          },

          '([1, 2], {})': function(done) {
            Document([Post, Article]).get([1, 2], {}, function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null, null], [null, null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[{foo: 'bar 1'}, {foo: 'bar 2'}], [{foo: 'bar 1'}, {foo: 'bar 2'}]] );
              done();
            });
          }
        }
      }, // .get

      '.del': {
        'this': function(done) {
          Post.del(0, function(err) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

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
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

            assert.deepEqual ( result, [true] );
            done();
          });
        },

        '(1, {})': function(done) {
          Post.del(1, {}, function(err, result) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

            assert.deepEqual ( result, [false] );
            done();
          });
        },

        // .del *

        '([1, 2])': function(done) {
          Post.del([1, 2], function(err, result) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null, null] );

            assert.deepEqual ( result, [false, true] );
            done();
          });
        },

        '([1, 2], {})': function(done) {
          Post.del([1, 2], {}, function(err, result) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null, null] );

            assert.deepEqual ( result, [false, false] );
            done();
          });
        },

        'Collection': {
          'this': function(done) {
            Document([Post, Article]).del(0, function(err) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null], [null]] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], Post );
              assert.equal ( this[1], Article );
              done();
            });
          },

          '()': function() {
            assert.throws(function() {
              Document([Post, Article]).del(function(err, result) {});
            });
          },

          // .del 1

          '(1)': function(done) {
            Document([Post, Article]).del(1, function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null], [null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[false], [true]] );
              done();
            });
          },

          '(1, {})': function(done) {
            Document([Post, Article]).del(1, {}, function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null], [null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[false], [false]] );
              done();
            });
          },

          // // .del *

          '([1, 2])': function(done) {
            Document([Post, Article]).del([1, 2], function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null, null], [null, null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[false, false], [false, true]] );
              done();
            });
          },

          '([1, 2], {})': function(done) {
            Document([Post, Article]).del([1, 2], {}, function(err, result) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null, null], [null, null]] );

              assert.typeOf ( result, 'array' );
              assert.deepEqual ( result, [[false, false], [false, false]] );
              done();
            });
          }
        }
      }, // .del

      '.exists': {
        'this': function(done) {
          Post.exists(0, function(err) {
            assert.typeOf ( err, 'array' );
            assert.deepEqual ( err, [null] );

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
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null] );

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
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null] );

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
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

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
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.deepEqual ( result, [false, false] );

              Post.set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], function(err, result) {
                Post.exists([1, 2], {}, function(err, result) {
                  assert.deepEqual ( result, [true, true] );
                  done();
                });
              });
            });
          });
        },

        'Collection': {
          'this': function(done) {
            Document([Post, Article]).exists(0, function(err) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [[null], [null]] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], Post );
              assert.equal ( this[1], Article );
              done();
            });
          },

          '()': function() {
            assert.throws(function() {
              Document([Post, Article]).exists(function(err, result) {});
            });
          },

          // .exists 1

          '(1)': function(done) {
            Document([Post, Article]).del(1, function(err, result) {
              Document([Post, Article]).exists(1, function(err, result) {
                assert.typeOf ( err, 'array' );
                assert.deepEqual ( err, [[null], [null]] );

                assert.deepEqual ( result, [[false], [false]] );

                Document([Post, Article]).set(1, {foo: 'bar 1'}, function(err, result) {
                  Document([Post, Article]).exists(1, function(err, result) {
                    assert.deepEqual ( result, [[true], [true]] );
                  });
                });

                done();
              });
            });
          },

          '(1, {})': function(done) {
            Document([Post, Article]).del(1, function(err, result) {
              Document([Post, Article]).exists(1, {}, function(err, result) {
                assert.typeOf ( err, 'array' );
                assert.deepEqual ( err, [[null], [null]] );

                assert.deepEqual ( result, [[false], [false]] );

                Document([Post, Article]).set(1, {foo: 'bar 1'}, function(err, result) {
                  Document([Post, Article]).exists(1, {}, function(err, result) {
                    assert.deepEqual ( result, [[true], [true]] );
                  });
                });

                done();
              });
            });
          },

          // // .exists *

          '([1, 2])': function(done) {
            Document([Post, Article]).del([1, 2], function() {
              Document([Post, Article]).exists([1, 2], function(err, result) {
                assert.typeOf ( err, 'array' );
                assert.deepEqual ( err, [[null, null], [null, null]] );

                assert.deepEqual ( result, [[false, false], [false, false]] );

                Document([Post, Article]).set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], function() {
                  Document([Post, Article]).exists([1, 2], function(err, result) {
                    assert.deepEqual ( result, [[true, true], [true, true]] );
                    done();
                  });
                });
              });
            });
          },

          '([1, 2], {})': function(done) {
            Document([Post, Article]).del([1, 2], function() {
              Document([Post, Article]).exists([1, 2], {}, function(err, result) {
                assert.typeOf ( err, 'array' );
                assert.deepEqual ( err, [[null, null], [null, null]] );

                assert.deepEqual ( result, [[false, false], [false, false]] );

                Document([Post, Article]).set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], function() {
                  Document([Post, Article]).exists([1, 2], {}, function(err, result) {
                    assert.deepEqual ( result, [[true, true], [true, true]] );
                    done();
                  });
                });
              });
            });
          }
        }
      }, // .exists

      '.end': {
        'this': function(done) {
          Post.end(function(err) {
            assert.equal ( this, Post );
            done();
          });
        },

        '()': function() {
          assert.ok ( Post.end(function(err, result) {}) );
        },

        'Collection': {
          'this': function(done) {
            Document([Post, Article]).end(function() {
              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], Post );
              assert.equal ( this[1], Article );
              done();
            });
          },

          '()': function() {
            assert.ok ( Document([Post, Article]).end(function(err, result) {}) );
          }
        }
      } // .end
    }, // Persistance

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
          Article = Document('Article', {
            title: {
              required: true,
              type: 'string',
              length: 7
            }
          });
        },

        'this': function(done) {
          Post.validate({}, function(err) {
            assert.typeOf ( err, 'null' );
            assert.equal ( this, Post );
            done();
          });
        },

        '(attributes) - when valid data': function(done) {
          var data = {title: "A title"};

          Post.validate(data, function(err, errors, valid) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( errors, 'null' );
            assert.equal ( valid, true );
            done();
          });
        },

        '(attributes) - when invalid data': function(done) {
          var data = {title: "A"};

          Post.validate(data, function(err, errors, valid) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( errors, 'object' );
            assert.equal ( errors.length, 1 );
            assert.equal ( valid, false );
            done();
          });
        },

        '(attributes, options) - when valid data': function(done) {
          var data = {title: "A title"};

          Post.validate(data, {}, function(err, errors, valid) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( errors, 'null' );
            assert.equal ( valid, true );
            done();
          });
        },

        '(attributes, options) - when invalid data': function(done) {
          var data = {title: "A"};

          Post.validate(data, {}, function(err, errors, valid) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( errors, 'object' );
            assert.equal ( errors.length, 1 );
            assert.equal ( valid, false );
            done();
          });
        },

        'Collection': {
          'this': function(done) {
            Document([Post, Article]).validate({}, function(err) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], Post );
              assert.equal ( this[1], Article );
              done();
            });
          },

          '(attributes) - when valid data': function(done) {
            var data = {title: "A title"};

            Document([Post, Article]).validate(data, function(err, errors, valid) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( errors, 'array' );
              assert.deepEqual ( errors, [null, null] );

              assert.typeOf ( valid, 'array' );
              assert.deepEqual ( valid, [true, true] );
              done();
            });
          },

          '(attributes) - when invalid data': function(done) {
            var data = {title: "A"};

            Document([Post, Article]).validate(data, function(err, errors, valid) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( errors, 'array' );
              assert.typeOf ( errors[0], 'object' );
              assert.equal ( errors[0].length, 1 );
              assert.typeOf ( errors[1], 'object' );
              assert.equal ( errors[1].length, 1 );

              assert.typeOf ( valid, 'array' );
              assert.deepEqual ( valid, [false, false] );
              done();
            });
          },

          '(attributes, options) - when valid data': function(done) {
            var data = {title: "A title"};

            Document([Post, Article]).validate(data, {}, function(err, errors, valid) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( errors, 'array' );
              assert.deepEqual ( errors, [null, null] );

              assert.typeOf ( valid, 'array' );
              assert.deepEqual ( valid, [true, true] );
              done();
            });
          },

          '(attributes, options) - when invalid data': function(done) {
            var data = {title: "A"};

            Document([Post, Article]).validate(data, {}, function(err, errors, valid) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( errors, 'array' );
              assert.typeOf ( errors[0], 'object' );
              assert.equal ( errors[0].length, 1 );
              assert.typeOf ( errors[1], 'object' );
              assert.equal ( errors[1].length, 1 );

              assert.typeOf ( valid, 'array' );
              assert.deepEqual ( valid, [false, false] );
              done();
            });
          }
        }
      } // .validate
    }, // Validation

    'Diffing': {
      '.diff': {
        'this': function(done) {
          Post.diff({}, {}, function(err) {
            assert.typeOf ( err, 'null' );
            assert.equal ( this, Post );
            done();
          });
        },

        '(attributes) - when identical data': function(done) {
          var data_a = {title: "A title"},
              data_b = {title: "A title"};

          Post.diff(data_a, data_b, function(err, diff, identical) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( diff, 'null' );
            assert.equal ( identical, true );
            done();
          });
        },

        '(attributes) - when different data': function(done) {
          var data_a = {title: "A title"},
              data_b = {title: "A title 2"};

          Post.diff(data_a, data_b, function(err, diff, identical) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( diff, 'object' );
            assert.equal ( identical, false );
            done();
          });
        },

        '(attributes, options) - when identical data': function(done) {
          var data_a = {title: "A title"},
              data_b = {title: "A title"};

          Post.diff(data_a, data_b, {}, function(err, diff, identical) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( diff, 'null' );
            assert.equal ( identical, true );
            done();
          });
        },

        '(attributes, options) - when different data': function(done) {
          var data_a = {title: "A title"},
              data_b = {title: "A title 2"};

          Post.diff(data_a, data_b, {}, function(err, diff, identical) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( diff, 'object' );
            assert.equal ( identical, false );
            done();
          });
        },

        'Collection': {
          '(attributes) - when identical data': function(done) {
            var data_a = {title: "A title"},
                data_b = {title: "A title"};

            Document([Post, Article]).diff(data_a, data_b, function(err, diff, identical) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( diff, 'array' );
              assert.deepEqual ( diff, [null, null] );

              assert.typeOf ( identical, 'array' );
              assert.deepEqual ( identical, [true, true] );
              done();
            });
          },

          '(attributes) - when different data': function(done) {
            var data_a = {title: "A title"},
                data_b = {title: "A title 2"};

            Document([Post, Article]).diff(data_a, data_b, function(err, diff, identical) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( diff, 'array' );
              assert.typeOf ( diff[0], 'object' );
              assert.typeOf ( diff[1], 'object' );

              assert.typeOf ( identical, 'array' );
              assert.deepEqual ( identical, [false, false] );
              done();
            });
          },

          '(attributes, options) - when identical data': function(done) {
            var data_a = {title: "A title"},
                data_b = {title: "A title"};

            Document([Post, Article]).diff(data_a, data_b, {}, function(err, diff, identical) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( diff, 'array' );
              assert.deepEqual ( diff, [null, null] );

              assert.typeOf ( identical, 'array' );
              assert.deepEqual ( identical, [true, true] );
              done();
            });
          },

          '(attributes, options) - when different data': function(done) {
            var data_a = {title: "A title"},
                data_b = {title: "A title 2"};

            Document([Post, Article]).diff(data_a, data_b, {}, function(err, diff, identical) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( diff, 'array' );
              assert.typeOf ( diff[0], 'object' );
              assert.typeOf ( diff[1], 'object' );

              assert.typeOf ( identical, 'array' );
              assert.deepEqual ( identical, [false, false] );
              done();
            });
          }
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
      },

      'Collection': {
        'emit': function() {
          Document([Post, Article]).emit('event', 1, 2, 3);
        },

        'on': function() {
          var callback = function(a, b, c) {
            assert.deepEqual ( [a, b, c], [1, 2, 3] );
          };

          Post.on('event', callback);
          Article.on('event', callback);

          Document([Post, Article]).emit('event', 1, 2, 3);
        },

        'off': function() {
          var callback = function(a, b, c) {
            assert.deepEqual ( [a, b, c], [1, 2, 3] );
          };

          Post.on('event', callback);
          Post.off('event', callback);
          Article.on('event', callback);
          Article.off('event', callback);

          Document([Post, Article]).emit('event', 1, 2, 3);
        }
      }
    } // Events
  }, // Document.Model

  'Document.Model.prototype': {
    before: function() {
      Post = Document('Post');
    },

    'Instance': {
      before: function() {
        post = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '#klass': function() {
        assert.equal ( post.klass, Post );
      },

      '#type': function() {
        assert.equal ( post.type, 'Post' );
      },

      '#storage': function() {
        assert.equal ( post.storage, post.klass.storage );
      },

      '#validator': function() {
        assert.equal ( post.validator, post.klass.validator );
      },

      '#differ': function() {
        assert.equal ( post.differ, post.klass.differ );
      }
    },

    'Attributes': {
      before: function() {
        post = new Post({title: "A title", description: "Lorem ipsum..."});
        article = new Article({title: "A title", description: "Lorem ipsum..."});
      },

      '#attributes': {
        '': function() {
          assert.typeOf ( post.attributes, 'object');
        },

        'Collection': {
          '': function() {
            assert.typeOf ( Document([post, article]).attributes, 'array' );
            assert.deepEqual ( Document([post, article]).attributes, [post.attributes, article.attributes] );
          }
        }
      },

      '#type': {
        '': function() {
          assert.equal ( post.type, 'Post' );
        },

        'Collection': {
          '': function() {
            assert.typeOf ( Document([post, article]).type, 'array' );
            assert.deepEqual ( Document([post, article]).type, [post.type, article.type] );
          }
        }
      },

      '#id': {
        '': function() {
          assert.equal ( post.id, undefined );

          post.attributes._id = 123;
          assert.equal ( post.id, 123 );

          post.attributes._id = "123-abc";
          assert.equal ( post.id, "123-abc" );

          post.attributes._id = null;
          assert.equal ( post.id, null );

          post.id = 123;
          assert.equal ( post.id, 123 );

          post.id = "123-abc";
          assert.equal ( post.id, "123-abc" );

          post.id = null;
          assert.equal ( post.id, null );
        },

        'Collection': {
          '': function() {
            assert.typeOf ( Document([post, article]).id, 'array' );
            assert.deepEqual ( Document([post, article]).id, [post.id, article.id] );
          }
        }
      },

      '#get': {
        '()': function() {
          assert.typeOf ( post.get, 'function' );

          post = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( post.get(), {title: "A title", description: "Lorem ipsum..."} );
        },

        'Collection': {
          '()': function() {
            assert.typeOf ( Document([post, article]).get, 'function' );

            post = new Post({title: "A title", description: "Lorem ipsum..."});
            article = new Article({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );
            assert.deepEqual ( Document([post, article]).get(), [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );
          }
        }
      },

      '#set': {
        '(object)': function() {
          assert.typeOf ( post.set, 'function' );

          post = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( post.set({title: "A modified title", published: true}), {title: "A modified title", published: true} );
          assert.deepEqual ( post.attributes, {title: "A modified title", published: true} );

          // TODO: Merging?
          // assert.deepEqual ( post.set({title: "A modified title", published: true}), {title: "A modified title", description: "Lorem ipsum...", published: true} );
          // assert.deepEqual ( post.attributes, {title: "A modified title", description: "Lorem ipsum...", published: true} );
        },

        'Collection': {
          '(object)': function() {
            assert.typeOf ( Document([post, article]).set, 'function' );

            post = new Post({title: "A title", description: "Lorem ipsum..."});
            article = new Article({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );
            assert.deepEqual ( Document([post, article]).set({title: "A modified title", published: true}), [{title: "A modified title", published: true}, {title: "A modified title", published: true}] );
          }
        }
      },

      '#attr': {
        '()': function() {
          assert.typeOf ( post.attr, 'function' );

          post = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( post.attr(), {title: "A title", description: "Lorem ipsum..."} );
        },

        '(object)': function() {
          assert.typeOf ( post.attr, 'function' );

          post = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( post.attr({title: "A modified title", published: true}), {title: "A modified title", published: true} );
          assert.deepEqual ( post.attributes, {title: "A modified title", published: true} );

          // TODO: Merging?
          // assert.deepEqual ( post.attr({title: "A modified title", published: true}), {title: "A modified title", description: "Lorem ipsum...", published: true} );
          // assert.deepEqual ( post.attributes, {title: "A modified title", description: "Lorem ipsum...", published: true} );
        },

        'Collection': {
          '()': function() {
            assert.typeOf ( Document([post, article]).attr, 'function' );

            post = new Post({title: "A title", description: "Lorem ipsum..."});
            article = new Article({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );
            assert.deepEqual ( Document([post, article]).attr(), [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );
          },

          '(object)': function() {
            assert.typeOf ( Document([post, article]).attr, 'function' );

            post = new Post({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );

            assert.deepEqual ( Document([post, article]).attr({title: "A modified title", published: true}), [{title: "A modified title", published: true}, {title: "A modified title", published: true}] );
            assert.deepEqual ( Document([post, article]).attributes, [{title: "A modified title", published: true}, {title: "A modified title", published: true}] );

            // TODO: Merging?
            // assert.deepEqual ( post.attr({title: "A modified title", published: true}), {title: "A modified title", description: "Lorem ipsum...", published: true} );
            // assert.deepEqual ( post.attributes, {title: "A modified title", description: "Lorem ipsum...", published: true} );
          },
        }
      },

      '#reset': {
        '()': function() {
          post = new Post();

          assert.deepEqual ( post.persisted_attributes, undefined );

          post.persisted_attributes = {title: "A title", description: "Lorem ipsum..."};

          assert.deepEqual ( post.attributes, {} );
          assert.deepEqual ( post.changes, null );
          assert.deepEqual ( post.errors, null );

          post.reset();

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( post.changes, null );
          assert.deepEqual ( post.errors, null );
        },

        'Collection': {
          '()': function() {
            post = new Post();
            article = new Article();

            assert.deepEqual ( Document([post, article]).persisted_attributes, [undefined, undefined] );

            Document([post, article]).persisted_attributes = {title: "A title", description: "Lorem ipsum..."};

            assert.deepEqual ( Document([post, article]).attributes, [{}, {}] );
            assert.deepEqual ( Document([post, article]).changes, [null, null] );
            assert.deepEqual ( Document([post, article]).errors, [null, null] );

            Document([post, article]).reset();

            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );
            assert.deepEqual ( Document([post, article]).changes, [null, null] );
            assert.deepEqual ( Document([post, article]).errors, [null, null] );
          },
        }
      },

      '#clear': {
        '()': function() {
          post = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );

          post.clear();

          assert.deepEqual ( post.attributes, {} );
          assert.deepEqual ( post.changes, null );
          assert.deepEqual ( post.errors, null );
        },

        '("attributes")': function() {
          post = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );

          post.clear('attributes');

          assert.deepEqual ( post.attributes, {} );
          assert.deepEqual ( post.changes, null );
          assert.deepEqual ( post.errors, null );
        },

        '("changes")': function() {
          post = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );

          post.clear('changes');

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( post.changes, null );
          assert.deepEqual ( post.errors, null );
        },

        '("errors")': function() {
          post = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );

          post.clear('errors');

          assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( post.changes, null );
          assert.deepEqual ( post.errors, null );
        },

        'Collection': {
          beforeEach: function() {
            post = new Post({title: "A title", description: "Lorem ipsum..."});
            article = new Article({title: "A title", description: "Lorem ipsum..."});
          },

          '()': function() {
            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );

            Document([post, article]).clear();

            assert.deepEqual ( Document([post, article]).attributes, [{}, {}] );
            assert.deepEqual ( Document([post, article]).changes, [null, null] );
            assert.deepEqual ( Document([post, article]).errors, [null, null] );
          },

          '("attributes")': function() {
            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );

            Document([post, article]).clear('attributes');

            assert.deepEqual ( Document([post, article]).attributes, [{}, {}] );
            assert.deepEqual ( Document([post, article]).changes, [null, null] );
            assert.deepEqual ( Document([post, article]).errors, [null, null] );
          },

          '("changes")': function() {
            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );

            Document([post, article]).clear('changes');

            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );
            assert.deepEqual ( Document([post, article]).changes, [null, null] );
            assert.deepEqual ( Document([post, article]).errors, [null, null] );
          },

          '("errors")': function() {
            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );

            Document([post, article]).clear('errors');

            assert.deepEqual ( Document([post, article]).attributes, [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}] );
            assert.deepEqual ( Document([post, article]).changes, [null, null] );
            assert.deepEqual ( Document([post, article]).errors, [null, null] );
          }
        }
      }
    }, // Attributes

    'Serialization': {
      before: function() {
        post = new Post({title: "A title", description: "Lorem ipsum..."});
        article = new Article({title: "A title", description: "Lorem ipsum..."});
      },

      '#toJSON': {
        '=> JSON object (#attributes)': function() {
          assert.typeOf ( post.toJSON, 'function' );
          assert.deepEqual ( post.toJSON(), {title: "A title", description: "Lorem ipsum..."});
        },

        'Collection': {
          '=> JSON object (#attributes)': function() {
            assert.typeOf ( Document([post, article]).toJSON, 'function' );
            assert.deepEqual (  Document([post, article]).toJSON(), [{title: "A title", description: "Lorem ipsum..."}, {title: "A title", description: "Lorem ipsum..."}]);
          }
        }
      },

      '#toString': {
        '=> JSON string (#attributes)': function() {
          assert.typeOf ( post.toString, 'function' );
          assert.deepEqual ( post.toString(), JSON.stringify({title: "A title", description: "Lorem ipsum..."}) );
        },

        'Collection': {
          '=> JSON string (#attributes)': function() {
            assert.typeOf ( Document([post, article]).toString, 'function' );
            assert.deepEqual ( Document([post, article]).toString(), [JSON.stringify({title: "A title", description: "Lorem ipsum..."}), JSON.stringify({title: "A title", description: "Lorem ipsum..."})] );
          }
        }
      },

      '#valueOf': {
        '=> JSON string (#attributes)': function() {
          assert.typeOf ( post.valueOf, 'function' );
          assert.deepEqual ( post.valueOf(), post );
        },

        'Collection': {
          '=> JSON string (#attributes)': function() {
            assert.typeOf ( Document([post, article]).valueOf, 'function' );
            assert.deepEqual ( Document([post, article]).valueOf(), [post, article] );
          }
        }
      },

      '#inspect': {
        '=> JSON object (#)': function() {
          assert.typeOf ( post.inspect, 'function' );
          assert.deepEqual ( post.inspect(), require('util').inspect({title: "A title", description: "Lorem ipsum..."}) );
        },

        'Collection': {
          '=> JSON object (#)': function() {
            assert.typeOf ( Document([post, article]).inspect, 'function' );
            assert.deepEqual ( Document([post, article]).inspect(), require('util').inspect([post, article]) );
          }
        }
      }
    }, // Serialization

    'Changes': {
      beforeEach: function() {
        post = new Post({title: "A title", description: "Lorem ipsum..."});
        article = new Article({title: "A title", description: "Lorem ipsum..."});
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
        },

        'Collection': {
          '': function() {
            assert.property ( Document([Post, Article]), 'differ' );
            assert.instanceOf ( Document([Post, Article]).differ[0], Document.Differ );
            assert.instanceOf ( Document([Post, Article]).differ[1], Document.Differ );
          }
        }
      },

      '#changes': {
        '': function() {
          assert.property ( post, 'changes' );
          assert.typeOf ( post.changes, 'null');
        },

        '() - when original data': function(done) {
          post.persisted_attributes = {a: "foo", b: "bar"};
          post.attributes = {a: "foo", b: "bar"};

          post.diff(function(err, diff, identical) {
            assert.typeOf ( err, 'null' );

            assert.equal ( this, post );
            assert.typeOf ( diff, 'null' );
            assert.equal ( identical, true );
            done();
          });
        },

        '() - when changed data': function(done) {
          post.persisted_attributes = {a: "foo", b: "bar"};
          post.attributes = {a: "foo", b: "bar", c: "baz"};

          post.diff(function(err, diff, identical) {
            assert.typeOf ( err, 'null' );

            assert.equal ( this, post );
            assert.typeOf ( diff, 'object' );
            assert.equal ( identical, false );
            done();
          });
        },

        'Collection': {
          '': function() {
            assert.property ( Document([post, article]), 'changes' );
            assert.typeOf ( Document([post, article]).changes[0], 'null');
            assert.typeOf ( Document([post, article]).changes[1], 'null');
          },

          '() - when original data': function(done) {
            Document([post, article]).persisted_attributes = {a: "foo", b: "bar"};
            Document([post, article]).attributes = {a: "foo", b: "bar"};

            Document([post, article]).diff(function(err, diff, identical) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], post );
              assert.equal ( this[1], article );

              assert.typeOf ( diff, 'array' );
              assert.typeOf ( diff[0], 'null' );
              assert.typeOf ( diff[1], 'null' );

              assert.typeOf ( identical, 'array' );
              assert.deepEqual ( identical, [true, true] );
              done();
            });
          },

          '() - when changed data': function(done) {
            Document([post, article]).persisted_attributes = {a: "foo", b: "bar"};
            Document([post, article]).attributes = {a: "foo", b: "bar", c: "baz"};

            Document([post, article]).diff(function(err, diff, identical) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], post );
              assert.equal ( this[1], article );

              assert.typeOf ( diff, 'array' );
              assert.typeOf ( diff[0], 'object' );
              assert.typeOf ( diff[1], 'object' );

              assert.typeOf ( identical, 'array' );
              assert.deepEqual ( identical, [false, false] );
              done();
            });
          }
        }
      }
    },

    'Validation': {
      before: function() {
        Post = Document('Post', {
          title: {
            required: true,
            type: 'string',
            length: 7
          }
        });
        Article = Document('Article', {
          title: {
            required: true,
            type: 'string',
            length: 7
          }
        });
      },

      beforeEach: function() {
        post = new Post({title: "A title", description: "Lorem ipsum..."});
        article = new Article({title: "A title", description: "Lorem ipsum..."});
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
        },

        'Collection': {
          '': function() {
            assert.property ( Document([Post, Article]), 'validator' );
            assert.instanceOf ( Document([Post, Article]).validator[0], Document.Validator );
            assert.instanceOf ( Document([Post, Article]).validator[1], Document.Validator );
          }
        }
      },

      '#validate': {
        '': function() {
          assert.property ( post, 'validate' );
          assert.typeOf ( post.validate, 'function' );
        },

        'this': function(done) {
          post.validate(function(err, errors, valid) {
            assert.typeOf ( err, 'null' );
            assert.equal ( this, post );
            done();
          });
        },

        '() - when valid data': function(done) {
          post.attributes.title = "A title";

          post.validate(function(err, errors, valid) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( errors, 'null' );
            assert.equal ( valid, true );
            done();
          });
        },

        '() - when invalid data': function(done) {
          post.attributes.title = "A";

          post.validate(function(err, errors, valid) {
            assert.typeOf ( err, 'null' );
            assert.typeOf ( errors, 'object' );
            assert.equal ( valid, false );
            done();
          });
        },

        'Collection': {
          '': function() {
            assert.property ( Document([post, article]), 'validate' );
            assert.typeOf ( Document([post, article]).validate, 'function' );
          },

          'this': function(done) {
            Document([post, article]).validate(function(err, errors, valid) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( this, 'array' );
              assert.deepEqual ( this[0], post );
              assert.deepEqual ( this[1], article );
              done();
            });
          },

          '() - when valid data': function(done) {
            post.attributes.title = 'A title';
            article.attributes.title = 'A title';

            Document([post, article]).validate(function(err, errors, valid) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( errors, 'array' );
              assert.typeOf ( errors[0], 'null' );
              assert.typeOf ( errors[1], 'null' );

              assert.typeOf ( valid, 'array' );
              assert.equal ( valid[0], true );
              assert.equal ( valid[1], true );
              done();
            });
          },

          '() - when invalid data': function(done) {
            post.attributes.title = 'A';
            article.attributes.title = 'A';

            Document([post, article]).validate(function(err, errors, valid) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( errors, 'array' );
              assert.typeOf ( errors[0], 'object' );
              assert.typeOf ( errors[1], 'object' );

              assert.typeOf ( valid, 'array' );
              assert.equal ( valid[0], false );
              assert.equal ( valid[1], false );
              done();
            });
          }
        }
      },

      '#errors': {
        '': function() {
          assert.property ( post, 'errors' );
          assert.typeOf ( post.errors, 'null');
        },

        '() - when valid data': function(done) {
          post.attributes.title = "A title";

          post.validate(function(err, errors) {
            assert.typeOf ( err, 'null' );

            assert.typeOf ( errors, 'null' );
            assert.equal ( errors, null );
            done();
          });
        },

        '() - when invalid data': function(done) {
          post.attributes.title = "A";

          post.validate(function(err, errors) {
            assert.typeOf ( err, 'null' );

            assert.typeOf ( errors, 'object' );
            assert.equal ( errors.length, 1 );
            done();
          });
        },

        'Collection': {
          '': function() {
            assert.property ( Document([post, article]), 'errors' );
            assert.typeOf ( Document([post, article]).errors[0], 'null');
            assert.typeOf ( Document([post, article]).errors[1], 'null');
          },

          '() - when valid data': function(done) {
            post.attributes.title = 'A title';
            article.attributes.title = 'A title';

            Document([post, article]).validate(function(err, errors) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( errors, 'array' );
              assert.typeOf ( errors[0], 'null' );
              assert.typeOf ( errors[1], 'null' );
              done();
            });
          },

          '() - when invalid data': function(done) {
            post.attributes.title = 'A';
            article.attributes.title = 'A';

            Document([post, article]).validate(function(err, errors) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( errors, 'array' );
              assert.typeOf ( errors[0], 'object' );
              assert.typeOf ( errors[1], 'object' );
              done();
            });
          }
        }
      },

      '#valid': {
        '': function() {
          assert.property ( post, 'valid' );
          assert.typeOf ( post.valid, 'boolean' );
        },

        '() - when valid data': function(done) {
          post.attributes.title = "A title";

          // REVIEW: Make sync version - async makes no sense for basic JSON validation.

          post.validate(function() {
            assert.equal ( post.valid, true );
            done();
          });
        },

        '() - when invalid data': function(done) {
          post.attributes.title = "A";

          // REVIEW: Make sync version - async makes no sense for basic JSON validation.

          post.validate(function() {
            assert.equal ( post.valid, false );
            done();
          });
        },

        'Collection': {
          '': function() {
            assert.property ( Document([post, article]), 'valid' );
            assert.typeOf ( Document([post, article]).valid[0], 'boolean' );
            assert.typeOf ( Document([post, article]).valid[1], 'boolean' );
          },

          '() - when valid data': function(done) {
            post.attributes.title = 'A title';
            article.attributes.title = 'A title';

            // REVIEW: Make sync version - async makes no sense for basic JSON validation.

            Document([post, article]).validate(function() {
              assert.equal ( post.valid, true );
              assert.equal ( article.valid, true );
              done();
            });
          },

          '() - when invalid data': function(done) {
            post.attributes.title = 'A';
            article.attributes.title = 'A';

            // REVIEW: Make sync version - async makes no sense for basic JSON validation.

            Document([post, article]).validate(function() {
              assert.equal ( post.valid, false );
              assert.equal ( article.valid, false );
              done();
            });
          }
        }
      },

      '#invalid': {
        '': function() {
          assert.property ( post, 'invalid' );
          assert.typeOf ( post.invalid, 'boolean' );
        },

        '() - when valid data': function(done) {
          post.attributes.title = "A title";

          // REVIEW: Make sync version - async makes no sense for basic JSON validation.

          post.validate(function() {
            assert.equal ( post.invalid, false );
            done();
          });
        },

        '() - when invalid data': function(done) {
          post.attributes.title = "A";

          // REVIEW: Make sync version - async makes no sense for basic JSON validation.

          post.validate(function() {
            assert.equal ( post.invalid, true );
            done();
          });
        },

        'Collection': {
          '': function() {
            assert.property ( Document([post, article]), 'invalid' );
            assert.typeOf ( Document([post, article]).invalid[0], 'boolean' );
            assert.typeOf ( Document([post, article]).invalid[1], 'boolean' );
          },

          '() - when valid data': function(done) {
            post.attributes.title = 'A title';
            article.attributes.title = 'A title';

            // REVIEW: Make sync version - async makes no sense for basic JSON validation.

            Document([post, article]).validate(function() {
              assert.equal ( post.invalid, false );
              assert.equal ( article.invalid, false );
              done();
            });
          },

          '() - when invalid data': function(done) {
            post.attributes.title = 'A';
            article.attributes.title = 'A';

            // REVIEW: Make sync version - async makes no sense for basic JSON validation.

            Document([post, article]).validate(function() {
              assert.equal ( post.invalid, true );
              assert.equal ( article.invalid, true );
              done();
            });
          }
        }
      }
    }, // Validation

    'Creation': {
      '#clone': {
        '()': function() {
          post = new Post({_id: 1, title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( post.errors, null );

          assert.deepEqual ( post.attributes, {_id: 1, title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( post.changes, null );
          assert.deepEqual ( post.errors, null );

          var cloned_post = post.clone();

          assert.typeOf ( cloned_post.id, 'undefined' );
          assert.deepEqual ( cloned_post.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( cloned_post.changes, null );
          assert.deepEqual ( cloned_post.errors, null );

          var cloned_post_2 = cloned_post.clone();

          assert.typeOf ( cloned_post_2.id, 'undefined' );
          assert.deepEqual ( cloned_post_2.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( cloned_post_2.changes, null );
          assert.deepEqual ( cloned_post_2.errors, null );
        },

        'Collection': {
          '()': function() {
            post = new Post({_id: 1, title: "A title", description: "Lorem ipsum..."});
            article = new Article({_id: 1, title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( post.errors, null );
            assert.deepEqual ( article.errors, null );

            assert.deepEqual ( post.attributes, {_id: 1, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( article.attributes, {_id: 1, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( article.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.deepEqual ( article.errors, null );

            var cloned_docs = Document([post, article]).clone();

            assert.typeOf ( cloned_docs, 'array' );
            assert.typeOf ( cloned_docs[0].id, 'undefined' );
            assert.typeOf ( cloned_docs[1].id, 'undefined' );
            assert.deepEqual ( cloned_docs[0].attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( cloned_docs[1].attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( cloned_docs[0].changes, null );
            assert.deepEqual ( cloned_docs[1].changes, null );
            assert.deepEqual ( cloned_docs[0].errors, null );
            assert.deepEqual ( cloned_docs[1].errors, null );

            var cloned_docs_2 = Document([post, article]).clone();

            assert.typeOf ( cloned_docs_2, 'array' );
            assert.typeOf ( cloned_docs_2[0].id, 'undefined' );
            assert.typeOf ( cloned_docs_2[1].id, 'undefined' );
            assert.deepEqual ( cloned_docs_2[0].attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( cloned_docs_2[1].attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( cloned_docs_2[0].changes, null );
            assert.deepEqual ( cloned_docs_2[1].changes, null );
            assert.deepEqual ( cloned_docs_2[0].errors, null );
            assert.deepEqual ( cloned_docs_2[1].errors, null );
          }
        }
      }
    }, // Creation

    'Persistance': {
      before: function() {
        post = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '#destroy': {
        'this': function(done) {
          post.destroy(function(err) {
            assert.typeOf ( err, 'null' );
            assert.equal ( this, post );
            done();
          });
        },

        'new': {
          '()': function(done) {
            post = new Post({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( post.id, undefined );
            assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.deepEqual ( post.persisted, false );
            assert.deepEqual ( post.unpersisted, true );

            post.destroy(function(err, result) {
              assert.deepEqual ( err, null );

              assert.deepEqual ( result, false );

              assert.typeOf ( post.id, 'undefined' );
              assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post.changes, null );
              assert.deepEqual ( post.errors, null );
              assert.deepEqual ( post.persisted, false );
              assert.deepEqual ( post.unpersisted, true );
              done();
            });
          }
        },

        'persisted': {
          '()': function(done) {
            post = new Post({_id: 5, title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( post.id, 5 );
            assert.deepEqual ( post.attributes, {_id: 5, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.deepEqual ( post.persisted, false );
            assert.deepEqual ( post.unpersisted, true );

            Post.set(5, {title: "A title", description: "Lorem ipsum..."}, function() {
              // BUG: This callback is called 2 times for some reasons
              post.destroy(function(err, result) {
                assert.deepEqual ( err, null );

                console.log('BUG: Called 2x if assertion fails, e.g.: `assert.deepEqual ( result, false )`', result)

                assert.deepEqual ( result, true );

                assert.deepEqual ( post.id, undefined );
                assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( post.changes, null );
                assert.deepEqual ( post.errors, null );
                assert.deepEqual ( post.persisted, false );
                assert.deepEqual ( post.unpersisted, true );
                done();
              });
            });
          }
        },

        'Collection': {
          'this': function(done) {
            Document([post, article]).destroy(function(err) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], post );
              assert.equal ( this[1], article );
              done();
            });
          },

          'new': {
            '()': function(done) {
              post = new Post({title: "A title", description: "Lorem ipsum..."});
              article = new Article({title: "A title", description: "Lorem ipsum..."});

              assert.deepEqual ( post.id, undefined );
              assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post.changes, null );
              assert.deepEqual ( post.errors, null );
              assert.deepEqual ( post.persisted, false );
              assert.deepEqual ( post.unpersisted, true );

              assert.deepEqual ( article.id, undefined );
              assert.deepEqual ( article.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( article.changes, null );
              assert.deepEqual ( article.errors, null );
              assert.deepEqual ( article.persisted, false );
              assert.deepEqual ( article.unpersisted, true );

              Document([post, article]).destroy(function(err, result) {
                assert.typeOf ( err, 'array' );
                assert.deepEqual ( err, [null, null] );

                assert.typeOf ( result, 'array' );
                assert.deepEqual ( result, [false, false] );

                assert.typeOf ( post.id, 'undefined' );
                assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( post.changes, null );
                assert.deepEqual ( post.errors, null );
                assert.deepEqual ( post.persisted, false );
                assert.deepEqual ( post.unpersisted, true );

                assert.typeOf ( article.id, 'undefined' );
                assert.deepEqual ( article.attributes, {title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( article.changes, null );
                assert.deepEqual ( article.errors, null );
                assert.deepEqual ( article.persisted, false );
                assert.deepEqual ( article.unpersisted, true );

                done();
              });
            },

            'persisted': {
              '()': function(done) {
                post = new Post({_id: 5, title: "A title", description: "Lorem ipsum..."});
                article = new Article({_id: 5, title: "A title", description: "Lorem ipsum..."});

                assert.deepEqual ( post.id, 5 );
                assert.deepEqual ( post.attributes, {_id: 5, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( post.changes, null );
                assert.deepEqual ( post.errors, null );
                assert.deepEqual ( post.persisted, false );
                assert.deepEqual ( post.unpersisted, true );

                assert.deepEqual ( article.id, 5 );
                assert.deepEqual ( article.attributes, {_id: 5, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( article.changes, null );
                assert.deepEqual ( article.errors, null );
                assert.deepEqual ( article.persisted, false );
                assert.deepEqual ( article.unpersisted, true );

                Document([Post, Article]).set(5, {title: "A title", description: "Lorem ipsum..."}, function() {
                  Document([post, article]).destroy(function(err, result) {
                    assert.typeOf ( err, 'array' );
                    assert.deepEqual ( err, [null, null] );

                    assert.typeOf ( result, 'array' );
                    assert.deepEqual ( result, [true, true] );

                    assert.deepEqual ( post.id, undefined );
                    assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
                    assert.deepEqual ( post.changes, null );
                    assert.deepEqual ( post.errors, null );
                    assert.deepEqual ( post.persisted, false );
                    assert.deepEqual ( post.unpersisted, true );

                    assert.deepEqual ( article.id, undefined );
                    assert.deepEqual ( article.attributes, {title: "A title", description: "Lorem ipsum..."} );
                    assert.deepEqual ( article.changes, null );
                    assert.deepEqual ( article.errors, null );
                    assert.deepEqual ( article.persisted, false );
                    assert.deepEqual ( article.unpersisted, true );

                    done();
                  });
                });
              }
            }
          },
        }
      }, // #destroy

      '#save': {
        'this': function(done) {
          post.save(function(err) {
            assert.typeOf ( err, 'null' );
            assert.equal ( this, post );
            done();
          });
        },

        'new': {
          '()': function(done) {
            var post = new Post({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( post.id, undefined );
            assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.deepEqual ( post.persisted, false );
            assert.deepEqual ( post.unpersisted, true );

            post.save(function(err, result) {
              assert.deepEqual ( err, null );
              assert.deepEqual ( result, true );

              assert.typeOf ( post.id, 'string' );
              assert.deepEqual ( post.attributes, {_id: post.id, title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post.changes, null );
              assert.deepEqual ( post.errors, null );
              assert.deepEqual ( post.persisted, true );
              assert.deepEqual ( post.unpersisted, false );
              done();
            });
          }
        },

        'persisted': {
          '()': function(done) {
            var post = new Post({_id: 5, title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( post.id, 5 );
            assert.deepEqual ( post.attributes, {_id: 5, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.deepEqual ( post.persisted, false );
            assert.deepEqual ( post.unpersisted, true );

            Post.set(5, {title: "A title", description: "Lorem ipsum..."}, function() {
              post.save(function(err, result) {
                assert.deepEqual ( err, null );
                assert.deepEqual ( result, true );

                assert.typeOf ( post.id, 'number' ); // REVIEW: ...or cast to string always?
                assert.deepEqual ( post.attributes, {_id: post.id, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( post.changes, null );
                assert.deepEqual ( post.errors, null );
                assert.deepEqual ( post.persisted, true );
                assert.deepEqual ( post.unpersisted, false );
                done();
              });
            });
          }
        },

        'Collection': {
          'this': function(done) {
            Document([post, article]).save(function(err) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], post );
              assert.equal ( this[1], article );
              done();
            });
          },

          'new': {
            '()': function(done) {
              var post = new Post({title: "A title", description: "Lorem ipsum..."});
              var article = new Article({title: "A title", description: "Lorem ipsum..."});

              assert.deepEqual ( post.id, undefined );
              assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post.changes, null );
              assert.deepEqual ( post.errors, null );
              assert.deepEqual ( post.persisted, false );
              assert.deepEqual ( post.unpersisted, true );

              assert.deepEqual ( article.id, undefined );
              assert.deepEqual ( article.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( article.changes, null );
              assert.deepEqual ( article.errors, null );
              assert.deepEqual ( article.persisted, false );
              assert.deepEqual ( article.unpersisted, true );

              Document([post, article]).save(function(err, result) {
                assert.typeOf ( err, 'array' );
                assert.deepEqual ( err, [null, null] );

                assert.typeOf ( result, 'array' );
                assert.deepEqual ( result, [true, true] );

                assert.typeOf ( post.id, 'string' );
                assert.deepEqual ( post.attributes, {_id: post.id, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( post.changes, null );
                assert.deepEqual ( post.errors, null );
                assert.deepEqual ( post.persisted, true );
                assert.deepEqual ( post.unpersisted, false );

                assert.typeOf ( article.id, 'string' );
                assert.deepEqual ( article.attributes, {_id: article.id, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( article.changes, null );
                assert.deepEqual ( article.errors, null );
                assert.deepEqual ( article.persisted, true );
                assert.deepEqual ( article.unpersisted, false );

                done();
              });
            }
          },

          'persisted': {
            '()': function(done) {
              var post = new Post({_id: 5, title: "A title", description: "Lorem ipsum..."});
              var article = new Article({_id: 5, title: "A title", description: "Lorem ipsum..."});

              assert.deepEqual ( post.id, 5 );
              assert.deepEqual ( post.attributes, {_id: 5, title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post.changes, null );
              assert.deepEqual ( post.errors, null );
              assert.deepEqual ( post.persisted, false );
              assert.deepEqual ( post.unpersisted, true );

              Document([Post, Article]).set(5, {title: "A title", description: "Lorem ipsum..."}, function() {
                Document([post, article]).save(function(err, result) {
                  assert.typeOf ( err, 'array' );
                  assert.deepEqual ( err, [null, null] );

                  assert.typeOf ( result, 'array' );
                  assert.deepEqual ( result, [true, true] );

                  assert.typeOf ( post.id, 'number' ); // REVIEW: ...or cast to string always?
                  assert.deepEqual ( post.attributes, {_id: post.id, title: "A title", description: "Lorem ipsum..."} );
                  assert.deepEqual ( post.changes, null );
                  assert.deepEqual ( post.errors, null );
                  assert.deepEqual ( post.persisted, true );
                  assert.deepEqual ( post.unpersisted, false );

                  assert.typeOf ( article.id, 'number' ); // REVIEW: ...or cast to string always?
                  assert.deepEqual ( article.attributes, {_id: article.id, title: "A title", description: "Lorem ipsum..."} );
                  assert.deepEqual ( article.changes, null );
                  assert.deepEqual ( article.errors, null );
                  assert.deepEqual ( article.persisted, true );
                  assert.deepEqual ( article.unpersisted, false );

                  done();
                });
              });
            }
          }
        }
      }, // #save

      '#fetch': {
        'this': function(done) {
          post.fetch(function(err) {
            assert.typeOf ( err, 'null' );
            assert.equal ( this, post );
            done();
          });
        },

        'ID specified - new': {
          '()': function(done) {
            post = new Post({_id: 'fetch-1', title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( post.id, 'fetch-1' );
            assert.deepEqual ( post.attributes, {_id: 'fetch-1', title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.deepEqual ( post.persisted, false );
            assert.deepEqual ( post.unpersisted, true );

            Post.del('fetch-1', function() {
              post.fetch(function(err, result) {
                assert.deepEqual ( err, null );
                assert.deepEqual ( result, null );

                assert.deepEqual ( post.id, 'fetch-1' );
                assert.deepEqual ( post.attributes, {_id: 'fetch-1'} );
                assert.deepEqual ( post.changes, null );
                assert.deepEqual ( post.errors, null );
                assert.deepEqual ( post.persisted, false );
                assert.deepEqual ( post.unpersisted, true );
                done();
              });
            });
          }
        },

        'ID specified - existing': {
          '()': function(done) {
            post = new Post({_id: 2, title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( post.id, 2 );
            assert.deepEqual ( post.attributes, {_id: 2, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.deepEqual ( post.persisted, false );
            assert.deepEqual ( post.unpersisted, true );

            Post.set(2, {_id: 2, title: "A title", description: "Lorem ipsum..."}, function() {
              post.fetch(function(err, result) {
                assert.deepEqual ( err, null );
                assert.deepEqual ( result, {_id: 2, title: "A title", description: "Lorem ipsum..."} );

                assert.deepEqual ( post.id, 2 );
                assert.deepEqual ( post.attributes, {_id: 2, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( post.changes, null );
                assert.deepEqual ( post.errors, null );
                assert.deepEqual ( post.persisted, true );
                assert.deepEqual ( post.unpersisted, false );
                done();
              });
            });
          }
        },

        'ID not specified': {
          '()': function(done) {
            post = new Post({title: "A title", description: "Lorem ipsum..."});

            assert.deepEqual ( post.id, undefined );
            assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( post.changes, null );
            assert.deepEqual ( post.errors, null );
            assert.deepEqual ( post.persisted, false );
            assert.deepEqual ( post.unpersisted, true );

            post.fetch(function(err, result) {
              assert.deepEqual ( err, null );
              assert.deepEqual ( result, false );

              assert.typeOf ( post.id, 'undefined' );
              assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post.changes, null );
              assert.deepEqual ( post.errors, null );
              assert.deepEqual ( post.persisted, false );
              assert.deepEqual ( post.unpersisted, true );
              done();
            });
          }
        },

        'Collection': {
          'this': function(done) {
            Document([post, article]).fetch(function(err) {
              assert.typeOf ( err, 'array' );
              assert.deepEqual ( err, [null, null] );

              assert.typeOf ( this, 'array' );
              assert.equal ( this[0], post );
              assert.equal ( this[1], article );
              done();
            });
          },

          'ID specified - new': {
            '()': function(done) {
              post = new Post({_id: 'fetch-1', title: "A title", description: "Lorem ipsum..."});
              article = new Article({_id: 'fetch-1', title: "A title", description: "Lorem ipsum..."});

              assert.deepEqual ( post.id, 'fetch-1' );
              assert.deepEqual ( post.attributes, {_id: 'fetch-1', title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post.changes, null );
              assert.deepEqual ( post.errors, null );
              assert.deepEqual ( post.persisted, false );
              assert.deepEqual ( post.unpersisted, true );

              assert.deepEqual ( article.id, 'fetch-1' );
              assert.deepEqual ( article.attributes, {_id: 'fetch-1', title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( article.changes, null );
              assert.deepEqual ( article.errors, null );
              assert.deepEqual ( article.persisted, false );
              assert.deepEqual ( article.unpersisted, true );

              Document([Post, Article]).del('fetch-1', function() {
                Document([post, article]).fetch(function(err, result) {
                  assert.typeOf ( err, 'array' );
                  assert.deepEqual ( err, [null, null] );

                  assert.typeOf ( result, 'array' );
                  assert.deepEqual ( result, [null, null] );

                  assert.deepEqual ( post.id, 'fetch-1' );
                  assert.deepEqual ( post.attributes, {_id: 'fetch-1'} );
                  assert.deepEqual ( post.changes, null );
                  assert.deepEqual ( post.errors, null );
                  assert.deepEqual ( post.persisted, false );
                  assert.deepEqual ( post.unpersisted, true );

                  assert.deepEqual ( article.id, 'fetch-1' );
                  assert.deepEqual ( article.attributes, {_id: 'fetch-1'} );
                  assert.deepEqual ( article.changes, null );
                  assert.deepEqual ( article.errors, null );
                  assert.deepEqual ( article.persisted, false );
                  assert.deepEqual ( article.unpersisted, true );

                  done();
                });
              });
            }
          },

          'ID specified - existing': {
            '()': function(done) {
              post = new Post({_id: 2, title: "A title", description: "Lorem ipsum..."});
              article = new Post({_id: 2, title: "A title", description: "Lorem ipsum..."});

              assert.deepEqual ( post.id, 2 );
              assert.deepEqual ( post.attributes, {_id: 2, title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post.changes, null );
              assert.deepEqual ( post.errors, null );
              assert.deepEqual ( post.persisted, false );
              assert.deepEqual ( post.unpersisted, true );

              assert.deepEqual ( article.id, 2 );
              assert.deepEqual ( article.attributes, {_id: 2, title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( article.changes, null );
              assert.deepEqual ( article.errors, null );
              assert.deepEqual ( article.persisted, false );
              assert.deepEqual ( article.unpersisted, true );

              Document([Post, Article]).set(2, {_id: 2, title: "A title", description: "Lorem ipsum..."}, function() {
                Document([post, article]).fetch(function(err, result) {
                  assert.typeOf ( err, 'array' );
                  assert.deepEqual ( err, [null, null] );

                  assert.typeOf ( result, 'array' );
                  assert.deepEqual ( result, [{_id: 2, title: "A title", description: "Lorem ipsum..."}, {_id: 2, title: "A title", description: "Lorem ipsum..."}] );

                  assert.deepEqual ( post.id, 2 );
                  assert.deepEqual ( post.attributes, {_id: 2, title: "A title", description: "Lorem ipsum..."} );
                  assert.deepEqual ( post.changes, null );
                  assert.deepEqual ( post.errors, null );
                  assert.deepEqual ( post.persisted, true );
                  assert.deepEqual ( post.unpersisted, false );

                  assert.deepEqual ( article.id, 2 );
                  assert.deepEqual ( article.attributes, {_id: 2, title: "A title", description: "Lorem ipsum..."} );
                  assert.deepEqual ( article.changes, null );
                  assert.deepEqual ( article.errors, null );
                  assert.deepEqual ( article.persisted, true );
                  assert.deepEqual ( article.unpersisted, false );

                  done();
                });
              });
            }
          },

          'ID not specified': {
            '()': function(done) {
              post = new Post({title: "A title", description: "Lorem ipsum..."});
              article = new Article({title: "A title", description: "Lorem ipsum..."});

              assert.deepEqual ( post.id, undefined );
              assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( post.changes, null );
              assert.deepEqual ( post.errors, null );
              assert.deepEqual ( post.persisted, false );
              assert.deepEqual ( post.unpersisted, true );

              assert.deepEqual ( article.id, undefined );
              assert.deepEqual ( article.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( article.changes, null );
              assert.deepEqual ( article.errors, null );
              assert.deepEqual ( article.persisted, false );
              assert.deepEqual ( article.unpersisted, true );

              Document([post, article]).fetch(function(err, result) {
                assert.typeOf ( err, 'array' );
                assert.deepEqual ( err, [null, null] );

                assert.typeOf ( result, 'array' );
                assert.deepEqual ( result, [false, false] );

                assert.typeOf ( post.id, 'undefined' );
                assert.deepEqual ( post.attributes, {title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( post.changes, null );
                assert.deepEqual ( post.errors, null );
                assert.deepEqual ( post.persisted, false );
                assert.deepEqual ( post.unpersisted, true );

                assert.typeOf ( article.id, 'undefined' );
                assert.deepEqual ( article.attributes, {title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( article.changes, null );
                assert.deepEqual ( article.errors, null );
                assert.deepEqual ( article.persisted, false );
                assert.deepEqual ( article.unpersisted, true );

                done();
              });
            }
          }
        }
      } // #fetch
    }, // Persistance

    'Events': {
      before: function() {
        Post = Document('Post');
        post = new Post();
      },

      'emit': function() {
        assert.property ( Post, 'emit');
        assert.typeOf ( Post.emit, 'function');

        post.emit('event', 1, 2, 3);
      },

      'on': function() {
        assert.property ( post, 'on');
        assert.typeOf ( post.on, 'function');

        var callback = function(a, b, c) {
          assert.deepEqual ( [a, b, c], [1, 2, 3] );
        };

        post.on('event', callback);

        post.emit('event', 1, 2, 3);
      },

      'off': function() {
        assert.property ( Post, 'off');
        assert.typeOf ( Post.off, 'function');

        var callback = function(a, b, c) {
          assert.deepEqual ( [a, b, c], [1, 2, 3] );
        };

        post.on('event', callback);
        post.off('event', callback);

        post.emit('event', 1, 2, 3);
      },

      'Collection': {
        'emit': function() {
          Document([post, article]).emit('event', 1, 2, 3);
        },

        'on': function() {
          var callback = function(a, b, c) {
            assert.deepEqual ( [a, b, c], [1, 2, 3] );
          };

          post.on('event', callback);
          article.on('event', callback);

          Document([post, article]).emit('event', 1, 2, 3);
        },

        'off': function() {
          var callback = function(a, b, c) {
            assert.deepEqual ( [a, b, c], [1, 2, 3] );
          };

          post.on('event', callback);
          post.off('event', callback);
          article.on('event', callback);
          article.off('event', callback);

          Document([post, article]).emit('event', 1, 2, 3);
        }
      }
    } // Events

  } // Document.Model.prototype

};
