var _ = require('lodash');

var db = require('../db');
var utils = require('./utils');
var collector = require('./collector');

db.Term.find({
  title: /2012/
}, { path: 1 }, {}, function(err, terms) {
  var ts = _.flatten(_.map(terms, function(t) {
    return {
      type: 'term',
      path: t.path
    };
  }));

  collector.parallel(ts, 'Section');
});
