var _ = require('lodash');

var db = require('../db');
var utils = require('./utils');
var collector = require('./collector');

db.Class.find({
  sectionsPath: { $exists: true, $ne: null }
}, 'sectionsPath', {}, function(err, classes) {
  var cs = _.map(classes, function(c) {
    return {
      type: 'terms',
      path: c.get('sectionsPath')
    };
  });

  collector.parallel(cs, 'Term');
});
