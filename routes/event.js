var _ = require('lodash');

var db = require('../db');
var util = require('./util');
var baseOptions = util.baseOptions;
var distinct = util.distinct;
var getFormat = util.getFormat;
var limitAndSkip = util.limitAndSkip;
var handlerGenerator = util.handlerGenerator;
var wrapError = util.wrapError;

var timeInEDT = function(d) {
  d = d || new Date;
  var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * -4));
};

var fixCategories = function(doc) {
  var cats = doc.categories && doc.categories.category;
  doc.categories = _.compact(_.pluck(cats, 'value'));
  return doc;
};

var eventEndpoint = function(query, req, res, next) {
  var filter = getFormat('Event', req.query.format);
  var options = _.extend(limitAndSkip(req.query), {
    'start.date': 1
  });

  if (req.query.location) {
    var locFilter = getFormat('Marker', req.query.format);
    db.Event.find(query || {}, filter, options)
      .populate({
          path: 'location.marker',
          select: locFilter
        })
      .exec(handlerGenerator(res, function(docs) {
          return _.map(docs, fixCategories);
        }));
  } else {
    db.Event.find(query || {}, filter, options, handlerGenerator(res, function(docs) {
      return _.map(docs, fixCategories);
    }));
  }
};

exports.index = function(req, res, next) {
  var query = {};
  var q = req.query;

  if (q.category) q['categories.category.value'] = q.category;
  if (q.end) q['end.date'] = { $lte: timeInEDT(new Date(q.end)) };
  if (q.host) q['creator'] = q.host;
  if (q.start) q['start.date'] = { $gte: timeInEDT(new Date(q.start)) };
  if (q.venue) q['location.address'] = q.venue;

  eventEndpoint(query, req, res, next);
};

exports.byId = util.byId('Event');

exports.byCategory = function(req, res, next) {
  eventEndpoint({
    'categories.category.value': decodeURIComponent(req.params[0])
  }, req, res, next);
};

exports.byVenue = function(req, res, next) {
  eventEndpoint({
    'location.address': req.params.location
  }, req, res, next);
};

exports.byHost = function(req, res, next) {
  eventEndpoint({
    'creator': req.params.host
  }, req, res, next);
};

exports.byDate = function(req, res, next) {
  var query = {
    'start.year': req.params.year,
    'start.month': req.params.month,
    'start.day': req.params.day
  };
  eventEndpoint(query, req, res, next);
};

exports.byMonth = function(req, res, next) {
  var query = {
    'start.year': req.params.year,
    'start.month': req.params.month
  };
  eventEndpoint(query, req, res, next);
};

exports.today = function(req, res, next) {
  var d = timeInEDT();

  eventEndpoint({
    'start.year': '' + d.getFullYear(),
    'start.month': '' + (d.getMonth() + 1),
    'start.day': '' + d.getDate()
  }, req, res, next);
};

var week = 1000 * 3600 * 24 * 7;

exports.thisWeek = function(req, res, next) {
  var current = timeInEDT();
  var d = new Date(current.getTime() + week);

  eventEndpoint({
    'start.date': { $gte: current },
    'end.date': { $lte: d }
  }, req, res, next);
};
