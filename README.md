# NODE-DOCUMENT [![Build Status](https://secure.travis-ci.org/grimen/node-document.png)](http://travis-ci.org/grimen/node-document)

*Many document stores, Y U NO interface?*

![](http://cl.ly/image/3e0s0X000K1m/node-document-logotype.png)

Work in progress; see **[TODO](https://github.com/grimen/node-document/blob/master/TODO)**.


## About

**Minimalistic ODM** for [Node.js](http://nodejs.org) implementing the most fundamental operations (such as `GET`/`SET`/`DEL`) on different kinds of "document(-ish)" stores using **one unified API**. Switching database should be a matter of changing a line of code.

To stick to this philosophy more advanced operations won't be supported in core, but `node-document` can be used along with any 3rd-party drivers.


## Document

The ODM.

* Class
	* `new`
	* `create`
	* `get`
	* `set`
	* `del`
	* `exists`
* Instance
	* `save`
	* `destroy`
	* `fetch`
	* `validate`
	* `diff`
	* `clone`
	* `inspect`
* Events


### [**Storage**](https://github.com/grimen/node-document-storage)

Unified interface for write/read data to/from differen kinds of storages/databases.

* Operations: Single + Bulk
	* `get`
	* `set`
	* `del`
	* `exists`
  * Connect-on-demand: Auto-connect on first operation (operation queue)
* Adapters
	* [Global](https://github.com/grimen/node-document-storage-global) *Memory*
	* [FS](https://github.com/grimen/node-document-storage-fs) *FileSystem*
	* [NStore](https://github.com/grimen/node-document-storage-nstore) *Memory/File/Process*
	* [Memcached](https://github.com/grimen/node-document-storage-memcached)
	* [Redis](https://github.com/grimen/node-document-storage-redis)
	* [KyotoCabinet](https://github.com/grimen/node-document-storage-kyotocabinet)
	* [MongoDB](https://github.com/grimen/node-document-storage-mongodb)
	* [CouchDB](https://github.com/grimen/node-document-storage-couchdb)
	* [Riak](https://github.com/grimen/node-document-storage-riak)
	* [ElasticSearch](https://github.com/grimen/node-document-storage-elasticsearch)
	* [AmazonS3](https://github.com/grimen/node-document-storage-amazons3)
* Events


### [**Validator**](https://github.com/grimen/node-document-validator)

Unified interface for validating data based on a custom [JSON Schema](http://json-schema.org).

* Operations:
	* `validate`
* Adapters
	* [Amanda](https://github.com/grimen/node-document-validator-amanda)
	* [Schema.js](https://github.com/grimen/node-document-validator-schema)
	* [JSONSchema](https://github.com/grimen/node-document-validator-jsonschema)
	* [JSV](https://github.com/grimen/node-document-validator-jsv)


### [**Differ**](https://github.com/grimen/node-document-differ)

Unified interface for diffing objects to see changes between the two (additions/removals/edits).

* Operations:
	* `diff`
* Adapters
	* [JSONDiff](https://github.com/grimen/node-document-differ-jsondiff)
	* [DeepDiff](https://github.com/grimen/node-document-differ-deepdiff)
	* [ObjectDiff](https://github.com/grimen/node-document-differ-objectdiff)
	* [Patcher.js](https://github.com/grimen/node-document-differ-patcher)


## Installation

```shell
  $ npm install node-document
```


## Usage

**Basic:**

```javascript
  var Document = require('node-document');

  // Some storages of choice - install via NPM
  var Redis = require('node-document-storage-redis'); // NOTE: $ npm install node-document-storage-redis
  var FileSystem = require('node-document-storage-fs'); // NOTE: $ npm install node-document-storage-fs

  // A model
  var Post = Document('Post', new Redis('redis://localhost:6379/app'));

  // A record
  var post = new Post({title: "Once upon a time"});

  // Save it
  post.save(function(err, res) {
    console.log("SAVE  Persisted: %s | Storage: %s | Type: %s | ID: %s  ->  %s", post.persisted, post.storage.name, post.type, post.id, post);

    // Find it
    Post.get(post.id, function(err, res) {
      console.log("GET  Storage: %s | Type: %s | ID: %s  ->  %s", post.storage.name, post.type, post.id, JSON.stringify(res));

      // Destroy it
      post.destroy(function(err, res) {
        console.log("DESTROY  Persisted: %s | Storage: %s | Type: %s | ID: %s  ->  %s", post.persisted, post.storage.name, post.type, post.id, post);

        // Switch storage
        Post.storage = new FileSystem('file:///tmp/app');

        // Save to file instead
        post.save(function(err, res) {
          console.log("SAVE  Persisted: %s | Storage: %s | Type: %s | ID: %s  ->  %s", post.persisted, post.storage.name, post.type, post.id, post);

          // Find it again
          Post.get(post.id, function(err, res) {
            console.log("GET  Storage: %s | Type: %s | ID: %s  ->  %s", post.storage.name, post.type, post.id, JSON.stringify(res));
          });
        });
      });
    });
  });

  // etc.
})
```

More usage examples coming soon, unil then checkout the [tests](https://github.com/grimen/node-document/blob/master/test/document_spec.js).


## Test

**Local tests:**

```shell
  $ make test
```

**Remote tests:**

```shell
  $ make test-remote
```


## Notes

This project is very much work-in-progress; the API will most probably change between the first couple of minor version numbers until it will be settled.


## Credit

* [Christian Landgren](https://github.com/irony) - input and feedback


## License

Released under the MIT license.

Copyright (c) [Jonas Grimfelt](http://github.com/grimen)
