
var memory = require('../../../lib/storage/memory');

module.exports = {
  get: function(db, type, id, callback) {
    var key = [db, type, id].join('/');

    var client = new memory.Client();

    client.get(key, function(err, res) {
      callback(err, res);
    });
  },

  set: function(db, type, id, data, callback) {
    var key = [db, type, id].join('/');

    var client = new memory.Client();

    client.set(key, data, function(err, res) {
      callback(err, res);
    });
  },

  del: function(db, type, id, callback) {
    var key = [db, type, id].join('/');

    var client = new memory.Client();

    client.del(key, function(err, res) {
      callback(err, res);
    });
  }
};
