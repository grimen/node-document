process.env.NODE_ENV = 'test';

require('sugar');
require('colors');

var chai = require('chai'),
    longjohn = require('longjohn');

longjohn.async_trace_limit = 3;

// REVIEW: http://chaijs.com/plugins
chai.Assertion.includeStack = true;

module.exports.flag = function(value, default_value) {
  if (typeof value === 'undefined') {
    return (default_value === undefined) ? false : default_value;
  } else {
    return (/^1|true$/i).test('' + value); // ...to avoid the boolean/truthy ghetto.
  }
};

module.exports.assert = chai.assert;

module.exports.debug = console.log;
