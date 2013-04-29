var _ = require('lodash');

var db = require('../db');
var util = require('./util');
var baseOptions = util.baseOptions;
var byId = util.byId;
var defaultHandler = util.defaultHandler;
var getFormat = util.getFormat;
var handlerGenerator = util.handlerGenerator;
var includeFilter = util.includeFilter;
var limitAndSkip = util.limitAndSkip;
var wrapError = util.wrapError;

exports.index = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number');
  var filter = getFormat('Class', req.query.format);
  db.Class.findOne(query, filter, baseOptions(), defaultHandler(res));
};

exports.byId = byId('Class');
exports.evaluationById = byId('Evaluation');
exports.sectionById = byId('Section');
exports.termById = byId('Term');

exports.term = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number');
  var filter = getFormat('Term', req.query.format);
  _.extend(filter, {
    department: 0,
    number: 0,
    course_id: 0
  });
  db.Term
    .find(query, filter, baseOptions())
    .exec(defaultHandler(res));
};

exports.section = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number', 'title');
  var filter = getFormat('Section', req.query.format);
  db.Section
    .find(query, filter, baseOptions())
    .exec(handlerGenerator(res, function(docs) {
        var response = _.map(docs, function(doc) {
          return _.omit(
              doc,
              'department',
              'number',
              'course_id',
              'longtitle',
              'title',
              'term_id'
          );
        });
        return response;
      }));
};

exports.byTerm = function(req, res, next) {
  var query = _.pick(req.params, 'title', 'department');
  var filter = getFormat('Class', req.query.format);
  var options = limitAndSkip(req.query);

  db.Term
    .find(query, { class: 1 }, options)
    .populate({
        path: 'class',
        select: filter
      })
    .exec(handlerGenerator(res, function(docs) {
        return _.pluck(docs, 'class');
      }));
};

exports.history = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number');

  var filter = getFormat('Class', req.query.format);
  filter = includeFilter(filter, 'terms');

  var termFilter = getFormat('Term', req.query.format);
  termFilter = includeFilter(termFilter, 'sections');

  var sectionFilter = getFormat('Section', req.query.format);

  db.Class
    .find(query, filter, baseOptions())
    .populate({
        path: 'terms',
        select: termFilter
      })
    .exec(wrapError(res, function(docs) {
        var opts = {
          path: 'sections',
          select: sectionFilter,
          model: 'Section'
        };
        db.Term.populate(_.pluck(docs, 'terms'), opts, handlerGenerator(res, function(d) {
          return docs;
        }));
      }));
};

exports.historyById = function(req, res, next) {
  var filter = getFormat('Class', req.query.format);
  filter = includeFilter(filter, 'terms');

  var termFilter = getFormat('Term', req.query.format);
  termFilter = includeFilter(termFilter, 'sections');

  var sectionFilter = getFormat('Section', req.query.format);

  db.Class
    .findById(req.params.id, filter, baseOptions())
    .populate({
        path: 'terms',
        select: termFilter
      })
    .exec(wrapError(res, function(docs) {
        var opts = {
          path: 'sections',
          select: sectionFilter
        };
        db.Term.populate(docs.terms, opts, handlerGenerator(res, function(d) {
          return docs;
        }));
      }));
};

exports.classes = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'title');
  var filter = getFormat('Class', req.query.format);
  var options = limitAndSkip(req.query);
  _.extend(options, {
    sort: {
      department: 1,
      number: 1
    }
  });

  db.Class.find(query, filter, options, defaultHandler(res));
};

exports.evaluation = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number');

  var filter = getFormat('Section', req.query.format);
  var evalfilter = getFormat('Evaluation', req.query.format);

  db.Section.find(query, filter, baseOptions(), wrapError(res, function(d) {
    var course_id = _.unique(_.pluck(d, 'course_id'))[0];

    db.Evaluation.find({
      course_id: course_id,
      details: { $exists: true }
    }, evalfilter, baseOptions(), handlerGenerator(res, function(data) {
      if (_.isArray(data) && req.query.format == 'detailed') {
        data = _.map(data, function(d) {
          var details = d.details;
          _.each(details, function(v, k) {
            details[k] = _.filter(v.ratings, function(r) {
              return r.question == 'Mean' || r.question == 'Median';
            });
          });
          return d;
        });
      }
      return data;
    }));
  }));
};
