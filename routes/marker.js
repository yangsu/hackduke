var _ = require('lodash');

var db = require('../db');
var util = require('./util');
var getFormat = util.getFormat;
var limitAndSkip = util.limitAndSkip;
var defaultHandler = util.defaultHandler;

var markerEndpoint = function(query, req, res, next) {
  var filter = getFormat('Marker', req.query.format);
  var options = limitAndSkip(req.query);

  db.Marker.find(query || {}, filter, options, defaultHandler(res));
};

exports.index = function(req, res, next) {
  markerEndpoint({}, req, res, next);
};

exports.byId = util.byId('Marker');

exports.byMarkerId = function(req, res, next) {
  markerEndpoint({
    mrkId: +req.params.id
  }, req, res, next);
};

exports.byName = function(req, res, next) {
  markerEndpoint({
    markerName: req.params.name
  }, req, res, next);
};

exports.byCategory = function(req, res, next) {
  markerEndpoint({
    categoryName: req.params.category
  }, req, res, next);
};
