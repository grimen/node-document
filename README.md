# NODE-DOCUMENT [![Build Status](https://secure.travis-ci.org/grimen/node-document.png)](http://travis-ci.org/grimen/node-document)

*Many document stores, Y U NO interface?*

![](http://cl.ly/image/3e0s0X000K1m/node-document-logotype.png)

Work in progress; see **[TODO](https://github.com/grimen/node-document/blob/master/TODO)**.


## What it is - and what it's not

A **minimalistic ODM** for the most atomic operations - such as `GET`/`SET`/`DEL` - on different kinds of "document(-ish)" stores using **one unified API**; switching database should be a matter of changing a line of code.

To stick to this philosophy more advanced operations such as "queries" won't be a core feature, but as `node-document` won't mess with your data it can be used along with any 3rd-party drivers as if there was no tomorrow.


## Features

* **Document**
	* Class
		* `new`
		* `create`
		* `get`
		* `set`
		* `del`
	* Instance
		* `save`
		* `destroy`
		* `fetch`
		* `validate`
		* `diff`
		* `clone`
		* `inspect`
	* Events
* **Storage**
	* Operations: Single + Bulk
    	* `get`
    	* `set`
    	* `del`
    * Connect-on-demand: Auto-connect on first operation (operation queue)
	* Adapters
		* Memory
		* [FileSystem](http://nodejs.org/api/fs.html)
		* [Memcache](http://memcached.org)
		* [Redis](http://redis.io)
		* [MongoDB](http://mongodb.org)
		* [ElasticSearch](http://elasticsearch.org)
		* [AmazonS3](http://aws.amazon.com/s3)
    * Events
* **Validation (Schema)**
	* Spec: [JSON Schema](http://json-schema.org)
	* Adapters
		* [Amanda](https://github.com/Baggz/Amanda)
		* [Schema.js](https://github.com/akidee/schema.js)
* **Diffing**
	* Adapters
    	* [JSONDiff](https://github.com/andreyvit/json-diff)
		* [DeepDiff](https://github.com/flitbit/diff)
		* [ObjectDiff](https://github.com/NV/objectDiff.js)
		* [Patcher.js](https://github.com/mikolalysenko/patcher.js)


## Installation

```shell
  $ npm install node-document
```


## Usage

**Basic:**

```javascript
  var Document = require('node-document');

  // Some storages of choice
  var Redis = Document.require('storage/redis');
  var FileSystem = Document.require('storage/filesystem');

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
