var _ = require('lodash');

var db = require('./db');
var utils = require('./utils');

db.Department.find({}, 'path', {}, function (err, departments) {
  var ds = _.map(departments, function(department) {
    return {
      type: 'department',
      path: department.path
    };
  });
  utils.parallel(ds, 'Class');
});
