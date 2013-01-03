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

        var error = null, body = '';

        res.on('data', function(data){
          body += data;
        });

        res.on('error', function(err){
          error = err;
        });

        res.on('end', function(err){
          callback(err, body);
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

        var error = null, body = '';

        res.on('data', function(data){
          body += data;
        });

        res.on('error', function(err){
          error = err;
        });

        res.on('end', function(){
          callback(error, !error);
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

        var error = null, body = '';

        res.on('data', function(data){
          body += data;
        });

        res.on('error', function(err){
          error = err;
        });

        res.on('end', function(){
          callback(error, !error);
        });
      })
      .end();
  },

  exists: function(db, type, id, callback) {
    var key = '/' + [type, id].join('/') + '.json';

    var client = require('knox').createClient({key: auth.key, secret: auth.secret, bucket: db});

    client
      .get(key)
      .on('response', function(res){
        res.setEncoding('utf8');

        var error = null, body = '';

        res.on('data', function(data){
          body += data;
        });

        res.on('error', function(err){
          error = err;
        });

        res.on('end', function(){
          callback(error, (res.statusCode < 400));
        });
      })
      .end();
  }
};
