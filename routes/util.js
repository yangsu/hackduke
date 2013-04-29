var _ = require('lodash');
var async = require('async');

var db = require('../db');
var filters = require('./filters');

var baseOptions = function() {
  return {
    lean: true
  };
};

var genOptions = function(opt) {
  return _.extend({}, baseOptions(), opt);
};

var wrapError = function(res, cb) {
  return function(err, data) {
    if (err) {
      // return res.send(400);
      res.send(err);
    } else {
      cb(data);
    }
  }
};

var handlerGenerator = function(res, f) {
  return wrapError(res, function(data) {
    return res.json(f(data || []));
  });
};

var defaultHandler = function(res) {
  return handlerGenerator(res, _.identity);
};

var limitAndSkip = function(query) {
  return genOptions({
    limit: query.limit || 100,
    skip: query.skip || 0
  });
};

var includeFilter = function(filter, key) {
  if (filter[key] === 0) {
    return _.omit(filter, key);
  } else {
    filter[key] = 1;
    return filter;
  }
};

var getFormat = function(collection, format) {
  var f = filters[collection];
  return f[format] || f.basic || {};
};

var distinct = function(collection, field) {
  return function(req, res, next) {
    db[collection].distinct(field).exec(defaultHandler(res));
  };
};

var listEndpoint = function(collection, queryfields, filterField, f) {
  return function(req, res, next) {
    var query = _.pick.apply(_, [req.params].concat(queryfields));

    f = f || function(data) {
      return _.pluck(data, filterField);
    };

    db[collection].find(query, filterField, genOptions({
      sort: filterField
    }), handlerGenerator(res, f));
  };
};

var byId = function(collection) {
  return function(req, res, next) {
    var filter = getFormat(collection, req.query.format);
    db[collection].findById(req.params.id, filter, defaultHandler(res));
  };
};

exports.baseOptions = baseOptions;
exports.byId = byId;
exports.defaultHandler = defaultHandler;
exports.distinct = distinct;
exports.genOptions = genOptions;
exports.getFormat = getFormat;
exports.handlerGenerator = handlerGenerator;
exports.includeFilter = includeFilter;
exports.limitAndSkip = limitAndSkip;
exports.listEndpoint = listEndpoint;
exports.wrapError = wrapError;
