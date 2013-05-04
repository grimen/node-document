var helper = require('../helper'),
    assert = helper.assert,
    debug = helper.debug;

var Document = require('../../');

var Storage = Document.DefaultStorage;
var Validator = Document.DefaultValidator;
var Differ = Document.DefaultDiffer;

var Post;
var Article;

var post;
var posts;

var article;

module.exports = {
  'Document.Model': {
    before: function() {
      Post = Document('Post');
      Article = Document('Article');
    },

    'Generators': {
      '.id': {
        '': function() {
          assert.property ( Post, 'id' );
          assert.typeOf ( Post.id, 'function' );
        },

        'Default': function() {
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

    'Adapters': {
      before: function() {
        Storage = require('node-document-storage-global');
        Validator = require('node-document-validator-schema');
        Differ = require('node-document-differ-jsondiff');
      },

      after: function() {
        Post.storage = Post.DefaultStorage;
        Post.validator = Post.DefaultValidator;
        Post.differ = Post.DefaultDiffer;
      },

      // TODO: Subclass `Document.Adapter` to make `use` smarter using `instanceof`.

      '.use': {
        '': function() {
          assert.property ( Post, 'use' );
          assert.typeOf ( Post.use, 'function' );
        },

        'Storage': {
          '("storage", Storage)': function() {
            Post.use('storage', Storage);
            assert.instanceOf ( Post.storage, Storage );
          },

          '("storage", storage)': function() {
            Post.use('storage', new Storage());
            assert.instanceOf ( Post.storage, Storage );
          },

          'Collection': {
            '("storage", Storage)': function() {
              var res = Document([Post, Article]).use('storage', Storage);
              assert.instanceOf ( Post.storage, Storage );
              assert.instanceOf ( Article.storage, Storage );
            },

            '("storage", storage)': function() {
              Document([Post, Article]).use('storage', new Storage());
              assert.instanceOf ( Post.storage, Storage );
              assert.instanceOf ( Article.storage, Storage );
            }
          }
        },

        'Validator': {
          '("validator", Validator)': function() {
            Post.use('validator', Validator);
            assert.instanceOf ( Post.validator, Validator );
          },

          '("validator", validator)': function() {
            Post.use('validator', new Validator());
            assert.instanceOf ( Post.validator, Validator );
          }
        },

        'Differ': {
          '("differ", Differ)': function() {
            Post.use('differ', Differ);
            assert.instanceOf ( Post.differ, Differ );
          },

          '("differ", differ)': function() {
            Post.use('differ', new Differ());
            assert.instanceOf ( Post.differ, Differ );
          }
        }
      }
    },

    'Creation': {
      '.new': {
        '': function() {
          assert.property ( Post, 'new' );
          assert.typeOf ( Post.new, 'function' );
        },

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
          '': function() {
            assert.property ( Document([Post, Article]), 'new' );
            assert.typeOf ( Document([Post, Article]).new, 'function' );
          },

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
        '': function() {
          assert.property ( Post, 'create' );
          assert.typeOf ( Post.create, 'function' );
        },

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
          '': function() {
            assert.property ( Document([Post, Article]), 'create' );
            assert.typeOf ( Document([Post, Article]).create, 'function' );
          },

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
        '': function() {
          assert.property ( Post, 'set' );
          assert.typeOf ( Post.set, 'function' );
        },

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
          '': function() {
            assert.property ( Document([Post, Article]), 'set' );
            assert.typeOf ( Document([Post, Article]).set, 'function' );
          },

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
        '': function() {
          assert.property ( Post, 'get' );
          assert.typeOf ( Post.get, 'function' );
        },

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
          '': function() {
            assert.property ( Document([Post, Article]), 'get' );
            assert.typeOf ( Document([Post, Article]).get, 'function' );
          },

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
        '': function() {
          assert.property ( Post, 'del' );
          assert.typeOf ( Post.del, 'function' );
        },

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
          '': function() {
            assert.property ( Document([Post, Article]), 'del' );
            assert.typeOf ( Document([Post, Article]).del, 'function' );
          },

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
        '': function() {
          assert.property ( Post, 'exists' );
          assert.typeOf ( Post.exists, 'function' );
        },

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
          '': function() {
            assert.property ( Document([Post, Article]), 'exists' );
            assert.typeOf ( Document([Post, Article]).exists, 'function' );
          },

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
        '': function() {
          assert.property ( Post, 'end' );
          assert.typeOf ( Post.end, 'function' );
        },

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
          '': function() {
            assert.property ( Document([Post, Article]), 'end' );
            assert.typeOf ( Document([Post, Article]).end, 'function' );
          },

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
              minLength: 7
            }
          });
          Article = Document('Article', {
            title: {
              required: true,
              type: 'string',
              minLength: 7
            }
          });
        },

        '': function() {
          assert.property ( Post, 'validate' );
          assert.typeOf ( Post.validate, 'function' );
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
            assert.ok ( errors, 'object' );
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
            assert.ok ( errors );
            assert.equal ( errors.length, 1 );
            assert.equal ( valid, false );
            done();
          });
        },

        'Collection': {
          '': function() {
            assert.property ( Document([Post, Article]), 'validate' );
            assert.typeOf ( Document([Post, Article]).validate, 'function' );
          },

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
              assert.ok ( errors[0] );
              assert.equal ( errors[0].length, 1 );
              assert.ok ( errors[1] );
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
              assert.ok ( errors[0] );
              assert.equal ( errors[0].length, 1 );
              assert.ok ( errors[1] );
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
      '': function() {
        assert.property ( Post, 'diff' );
        assert.typeOf ( Post.diff, 'function' );
      },

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
          '': function() {
            assert.property ( Document([Post, Article]), 'diff' );
            assert.typeOf ( Document([Post, Article]).diff, 'function' );
          },

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

  }
}; // Document.Model
