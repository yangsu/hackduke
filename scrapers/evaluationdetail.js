var _ = require('lodash');

var db = require('./db');
var config = require('./config');

db.Evaluation.find({
  details: { $exists: false }
}, { detailPath: 1 }, { lean: true }, function(err, terms) {
  var paths = _.pluck(terms, 'detailPath');
  var ts = _.map(paths, function(p) {
    return {
      type: 'evaluationdetail',
      path: config.EVALURL + p
    };
  });

  db.parallel(ts, 'Evaluation');
});
