var _ = require('lodash');

var db = require('../db');
var util = require('./util');
var getFormat = util.getFormat;
var limitAndSkip = util.limitAndSkip;
var defaultHandler = util.defaultHandler;

var DirectoryEndpoint = function(query, req, res, next) {
  var filter = getFormat('Directory', req.query.format);
  var options = limitAndSkip(req.query);

  db.Directory.find(query || {}, filter, options, defaultHandler(res));
};

exports.index = function(req, res, next) {
  DirectoryEndpoint({}, req, res, next);
};

exports.byId = util.byId('Directory');

exports.byNetId = function(req, res, next) {
  DirectoryEndpoint({
    uid: req.params.netid
  }, req, res, next);
};

exports.byPhone = function(req, res, next) {
  // strip all non numeric chars, turn string into char array
  var phone = req.params.phone && req.params.phone.replace(/\D+/g, '').split('');
  // insert 6th space
  phone.splice(6, 0, ' ');
  // insert 3rd space
  phone.splice(3, 0, ' ');
  // insert prefix
  phone.splice(0, 0, '+1 ');
  phone = phone.join('');

  DirectoryEndpoint({
    $or: [{
      telephoneNumber: phone
    }, {
      facsimileTelephoneNumber: phone
    }]
  }, req, res, next);
};

exports.byAffiliation = function(req, res, next) {
  DirectoryEndpoint({
    eduPersonAffiliation: req.params.affiliation
  }, req, res, next);
};

exports.byProgram = function(req, res, next) {
  DirectoryEndpoint({
    duPSAcadCareerDescC1: decodeURIComponent(req.params.program)
  }, req, res, next);
};
exports.byProgramClass = function(req, res, next) {
  DirectoryEndpoint({
    duPSAcadCareerDescC1: decodeURIComponent(req.params.program),
    duPSExpGradTermC1: new RegExp(req.params.class)
  }, req, res, next);
};
exports.byProgramGraduation = function(req, res, next) {
  DirectoryEndpoint({
    duPSAcadCareerDescC1: decodeURIComponent(req.params.program),
    duPSExpGradTermC1: decodeURIComponent(req.params.term)
  }, req, res, next);
};
