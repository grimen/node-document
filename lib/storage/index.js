var fun = require('funargs'),
    url = require('url');

// -----------------------
//  Constructor
// --------------------

// new Storage ();
// new Storage (options);
// new Storage (url);
// new Storage (url, options);
function Storage () {
  var self = this;

  self.klass = self.klass || Storage;

  var args = fun(arguments);

  self.url = args.strings().pop() || self.klass.url || null;
  self.options = args.objects().pop() || self.klass.options || {};

  self.client = null;
  self.ready = false;
  self.authorized = false;
  self.connecting = false;
  self.queue = [];

  var uri = url.parse(self.url || '');

  self.options.server = self.options.server || {};
  self.options.server.protocol = uri.protocol && uri.protocol.replace(':', '');
  self.options.server.username = uri.auth && uri.auth.split(':')[0],
  self.options.server.password = uri.auth && uri.auth.split(':')[1]
  self.options.server.hostname = uri.hostname;
  self.options.server.port = uri.port && parseInt(uri.port, 10);
  self.options.server.db = uri.pathname;

  self.options.client = self.options.client || {};

  self.options = Object.merge(self.klass.defaults.options, self.options, true, false);
  self.options = JSON.parse(JSON.stringify(self.options)); // BUG/FIXME: Sugar.js bug?

  self.events = new Storage.EventEmitter();

  // self.on('error', function() {});

  self.on('connect', function() {
    self.ready = false;
    self.authorized = false;
    self.connecting = true;
  });

  self.on('ready', function(err) {
    if (!err) {
      self.ready = true;
      self.authorized = true;
      self.connecting = false;

      self.commit();
    }
  });

  self.on('command', function(type, args) {
    self.emit(type, args);

    if (!self.ready) {
      self.push(type, args);
    }
  });
}

// -----------------------
//  Class
// --------------------

// .name
Storage.__defineGetter__('name', function() {
  var self = this;
  return self.name;
});

Storage.defaults = {
  url: null,
  options: {}
};

Storage.url = null;
Storage.options = null;

Storage.reset = function() {
  var self = this;
  if (self.defaults) {
    self.url = self.defaults.url;
    self.options = Object.clone(self.defaults.options);
  }
};

Storage.EventEmitter = require('events').EventEmitter;

// -----------------------
//  Instance
// --------------------

// .name
Storage.prototype.__defineGetter__('name', function() {
  var self = this;
  return self.constructor.name;
});

// #push ([key, [options], callback])
// #push ([keys, [options], callback])
// #push ([key, value, [options], callback])
// #push ([keys, values, [options], callback])
Storage.prototype.push = function(operation, args) {
  var self = this;

  args = fun(args);
  args.unshift(operation);

  self.queue = self.queue || [];
  self.queue.push(args);

  self.emit('push', args);
};

// #commit ()
Storage.prototype.commit = function() {
  var self = this, command, operation;

  self.emit('commit', self.queue);

  while (command = self.queue.shift()) {
    operation = command.shift();
    self[operation].apply(self, command);
  }
};

// #command (operation, args, args_length, command)
Storage.prototype.command = function(operation, args, args_length, command) {
  var self = this, options, callback;

  self.emit('command', operation, args);

  args = fun(args)

  var last_args = args.slice(args_length - 2)

  options = Object.extended(last_args.objects()[0] || {});
  callback = last_args.functions()[0] || function(){};

  args = args.slice(0, args_length - 2);
  args.push(options);
  args.push(callback);

  if (!self.ready) {
    self.connect();
    return false;
  }

  try {
    if (!self.authorized) {
      throw new Error('Authorized: false');
    }

    command.apply(self, args);

  } catch (err) {
    self.emit('error', err);
    callback(err);
  }
};

// #_connect ()
Storage.prototype._connect = function(connect) {
   var self = this;

  if (self.ready || self.connecting) {
    return;
  }

  self.emit('connect');

  try {
    connect();

  } catch (err) {
    self.emit('error', err);
  }
};

