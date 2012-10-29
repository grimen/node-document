
module.exports = {
  get: function(db, type, id, callback) {
    db = db.replace('.', '_');

    var client = new require('mongodb').Db(db, new require('mongodb').Server('localhost', 27017), {safe: false});

    client.open(function(err, db) {
      db.collection(type, function(err, collection) {
        collection.findOne({_id: id}, function(err, doc) {
          db.close();
          callback(err, doc);
        });
      });
    });
  },

  set: function(db, type, id, data, callback) {
    db = db.replace('.', '_');

    var client = new require('mongodb').Db(db, new require('mongodb').Server('localhost', 27017), {safe: false});

    client.open(function(err, db) {
      db.collection(type, function(err, collection) {
        data._id = id;
        collection.update({_id:id}, data, {upsert: true, safe: true}, function(err, count) {
          db.close();
          callback(err, count);
        });
      });
    });
  },

  del: function(db, type, id, callback) {
    db = db.replace('.', '_');

    var client = new require('mongodb').Db(db, new require('mongodb').Server('localhost', 27017), {safe: false});

    client.open(function(err, db) {
      db.collection(type, function(err, collection) {
        collection.remove({_id:id}, {safe: true}, function(err, doc) {
          db.close();
          callback(err, doc);
        });
      });
    });
  }
};
