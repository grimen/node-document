process.env.NODE_ENV = 'test';

process.setMaxListeners(0);

require('sugar');
require('colors');

module.exports.longjohn = require('longjohn');
module.exports.longjohn.async_trace_limit = 3;

module.exports.chai = require('chai');
module.exports.chai.Assertion.includeStack = true;

module.exports.flag = require('node-env-flag');

module.exports.assert = module.exports.chai.assert;

module.exports.debug = console.log;
