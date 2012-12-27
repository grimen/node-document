# NODE-DOCUMENT [![Build Status](https://secure.travis-ci.org/grimen/node-document.png)](http://travis-ci.org/grimen/node-document)

*Many document stores, Y U NO interface?*

![](http://cl.ly/image/3e0s0X000K1m/node-document-logotype.png)

Work in progress; see **[TODO](https://github.com/grimen/node-document/blob/master/TODO)**.


## What it is

*TODO*


## Features

*TODO*


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


## License

Released under the MIT license.

Copyright (c) [Jonas Grimfelt](http://github.com/grimen)
