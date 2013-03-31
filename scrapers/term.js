var _ = require('lodash');

var db = require('./db');
var utils = require('./utils');

db.Term.find({
  term_id: { $exists: false },
  title: /2013/
}, { path: 1 }, {}, function(err, terms) {
  var ts = _.flatten(_.map(terms, function(t) {
    return {
      type: 'term',
      path: t.path
    };
  }));

  db.parallel(ts, 'Section');
});
