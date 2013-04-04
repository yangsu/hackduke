var _ = require('lodash');
var async = require('async');

var db = require('../scrapers/db');

var baseOptions = {
  lean: true
};

var genOptions = function(opt) {
  return _.extend({}, baseOptions, opt);
};

var handlerGenerator = function(res, f) {
  return function(err, data) {
    if (err) {
      return res.send(400);
      // return res.send(err);
    } else {
      return res.json(f(data));
    }
  };
};

var defaultHandler = function(res) {
  return handlerGenerator(res, _.identity);
};


var transformers = require('./transformers');

var limitAndSkip = function(query) {
  return genOptions({
    limit: query.limit || 100,
    skip: query.skip || 0
  });
};

// =============================================================================
// list.json
// =============================================================================

var distinct = function(collection, field) {
  return function(req, res, next) {
    db[collection].distinct(field, {}, defaultHandler(res));
  };
};

var listEndpoint = function(collection, queryfields, filterField) {
  return function(req, res, next) {
    var query = _.pick.apply(_, [req.params].concat(queryfields));
    var filter = {};
    filter[filterField] = 1;

    db[collection].find(query, filter, genOptions({
      sort: filter
    }), handlerGenerator(res, function(data) {
      return _.pluck(data, filterField);
    }));
  };
};

exports.listDepartment = distinct('Department', 'code');
exports.listTerm = distinct('Term', 'title');

exports.listclass = listEndpoint('Class', ['department'], 'number');

exports.listterm = listEndpoint('Term', ['department', 'number'], 'title');

exports.listsection = listEndpoint('Section', ['department', 'number', 'title'], 'section_id');

// =============================================================================
// ById
// =============================================================================

var getFormat = function(collection, format) {
  var filters = transformers[collection];
  return filters[format] || filters.basic || {};
};

var byId = function(collection) {
  return function(req, res, next) {
    var filter = getFormat(collection, req.query.format);
    db[collection].findById(req.params.id, filter, defaultHandler(res));
  };
};

// =============================================================================
// department.json
// =============================================================================

exports.departments = function(req, res, next) {
  db.Department.find({}, {
    code: 1,
    title: 1
  }, genOptions({
    sort: { code: 1 }
  }), defaultHandler(res));
};

exports.departmentById = byId('Department');

// =============================================================================
// class.json
// =============================================================================

exports.class = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number');
  var filter = getFormat('Class', req.query.format);
  db.Class.findOne(query, filter, baseOptions, defaultHandler(res));
};

exports.classById = byId('Class');

exports.termById = byId('Term');

exports.sectionById = byId('Section');

exports.classold = function(req, res, next) {
  var p = req.params;
  var q = req.query;

  var query = {
    department: p.department,
    number: p.number
  };

  var filter = classFormat(req.query);

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
  var query = _.pick(req.params, 'department', 'title');
  var filter = classFormat(req.query);
  var options = limitAndSkip(req.query);
  _.extend(options, {
    sort: {
      department: 1,
      number: 1
    }
  });

  db.Class.find(query, filter, options, defaultHandler(res));
};

// =============================================================================
// evaluation.json
// =============================================================================

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
