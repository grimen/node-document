# NODE-DOCUMENT [![Build Status](https://secure.travis-ci.org/grimen/node-document.png)](http://travis-ci.org/grimen/node-document)

*Many document stores, Y U NO interface?*

![](http://cl.ly/image/3e0s0X000K1m/node-document-logotype.png)

Work in progress; see **[TODO](https://github.com/grimen/node-document/blob/master/TODO)**.


## What it is - and what it's not

A **minimalistic ODM** for the most atomic operations - such as `GET`/`SET`/`DEL` - on different kinds of "document(-ish)" stores using **one unified API**; switching database should be a matter of changing a line of code.

To stick to this philosophy more advanced operations such as "queries" won't be a core feature, but as `node-document` won't mess with your data it can be used along with any 3rd-party drivers as if there was no tomorrow.


## Features

* Document
	* Class
		* new
		* create
		* clear
		* get
		* set
		* del
	* Instance
		* save
		* destroy
		* fetch
		* validate
		* diff
		* clone
		* inspect
	* Events
* Storage
	* Auto-connect on first operation (operation queue)
	* Operations: Single + Bulk
		* get
		* set
		* del
	* Adapters
		* Memory
		* FileSystem
		* Memcache
		* Redis
		* MongoDB
		* ElasticSearch
		* ...
	* Events
* Validation / Schema
	* Adapters
		* Amanda
		* ...
* Diffing
	* Adapters
		* JSONDiff
		* ...


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
    Post.get(post.id, function() {
      console.log("GET  Persisted: %s | Storage: %s | Type: %s | ID: %s  ->  %s", post.persisted, post.storage.name, post.type, post.id, post);

      // Destroy it
      post.destroy(function(err, res) {
        console.log("DESTROY  Persisted: %s | Storage: %s | Type: %s | ID: %s  ->  %s", post.persisted, post.storage.name, post.type, post.id, post);

        // Switch storage
        Post.storage = new FileSystem('file:///tmp/app');

        // Save to file instead
        post.save(function(err, res) {
          console.log("SAVE  Persisted: %s | Storage: %s | Type: %s | ID: %s  ->  %s", post.persisted, post.storage.klass.name, post.type, post.id, post);
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
