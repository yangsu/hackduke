var _ = require('lodash');
var async = require('async');

var db = require('../scrapers/db');

var baseOptions = {
  lean: true
};

var handlerGenerator = function(res, f) {
  return function(err, data) {
    if (err) {
      return res.send(err);
    } else {
      return f(data);
    }
  };
};

var defaultHandler = function(res) {
  return handlerGenerator(res, function(data) {
    return res.json(data);
  });
};

exports.departments = function(req, res, next) {
  db.Department.find({}, {
    code: 1,
    title: 1
  }, baseOptions, defaultHandler(res));
};

exports.departmentById = function(req, res, next) {
  db.Department.findById(req.params.id, {}, baseOptions, defaultHandler(res));
};

exports.departmentlist = function(req, res, next) {
  db.Department.find({}, {
    code: 1
  }, baseOptions, handlerGenerator(res, function(data) {
    return _.map(data, function(d) {
      return d.code;
    });
  }));
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
    },
    sections: function(cb) {
      if (query.department && query.number) {
        db.Section.find(query, {}, baseOptions, cb);
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

exports.evaluation = function(req, res, next) {
  var p = req.params;

  var query = {
    department: p.department,
    number: p.number
  };

  var filter = transformers.termFilter;

  db.Section.find(query, filter, baseOptions, function(err, data) {
    if (err) {
      res.send(err);
    } else {
      data = _.map(data, function(d) {
        return _.omit(d, 'department', 'number', 'longtitle');
      });
      var course_id = _.unique(_.pluck(data, 'course_id'))[0];

      db.Evaluation.find({
        course_id: course_id,
        details: { $exists: true }
      }, transformers.evaluationFilter, baseOptions, function(err, evaluation) {
        if (err) {
          res.send(err);
        } else {
          res.json(evaluation);
        }
      });
    }
  });
};
