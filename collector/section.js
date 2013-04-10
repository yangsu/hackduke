var _ = require('lodash');

var db = require('../db');
var utils = require('./utils');
var collector = require('./collector');

db.Section.find({
  info: { $exists: false }
}, { path: 1 }, { }, function(err, terms) {
  var ts = _.flatten(_.map(terms, function(t) {
    return {
      type: 'section',
      path: t.path
    };
  }));

  collector.parallel(ts, 'Section');
});
