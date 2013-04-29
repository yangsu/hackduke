var _ = require('lodash');

var db = require('../db');
var util = require('./util');
var getFormat = util.getFormat;
var defaultHandler = util.defaultHandler;

var locationEndpoint = function(query, req, res, next) {
  var filter = getFormat('Location', req.query.format);
  var options = limitAndSkip(req.query);

  db.Location.find(query || {}, filter, options, defaultHandler(res));
};

exports.index = function(req, res, next) {
  locationEndpoint({}, req, res, next);
};
exports.byId = util.byId('Location');

exports.byBuildingId = function(req, res, next) {
  locationEndpoint({
    school_building_id: +req.params.id
  }, req, res, next);
};

exports.byName = function(req, res, next) {
  locationEndpoint({
    name: req.params.name
  }, req, res, next);
};
