
var elasticsearch = require('elastical');

module.exports = {
  get: function(db, type, id, callback) {
    var client = new elasticsearch.Client('localhost', {port: 9200});

    client.get(db, id, {type: type}, function(err, res) {
      callback(err, res);
    });
  },

  set: function(db, type, id, data, callback) {
    var client = new elasticsearch.Client('localhost', {port: 9200});

    client.index(db, type, data, {id: id, create: false}, function(err, res) {
      callback(err, res);
    });
  },

  del: function(db, type, id, callback) {
    var client = new elasticsearch.Client('localhost', {port: 9200});

    client.delete(db, type, id, {}, function(err, res) {
      callback(err, res);
    });
  },

  exists: function(db, type, id, callback) {
    var client = new elasticsearch.Client('localhost', {port: 9200});

    // client.count(db, type, {id: id}, function(err, res) {
    //   callback(err, res);
    // });

    client.get(self.options.server.db, resource.id, {type: resource.type, ignoreMissing: true}, function(err, data, res) {
      callback(err, res);
    });
  }
};
