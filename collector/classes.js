var _ = require('lodash');

var db = require('../db');
var collector = require('./collector');

db.Department.find({}, 'path', {}, function(err, departments) {
  var ds = _.map(departments, function(department) {
    return {
      type: 'department',
      path: department.path
    };
  });
  collector.parallel(ds, 'Class');
});
