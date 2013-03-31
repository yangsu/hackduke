var _ = require('lodash');

var db = require('./db');
var utils = require('./utils');

db.Class.find({
  sectionsPath: { $exists: true, $ne: null }
}, 'sectionsPath', {}, function (err, classes) {
  var cs = _.map(classes, function(c) {
    return {
      type: 'terms',
      path: c.get('sectionsPath')
    };
  });

  var chunks = utils.toChunks(cs, 25);
  var chunkIndex = 0;
  var processChunk = function() {
    if (chunkIndex < chunks.length) {
      db.parallel(chunks[chunkIndex++], 'Class', function(err, data) {
        if (err) {
          console.log('ERROR', err);
        }
        process.nextTick(processChunk);
      });
    } else {
      process.exit(0);
    }
  };
  processChunk();
});
