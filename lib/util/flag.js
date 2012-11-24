
module.exports = function(value, default_value) {
  if (typeof value === 'undefined') {
    return (default_value === undefined) ? false : default_value;
  } else {
    return (/^1|true$/i).test('' + value); // ...to avoid the boolean/truthy ghetto.
  }
};
