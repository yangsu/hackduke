var _ = require('lodash');

var db = require('../scrapers/db');

function getDepartments(req, res, next) {
  db.Department.find({}, {
    code: 1,
    title: 1
  }, {}, function(err, data) {
    if (err) {
      return res.send(err);
    } else {
      return res.json(_.map(data, function(d) {
        return _.pick(d, 'code', 'title');
      }));
    }
  });
}

function getDepartmentList(req, res, next) {
  db.Department.find({}, {
    code: 1
  }, {}, function(err, data) {
    if (err) {
      return res.send(err);
    } else {
      return res.json(_.map(data, function(d) {
        return d.code;
      }));
    }
  });
}

module.exports = {
  departments: getDepartments,
  departmentlist: getDepartmentList
};
