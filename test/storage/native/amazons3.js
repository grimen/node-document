var uri = require('url').parse('' + process.env.AMAZON_S3_URL);
var auth = {
  key: (uri.auth || '').split(':')[0],
  secret: (uri.auth || '').split(':')[1]
};

module.exports = {
  get: function(db, type, id, callback) {
    var key = '/' + [type, id].join('/') + '.json';

    var client = require('knox').createClient({key: auth.key, secret: auth.secret, bucket: db});

    client
      .get(key)
      .on('response', function(res){
        res.setEncoding('utf8');

        res.on('data', function(data){
          callback(null, data);
        });

        res.on('error', function(err){
          callback(err);
        });
      })
      .end();
  },

  set: function(db, type, id, data, callback) {
    var key = '/' + [type, id].join('/') + '.json';

    var client = require('knox').createClient({key: auth.key, secret: auth.secret, bucket: db});

    client
      .put(key, {'Content-Length': data.length, 'Content-Type': 'application/json'})
      .on('response', function(res){
        res.setEncoding('utf8');

        // res.on('data', function(data){
        //   callback(null, data);
        // });

        res.on('error', function(err){
          callback(err);
        });

        res.on('end', function(){
          callback(null, true);
        });
      })
      .end(data, 'utf8');
  },

  del: function(db, type, id, callback) {
    var key = '/' + [type, id].join('/') + '.json';

    var client = require('knox').createClient({key: auth.key, secret: auth.secret, bucket: db});

    client
      .del(key)
      .on('response', function(res){
        res.setEncoding('utf8');

        // res.on('data', function(data){
        //   callback(null, data);
        // });

        res.on('error', function(err){
          callback(err);
        });

        res.on('end', function(){
          callback(null, true);
        });
      })
      .end();
  }
};
