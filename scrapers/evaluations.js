var _ = require('lodash');

var db = require('./db');
var config = require('./config');

db.Term.find({
  title: /2013/
}, { course_id: 1 }, { lean: true }, function(err, terms) {
  var ts = _.map(terms, function(t) {
    return {
      type: 'evaluation',
      path: config.EVALURL + 'list.php?crse_id=' + t.course_id
    };
  });

  db.parallel(ts, 'Evaluation');
});
