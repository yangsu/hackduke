var _ = require('lodash');

var db = require('./db');
var config = require('./config');

db.Term.find({}, { course_id: 1 }, { lean: true }, function(err, terms) {
  var uniqIds = _.unique(_.pluck(terms, 'course_id'));

  db.Evaluation.find({}, { course_id: 1 }, { lean: true }, function(err, evals) {
    uniqIds = _.difference(uniqIds, _.pluck(evals, 'course_id'));

    var ts = _.map(uniqIds, function(t) {
      return {
        type: 'evaluation',
        path: config.EVALURL + 'list.php?crse_id=' + t
      };
    });

    db.parallel(ts, 'Evaluation');
  });
});
