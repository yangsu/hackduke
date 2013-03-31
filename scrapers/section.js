var _ = require('lodash');

var db = require('./db');
var utils = require('./utils');

db.Section.find({
  info: { $exists: false }
}, { path: 1 }, { }, function(err, terms) {
  var ts = _.flatten(_.map(terms, function(t) {
    return {
      type: 'section',
      path: t.path
    };
  }));

  db.parallel(ts, 'Section');
});
