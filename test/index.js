var helper = require('./helper'),
    assert = helper.assert,
    debug = helper.debug;

var Document = require('../');

var Storage = Document.DefaultStorage;
var Validator = Document.DefaultValidator;
var Differ = Document.DefaultDiffer;

var Post;
var Article;

var post;
var posts;

var article;

// -----------------------
//  Test
// --------------------

module.exports = [
  require('./document/'),
  require('./document/model'),
  require('./document/model.prototype')
];