// #_set ()
Storage.prototype._set = function(args, execute) {
  var self = this;

  self.command('set', args, 4, function(keys, values, options, callback) {
    values = Array.create(values).map(function(k) { return self.pack(k); });
    keys = Array.create(keys).map(function(k) { return self.key(k); });

    if (keys.length !== values.length) {
      throw new Error("Key/Value sizes must match.");
    }

    var key_values = Object.extended({});

    keys.each(function(k, i) {
      key_values[k.key ? k.key : k] = values[i];
    });

    var res = {};

    var next = function(key, error, result, response) {
      res[key] = {error: error, result: result, response: response};

      if (Object.keys(res).length === keys.length) {
        var errors = [], results = [], responses = [];

        keys.each(function(k) {
          if (k.key) {
            k = k.key;
          }
          errors.push(res[k].error);
          results.push(res[k].result);
          responses.push(res[k].response);
        });

        done(errors, results, responses);
      }
    };

    var done = function(errors, results, responses) {
      callback(errors, results, responses);
    };

    execute(key_values, options, done, next);
  });
};

// #_get ()
Storage.prototype._get = function(args, execute) {
  var self = this;

  self.command('get', args, 3, function(keys, options, callback) {
    keys = Array.create(keys).map(function(k) { return self.key(k); });
    keys = keys.map(function(k) { return k.key ? k.key : k; });

    var res = {};

    var next = function(key, error, result, response) {
      res[key] = {error: error, result: result, response: response};

      if (Object.keys(res).length === keys.length) {
        var errors = [], results = [], responses = [];

        keys.each(function(k) {
          if (k.key) {
            k = k.key;
          }
          errors.push(res[k].error);
          results.push(res[k].result);
          responses.push(res[k].response);
        });

        done(errors, results, responses);
      }
    };

    var done = function(errors, results, responses) {
      results = results.map(function(result) {
        if (!result) {
          return null;
        }

        try {
          return self.unpack(result);
        } catch (e) {
          return null;
        }
      });

      callback(errors, results, responses);
    };

    execute(keys, options, done, next);
  });
};

// #_del ()
Storage.prototype._del = function(args, execute) {
  var self = this;

  self.command('del', args, 3, function(keys, options, callback) {
    keys = Array.create(keys).map(function(k) { return self.key(k); });
    keys = keys.map(function(k) { return k.key ? k.key : k; });

    var res = {};

    var next = function(key, error, result, response) {
      res[key] = {error: error, result: result, response: response};

      if (Object.keys(res).length === keys.length) {
        var errors = [], results = [], responses = [];

        keys.each(function(k) {
          if (k.key) {
            k = k.key;
          }
          errors.push(res[k].error);
          results.push(res[k].result);
          responses.push(res[k].response);
        });

        done(errors, results, responses);
      }
    };

    var done = function(errors, results, responses) {
      callback(errors, results, responses);
    };

    execute(keys, options, done, next);
  });
};

// #key (key)
// #key (key)
Storage.prototype.key = function() {
  throw new Error("Not implemented");
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
Storage.prototype.set = function() {
  throw new Error("Not implemented");
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
Storage.prototype.get = function() {
  throw new Error("Not implemented");
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
Storage.prototype.del = function() {
  throw new Error("Not implemented");
};

// #end ()
Storage.prototype.end = function() {};

// #unpack ()
Storage.prototype.unpack = function(value) {
  return value;
};

// #pack ()
Storage.prototype.pack = function(value) {
  return value;
};

// #on (event, listener)
Storage.prototype.on = function() {
  var self = this, result;
  result = self.events.addListener.apply(self, arguments);
  return result;
};

// #off (event, listener)
Storage.prototype.off = function() {
  var self = this, result;
  result = self.events.removeListener.apply(self, arguments);
  return result;
};

// #emit (event, [arg1], [arg2], [...])
Storage.prototype.emit = function() {
  var self = this, result;
  result = self.events.emit.apply(self, arguments);
  return result;
};

// -----------------------
//  Export
// --------------------

module.exports = Storage;
