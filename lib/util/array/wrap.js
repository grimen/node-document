require('sugar');

module.exports = function(value) {
  return Object.isArray(value) ? value : [value];
};
