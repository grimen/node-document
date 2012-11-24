process.env.NODE_ENV = 'test';

var chai = require('chai'),
    longjohn = require('longjohn');

longjohn.async_trace_limit = 3;

// REVIEW: http://chaijs.com/plugins
chai.Assertion.includeStack = true;

var Helpers = {
  assert: chai.assert,
  debug: console.log
};

module.exports = Helpers;
