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
  }

};

module.exports = Helpers;
