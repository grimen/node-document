
// NOTE: My personal evil experiments with synchronous validation
function validate (data, schema, callback){
  require('amanda')('json').validate(data, schema, {}, callback || function(err) { })
}

validate.sync = function(data, schema) {
  try {
    var call, res;

    this(data, schema, function(err) {
      call = true;
      res = err;
    });

    var timeout = Date.now() + 10

    while (!call) {
      // wait >:)
      if (Date.now() < timeout) {
        throw new Error("timeout");
      }
    }

    return res;

  } catch (err) {
    // timeout >:)

    // return undefined;
  }
}

var result = validate.sync({a: '12'}, {type: 'object', properties: {a: {type: 'string', length: 3}}});

console.log("return", result);
