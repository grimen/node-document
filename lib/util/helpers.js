require('sugar');

var Helpers = {

  assert: require('assert'),
  inspect: require('util').inspect,

  uuid: function() {
    return require('node-uuid').v4();
  },

  md5: function(data) {
    return require('crypto').createHash('md5').update(data).digest('hex');
  },

  diff: function(a, b) {
    return require('patcher').computePatch(a, b) || {};
  },

  args: function(_arguments) {
    return Array.prototype.slice.call(_arguments, 0, _arguments.length);
  }

};

module.exports = Helpers;