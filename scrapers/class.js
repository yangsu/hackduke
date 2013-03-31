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

  var chunks = utils.toChunks(cs, 50);
  var chunkIndex = 0;
  var processChunk = function() {
    if (chunkIndex < chunks.length) {
      db.parallel(chunks[chunkIndex++], 'Class', function(err, data) {
        if (err) {
          console.log('ERROR', err);
        } else {
          process.nextTick(processChunk);
        }
      });
    } else {
      process.exit(0);
    }
  };
  processChunk();
});
