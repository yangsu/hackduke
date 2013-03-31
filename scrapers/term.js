var _ = require('lodash');

var db = require('./db');
var utils = require('./utils');

db.Class.find({
  terms: { $exists: true, $ne: null }
}, 'terms', {}, function (err, terms) {
  var ts = _.flatten(_.map(terms, function(t) {
    var mostRecent = _.values(t.get('terms'))[0];
    return {
      type: 'term',
      path: mostRecent.path
    }
  }));

  db.parallel(ts, 'Class');
});
