var _ = require('lodash');

var db = require('./db');
var utils = require('./utils');

db.Class.find({
  longtitle: { $exists: false }
}, 'path', {}, function (err, classes) {
  var cs = _.map(classes, function(c) {
    return {
      type: 'class',
      path: c.path
    };
  });
  db.parallel(cs, 'Class');
});
