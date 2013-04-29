var _ = require('lodash');
var async = require('async');

var db = require('../../db');
var collector = require('../collector');

var wrapError = function(cb) {
  return function(err, data) {
    if (err) {
      console.log('ERROR', err);
    } else {
      cb(data);
    }
  }
};

var dbParsePath = function(collection, path) {
  return function(callback) {
    var query = {};
    query[path] = { $exists: true, $ne: null };
    db[collection].find(query, {}, { limit: 0 }, wrapError(function(d) {
      var reqs = _.map(d, function(doc) {
        return function(cb) {
          doc.set(collector.parseQSData(doc.get(path)));
          doc.save(cb);
        };
      });
      async.parallel(reqs, callback);
    }));
  };
};

async.series({
  class: dbParsePath('Class', 'sectionsPath'),
  term: dbParsePath('Term', 'path'),
  section: dbParsePath('Section', 'path'),
  evaluation: dbParsePath('Evaluation', 'detailPath')
}, function(err, data) {
  _.each(data, function(v, k) {
    console.log(k, v.length);
  });
  process.exit(0);
});
