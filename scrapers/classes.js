var _ = require('lodash');

var db = require('./db');

db.Department.find({}, 'path', {}, function (err, departments) {
  var ds = _.map(departments, function(department) {
    return {
      type: 'department',
      path: department.path
    };
  });
  db.parallel(ds, 'Class');
});
