
// var mongodb = require('mongodb');
// var require('mongodb').Db = mongodb.Db;
// var require('mongodb').Server = mongodb.Server;

module.exports = {
  get: function(type, id, callback) {
    var client = new require('mongodb').Db('default_test', new require('mongodb').Server('localhost', 27017), {safe:false});
    client.open(function(err, db) {
      db.collection(type, function(err, collection) {
        collection.findOne({_id:id}, function(err, doc) {
          db.close();
          callback(err, doc);
        });
      });
    });
  },
  set: function(type, id, data, callback) {
    var client = new require('mongodb').Db('default_test', new require('mongodb').Server('localhost', 27017), {safe:false});
    client.open(function(err, db) {
      db.collection(type, function(err, collection) {
        data._id = id;
        collection.update({_id:id}, data, {upsert:true, safe:true}, function(err, count) {
          db.close();
          callback(err, count);
        });
      });
    });
  },
  del: function(type, id, callback) {
    var client = new require('mongodb').Db('default_test', new require('mongodb').Server('localhost', 27017), {safe:false});
    client.open(function(err, db) {
      db.collection(type, function(err, collection) {
        collection.remove({_id:id}, {safe:true}, function(err, doc) {
          db.close();
          callback(err, doc);
        });
      });
    });
  }
};
