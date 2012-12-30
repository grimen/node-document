
module.exports = {
  get: function(db, type, id, callback) {
    var key = [db, type, id].join('/');

    var client = require('redis').createClient(6379, 'localhost');

    client.get(key, function(err, res) {
      callback(err, res);
    });
  },

  set: function(db, type, id, data, callback) {
    var key = [db, type, id].join('/');

    var client = require('redis').createClient(6379, 'localhost');

    client.set(key, data, function(err, res) {
      callback(err, res);
    });
  },

  del: function(db, type, id, callback) {
    var key = [db, type, id].join('/');

    var client = require('redis').createClient(6379, 'localhost');

    client.del(key, function(err, res) {
      callback(err, res);
    });
  }
};
