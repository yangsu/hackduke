var _ = require('lodash');
var async = require('async');

var db = require('../scrapers/db');

var baseOptions = {
  lean: true
};

exports.departments = function(req, res, next) {
  db.Department.find({}, {
    code: 1,
    title: 1
  }, baseOptions, function(err, data) {
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
  }, baseOptions, function(err, data) {
    if (err) {
      return res.send(err);
    } else {
      return res.json(_.map(data, function(d) {
        return d.code;
      }));
    }
  });
};

var transformers = require('./transformers');

exports.class = function(req, res, next) {
  var p = req.params;
  var q = req.query;

  var query = {
    department: p.department,
    number: p.number
  };

  var filter = transformers.classFilters[q.level || 'basic'] || classFilters.basic;

  async.parallel({
    class: function(cb) {
      db.Class.findOne(query, filter, baseOptions, cb);
    },
    terms: function(cb) {
      if (query.department && query.number) {
        db.Term.find(query, {}, baseOptions, cb);
      } else {
        cb(null, []);
      }
    }
  }, function(err, data) {
    if (err) {
      return res.send(err);
    } else {
      return res.json(data);
    }
  });
};

exports.classes = function(req, res, next) {
  var p = req.params;
  var q = req.query;

  var query = {};

  if (p.department) _.extend(query, { department: p.department });

  var filter = transformers.classFilters[q.level || 'basic'] || classFilters.basic;

  var options = _.extend({}, baseOptions, {
    limit: q.limit || 100,
    skip: q.skip || 0
  });

  db.Class.find(query, filter, options, function(err, data) {
    if (err) {
      return res.send(err);
    } else {
      return res.json(data);
    }
  });
};
