var _ = require('lodash');

var db = require('../db');
var utils = require('./utils');
var collector = require('./collector');


db.Class.find({
  longtitle: { $exists: false }
}, 'path', {}, function(err, classes) {
  var cs = _.map(classes, function(c) {
    return {
      type: 'class',
      path: c.path
    };
  });
  collector.parallel(cs, 'Class');
});
