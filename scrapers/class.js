var _ = require('lodash');

var db = require('./db');

db.Class.find({}, 'path', {}, function (err, classes) {
  var cs = _.map(classes, function(c) {
    return {
      type: 'class',
      path: c.path
    };
  });
  db.parallel(cs, 'Class');
});
