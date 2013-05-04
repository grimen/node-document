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

      '': function() {
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

      '.validator': function() {
        assert.instanceOf ( Post.validator, Document.DefaultValidator );
      },

      '.differ': function() {
        assert.instanceOf ( Post.differ, Document.DefaultDiffer );
      }
    },

    '("type", storage)': {
      before: function() {
        Post = Document('Post', new Storage());
      },

      '': function() {
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
      },

      '.validator': function() {
        assert.instanceOf ( Post.validator, Document.DefaultValidator );
      },

      '.differ': function() {
        assert.instanceOf ( Post.differ, Document.DefaultDiffer );
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
      },

      '.validator': function() {
        assert.instanceOf ( Post.validator, Document.DefaultValidator );
      },

      '.differ': function() {
        assert.instanceOf ( Post.differ, Document.DefaultDiffer );
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
      },

      '.validator': function() {
        assert.instanceOf ( Post.validator, Document.DefaultValidator );
      },

      '.differ': function() {
        assert.instanceOf ( Post.differ, Document.DefaultDiffer );
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

    '.require': {
      '': function() {
        assert.typeOf ( Document.require, 'function' );
      },

      '(valid_adapter_path)': function() {
        assert.equal ( Document.require('class'), Document.Class );
      },

      '(invalid_adapter_path)': function() {
        assert.throws (function() {
          Document.require('storage/bogus');
        });
      }
    },

    'Adapters': {
      before: function() {
        Storage = require('node-document-storage-global');
        Validator = require('node-document-validator-schema');
        Differ = require('node-document-differ-jsondiff');
      },

      after: function() {
        Document.storage = Document.DefaultStorage;
        Document.validator = Document.DefaultValidator;
        Document.differ = Document.DefaultDiffer;
      },

      // TODO: Subclass `Document.Adapter` to make `use` smarter using `instanceof`.

      '.use': {
        '': function() {
          assert.property ( Document, 'use' );
          assert.typeOf ( Document.use, 'function' );
        },

        'Storage': {
          '("storage", Storage)': function() {
            Document.use('storage', Storage);
            assert.deepEqual ( Document.storage, Storage );
          },

          '("storage", storage)': function() {
            Document.use('storage', new Storage());
            assert.instanceOf ( Document.storage, Storage );
          }
        },

        'Validator': {
          '("validator", Validator)': function() {
            Document.use('validator', Validator);
            assert.deepEqual ( Document.validator, Validator );
          },

          '("validator", validator)': function() {
            Document.use('validator', new Validator());
            assert.instanceOf ( Document.validator, Validator );
          }
        },

        'Differ': {
          '("differ", Differ)': function() {
            Document.use('differ', Differ);
            assert.deepEqual ( Document.differ, Differ );
          },

          '("differ", differ)': function() {
            Document.use('differ', new Differ());
            assert.instanceOf ( Document.differ, Differ );
          }
        }
      }
    }

  } // Document
};
