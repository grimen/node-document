process.env.NODE_ENV = 'test';

var chai = require('chai'),
    longjohn = require('longjohn'),
    flag = require('../lib/util/flag');

longjohn.async_trace_limit = 3;

// REVIEW: http://chaijs.com/plugins
chai.Assertion.includeStack = true;

var Helpers = {
  assert: chai.assert,
  debug: console.log,
  flag: flag
};

module.exports = Helpers;
