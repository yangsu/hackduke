var _ = require('lodash');

var db = require('../db');
var util = require('./util');

exports.index = function(req, res, next) {
  var options = _.extend(util.limitAndSkip(req.query), {
    sort: { code: 1 }
  });
  db.Department.find({}, {
    code: 1,
    title: 1
  }, options, util.defaultHandler(res));
};

exports.byId = util.byId('Department');
