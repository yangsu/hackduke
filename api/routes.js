var _ = require('lodash');

var db = require('../scrapers/db');

exports.departments = function(req, res, next) {
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
};

exports.departmentlist = function(req, res, next) {
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
};

var basic = {
  department: 1,
  number: 1,
  title: 1
};

var detailed = _.extend({}, basic, {
  description: 1,
  longtitle: 1,
  'enrollment-requirements': 1
});

var classFilters = {
  basic: basic,
  detailed: detailed,
  raw: {}
};

exports.class = function(req, res, next) {
  var p = req.params;
  var q = req.query;

  var query = {};

  if (p.department) _.extend(query, { department: p.department });
  if (p.number) _.extend(query, { number: p.number });

  var filter = classFilters[q.level || 'basic'] || classFilters.basic;

  var options = {
    limit: q.limit || 100,
    skip: q.skip || 0
  };

  db.Class.find(query, filter, options, function(err, data) {
    if (err) {
      return res.send(err);
    } else {
      return res.json(data);
    }
  });
};
