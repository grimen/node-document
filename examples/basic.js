
var Document = require('../'); // i.e. 'node-document'

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

          process.exit();
        });
      });
    });
  });
});
