var _ = require('lodash');
var async = require('async');

var db = require('../db');
var utils = require('../utils');

var wrapError = function(cb) {
  return function(err, data) {
    if (err) {
      console.log('ERROR', err);
    } else {
      cb(data);
    }
  }
};

var chunkSize = 1000;
var chunkReqs = _.map(_.range(0, 188394, chunkSize), function(skip) {
  return function(callback) {
    console.log('Trimming', skip, 'to', skip + chunkSize);
    db.Directory.find({}, {}, {limit: chunkSize, skip: skip}, wrapError(function(data) {
      var reqs = _.map(data, function(dir) {
        return function(cb) {
          var o = _.omit(dir.toObject(), '_id');
          _.each(o, function(v, k) {
            dir[k] = utils.trimAll(v);
          });
          dir.save(cb);
        };
      });
      async.parallel(reqs, callback);
    }));
  };
});

async.series(chunkReqs, function() {
  process.exit(0);
});

