require('sugar');
var helper = require('./spec_helper'),
    assert = helper.assert,
    debug = console.log,

    Document = require('../lib/document'),

    Redis = require('../lib/storage/redis'),
    redis = new Redis();

var Post = undefined,
    doc = undefined;


var Spec = {

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

      '.del | .delete': function() {
        assert.typeOf ( Post.del, 'function' );
        assert.typeOf ( Post.delete, 'function' );
      },

      '.end': function() {
        assert.typeOf ( Post.end, 'function' );
      }
    },

    '("type", storage)': {
      before: function() {
        Post = Document('Post', redis);
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
        assert.instanceOf ( Post.storage, Redis );
      }
    },

    'new': {
      '()': function() {
        doc = new Post();

        assert.typeOf ( doc, 'object' );
        assert.typeOf ( doc.attributes, 'object' );
        assert.typeOf ( doc.changes, 'object' );
        assert.typeOf ( doc.errors, 'object' );

        assert.deepEqual ( doc.attributes, {} );
        assert.equal ( doc.id, doc.attributes.id );
      },

      '(attributes)': function() {
        doc = new Post({title: "A title", description: "Lorem ipsum..."});

        assert.typeOf ( doc, 'object' );
        assert.typeOf ( doc.attributes, 'object' );
        assert.typeOf ( doc.changes, 'object' );
        assert.typeOf ( doc.errors, 'object' );

        assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
        assert.equal ( doc.id, doc.attributes.id );
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
          assert.typeOf ( doc.changes, 'object' );
          assert.typeOf ( doc.errors, 'object' );

          assert.deepEqual ( doc.attributes, {} );
          assert.equal ( doc.id, doc.attributes.id );
        },

        '(attributes)': function() {
          doc = Post.new({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc, 'object' );
          assert.typeOf ( doc.attributes, 'object' );
          assert.typeOf ( doc.changes, 'object' );
          assert.typeOf ( doc.errors, 'object' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.equal ( doc.id, doc.attributes.id );
        }
      }
    },

    'Persistance': {
      '.create': {
        '()': function() {
          Post.create(function(err, doc) {
            assert.deepEqual ( doc.attributes, {id: doc.id} );
            assert.deepEqual ( doc.changes, {} );
            assert.deepEqual ( doc.errors, {} );
            assert.equal ( doc.persisted, true );
            assert.equal ( doc.new, false );
          });
        },

        '({})': function() {
          Post.create({title: "A title", description: "Lorem ipsum..."}, function(err, doc) {
            assert.deepEqual ( doc.attributes, {id: doc.id, title: "A title", description: "Lorem ipsum..."} );
            assert.deepEqual ( doc.changes, {} );
            assert.deepEqual ( doc.errors, {} );
            assert.equal ( doc.persisted, true );
            assert.equal ( doc.new, false );
          });
        }
      },

      '.set': {
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

        '(1, {})': function() {
          Post.set(1, {foo: 'bar 1'}, function(err, result) {
            assert.deepEqual ( result, [true] );
          });
        },

        '(1, {}, {})': function() {
          Post.set(1, {foo: 'bar 1'}, {}, function(err, result) {
            assert.deepEqual ( result, [true] );
          });
        },

        // .set *

        '([1, 2])': function() {
          assert.throws(function() {
            Post.set([1, 2], function(err, result) {});
          });
        },

        '([1, 2], {})': function() {
          assert.throws(function() {
            Post.set([1, 2], {foo: 'bar 1'}, function(err, result) {});
          });
        },

        '([1, 2], [{}])': function() {
          assert.throws(function() {
            Post.set([1, 2], [{foo: 'bar 1'}], function(err, result) {});
          });
        },

        '([1, 2], [{}, {}])': function() {
          Post.set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], function(err, result) {
            assert.deepEqual ( result, [true, true] );
          });
        },

        '([1, 2], [{}, {}], {})': function() {
          Post.set([1, 2], [{foo: 'bar 1'}, {foo: 'bar 2'}], {}, function(err, result) {
            assert.deepEqual ( result, [true, true] );
          });
        }
      }, // .set

      '.get': {
        '()': function() {
          assert.throws(function() {
            Post.get(function(err, result) {});
          });
        },

        // .get 1

        '(1)': function() {
          Post.get(1, function(err, result) {
            assert.deepEqual ( result, [{foo: 'bar 1'}] );
          });
        },

        '(1, {})': function() {
          Post.get(1, {}, function(err, result) {
            assert.deepEqual ( result, [{foo: 'bar 1'}] );
          });
        },

        // .get *

        '([1, 2])': function() {
          Post.get([1, 2], function(err, result) {
            assert.deepEqual ( result, [{foo: 'bar 1'}, {foo: 'bar 2'}] );
          });
        },

        '([1, 2], {})': function() {
          Post.get([1, 2], {}, function(err, result) {
            assert.deepEqual ( result, [{foo: 'bar 1'}, {foo: 'bar 2'}] );
          });
        }
      }, // .get

      '.del': {
        '()': function() {
          assert.throws(function() {
            Post.del(function(err, result) {});
          });
        },

        // .del 1

        '(1)': function() {
          Post.del(1, function(err, result) {
            assert.deepEqual ( result, [true] );
          });
        },

        '(1, {})': function() {
          Post.del(1, {}, function(err, result) {
            assert.deepEqual ( result, [false] );
          });
        },

        // .del *

        '([1, 2])': function() {
          Post.del([1, 2], function(err, result) {
            assert.deepEqual ( result, [false, true] );
          });
        },

        '([1, 2], {})': function() {
          Post.del([1, 2], {}, function(err, result) {
            assert.deepEqual ( result, [false, false] );
          });
        }
      }, // .del

      '.end': {
        '()': function() {
          assert.ok ( Post.end(function(err, result) {}) );
        }
      } // .end
    },

    'Schema': {
      '.validate': {
        '()': undefined,

        '(attributes)': undefined,

        '(attributes, options)': undefined
      } // .validate
    }

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

        doc.attributes.id = 123;
        assert.equal ( doc.id, 123 );

        doc.attributes.id = "123-abc";
        assert.equal ( doc.id, "123-abc" );

        doc.attributes.id = null;
        assert.equal ( doc.id, null );
      },

      '#has': {
        '(key)': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.has, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.has('title'), true );
          assert.deepEqual ( doc.has('description'), true );
          assert.deepEqual ( doc.has('foo'), false );
        }
      },

      '#get': {
        '()': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.get, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.get(), {title: "A title", description: "Lorem ipsum..."} );
        },

        '(key)': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.get, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.get('title'), "A title" );
          assert.deepEqual ( doc.get('description'), "Lorem ipsum..." );
          assert.deepEqual ( doc.get('foo'), undefined );
        },

        '(nested_key)': undefined
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
        },

        '(key, value)': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.set, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.set('title', "A modified title"), {title: "A modified title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.attributes, {title: "A modified title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.set('published', true), {title: "A modified title", description: "Lorem ipsum...", published: true} );
          assert.deepEqual ( doc.attributes, {title: "A modified title", description: "Lorem ipsum...", published: true} );
        },

        '(nested_key, value)': undefined
      },

      '#del': {
        '(key)': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.set, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.del('title'), {description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.attributes, {description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.del('published'), {description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.attributes, {description: "Lorem ipsum..."} );
        },

        '(keys)': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.set, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.del(['published', 'created_at']), {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.del(['title', 'description']), {} );
          assert.deepEqual ( doc.attributes, {} );
        },

        '(nested_key)': undefined,

        '(nested_keys)': undefined
      },

      '#attr': {
        '()': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.attr, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.attr(), {title: "A title", description: "Lorem ipsum..."} );
        },

        '(key)': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.attr, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.attr('title'), "A title" );
          assert.deepEqual ( doc.attr('description'), "Lorem ipsum..." );
          assert.deepEqual ( doc.attr('foo'), undefined );
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
        },

        '(key, value)': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.typeOf ( doc.attr, 'function' );

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.attr('title', "A modified title"), {title: "A modified title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.attributes, {title: "A modified title", description: "Lorem ipsum..."} );

          assert.deepEqual ( doc.attr('published', true), {title: "A modified title", description: "Lorem ipsum...", published: true} );
          assert.deepEqual ( doc.attributes, {title: "A modified title", description: "Lorem ipsum...", published: true} );
        }
      },

      '#reset': {
        '()': function() {
          doc = new Post();

          assert.deepEqual ( doc.persisted_attributes, undefined );

          doc.persisted_attributes = {title: "A title", description: "Lorem ipsum..."};

          assert.deepEqual ( doc.attributes, {} );
          assert.deepEqual ( doc.changes, {} );
          assert.deepEqual ( doc.errors, {} );

          doc.reset();

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.changes, {} );
          assert.deepEqual ( doc.errors, {} );
        }
      },

      '#clear': {
        '()': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          doc.clear();

          assert.deepEqual ( doc.attributes, {} );
          assert.deepEqual ( doc.changes, {} );
          assert.deepEqual ( doc.errors, {} );
        },

        '("attributes")': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          doc.clear('attributes');

          assert.deepEqual ( doc.attributes, {} );
          assert.deepEqual ( doc.changes, {} );
          assert.deepEqual ( doc.errors, {} );
        },

        '("changes")': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          doc.clear('changes');

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.changes, {} );
          assert.deepEqual ( doc.errors, {} );
        },

        '("errors")': function() {
          doc = new Post({title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );

          doc.clear('errors');

          assert.deepEqual ( doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.changes, {} );
          assert.deepEqual ( doc.errors, {} );
        }
      }
    }, // Attributes

    'Changes': {
      '#changes': function() {
        assert.typeOf ( doc.changes, 'object');
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
          assert.deepEqual ( doc.toString(), JSON.stringify({title: "A title", description: "Lorem ipsum..."}) )
        }
      },

      // '#inspect': {
      //   '=> JSON object (#)': function() {
      //     assert.typeOf ( doc.inspect, 'function' );
      //     assert.deepEqual ( doc.inspect(), require('util').inspect({title: "A title", description: "Lorem ipsum..."}) )
      //   }
      // }
    }, // Serialization

    'Validation': {
      before: function() {
        doc = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '#errors': function() {
        assert.typeOf ( doc.errors, 'object');
      },

      '#validate': {
        '() - when valid data': undefined,

        '() - when invalid data': undefined
      },

      '#valid': {
        '() - when valid data': undefined,

        '() - when invalid data': undefined
      },

      '#invalid': {
        '() - when valid data': undefined,

        '() - when invalid data': undefined
      }
    }, // Validation

    'Creation': {
      '#clone': {
        '()': function() {
          doc = new Post({id: 1, title: "A title", description: "Lorem ipsum..."});

          assert.deepEqual ( doc.errors, {} );

          assert.deepEqual ( doc.attributes, {id: 1, title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( doc.changes, {} );
          assert.deepEqual ( doc.errors, {} );

          var cloned_doc = doc.clone();

          assert.deepEqual ( cloned_doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( cloned_doc.changes, {} );
          assert.deepEqual ( cloned_doc.errors, {} );

          var cloned_doc_2 = cloned_doc.clone();

          assert.deepEqual ( cloned_doc_2.attributes, {title: "A title", description: "Lorem ipsum..."} );
          assert.deepEqual ( cloned_doc_2.changes, {} );
          assert.deepEqual ( cloned_doc_2.errors, {} );
        }
      }
    }, // Creation

    'Persistance': {
      before: function() {
        doc = new Post({title: "A title", description: "Lorem ipsum..."});
      },

      '#destroy': {
        'new': {
          '()': function() {
            doc = new Post({title: "A title", description: "Lorem ipsum..."});

            doc.destroy(function(err, _doc) {
              assert.deepEqual ( _doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( _doc.changes, {} );
              assert.deepEqual ( _doc.errors, {} );
              assert.deepEqual ( _doc.persisted, false );
              assert.deepEqual ( _doc.new, true );
            });
          }
        },

        'persisted': {
          '()': function() {
            doc = new Post({id: 5, title: "A title", description: "Lorem ipsum..."});

            Post.set(5, {title: "A title", description: "Lorem ipsum..."}, function() {
              doc.destroy(function(err, _doc) {
                assert.deepEqual ( _doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( _doc.changes, {} );
                assert.deepEqual ( _doc.errors, {} );
                assert.deepEqual ( _doc.persisted, false );
                assert.deepEqual ( _doc.new, true );
              });
            });
          }
        }
      }, // #destroy

      '#save': {
        'new': {
          '()': function() {
            var doc = new Post({title: "A title", description: "Lorem ipsum..."});

            doc.save(function(err, _doc) {
              assert.deepEqual ( _doc.attributes, {id: doc.id, title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( _doc.changes, {} );
              assert.deepEqual ( _doc.errors, {} );
              assert.deepEqual ( _doc.persisted, true );
              assert.deepEqual ( _doc.new, false );
            });
          }
        },

        'persisted': {
          '()': function() {
            var doc = new Post({id: 5, title: "A title", description: "Lorem ipsum..."});

            Post.set(doc.id, {title: "A title", description: "Lorem ipsum..."}, function() {
              doc.save(function(err, _doc) {
                assert.deepEqual ( _doc.attributes, {id: doc.id, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( _doc.changes, {} );
                assert.deepEqual ( _doc.errors, {} );
                assert.deepEqual ( _doc.persisted, true );
                assert.deepEqual ( _doc.new, false );
              });
            });
          }
        }
      }, // #save

      '#fetch': {
        'ID specified - new': {
          '()': function() {
            doc = new Post({id: 'fetch-1', title: "A title", description: "Lorem ipsum..."});

            Post.del(doc.id, function() {
              doc.fetch(function(err, _doc) {
                assert.deepEqual ( _doc.id, 'fetch-1' );
                assert.deepEqual ( _doc.attributes, {id: 'fetch-1'} );
                assert.deepEqual ( _doc.changes, {} );
                assert.deepEqual ( _doc.errors, {} );
                assert.deepEqual ( _doc.persisted, false )
                assert.deepEqual ( _doc.new, true )
              });
            });
          }
        },

        'ID specified - existing': {
          '()': function() {
            doc = new Post({id: 2, title: "A title", description: "Lorem ipsum..."});

            Post.set(2, {id: 2, title: "A title", description: "Lorem ipsum..."}, function() {
              doc.fetch(function(err, _doc) {
                assert.deepEqual ( _doc.id, 2 );
                assert.deepEqual ( _doc.attributes, {id: 2, title: "A title", description: "Lorem ipsum..."} );
                assert.deepEqual ( _doc.changes, {} );
                assert.deepEqual ( _doc.errors, {} );
                assert.deepEqual ( _doc.persisted, true );
                assert.deepEqual ( _doc.new, false );
              });
            });
          }
        },

        'ID not specified': {
          '()': function() {
            doc = new Post({title: "A title", description: "Lorem ipsum..."});

            doc.fetch(function(err, _doc) {
              assert.deepEqual ( _doc.id, undefined );
              assert.deepEqual ( _doc.attributes, {title: "A title", description: "Lorem ipsum..."} );
              assert.deepEqual ( _doc.changes, {} );
              assert.deepEqual ( _doc.errors, {} );
              assert.deepEqual ( _doc.persisted, false );
              assert.deepEqual ( _doc.new, true );
            });
          }
        }
      } // #fetch

    }, // Persistance

  } // Document.Model.prototype

};

module.exports = Spec;
