
var memcached = require('memcached');

module.exports = {
  get: function(db, type, id, callback) {
    var key = [db, type, id].join('/');

    var client = new memcached('localhost:11211');

    client.get(key, function(err, res) {
      callback(err, res);
    });
  },

  set: function(db, type, id, data, callback) {
    var key = [db, type, id].join('/');

    var client = new memcached('localhost:11211');

    client.set(key, data, 0, function(err, res) {
      callback(err, res);
    });
  },

  del: function(db, type, id, callback) {
    var key = [db, type, id].join('/');

    var client = new memcached('localhost:11211');

    client.del(key, function(err, res) {
      callback(err, res);
    });
  }
};
