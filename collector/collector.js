var _ = require('lodash');
var async = require('async');
var qs = require('querystring');

var config = require('./config');
var parsers = require('./cheerioparser');
var utils = require('./utils');

var parseQSData = function(path) {

  var qsData = qs.parse(path.split('?')[1]);

  if (qsData.subject) qsData.department = qsData.subject;
  if (qsData.class) qsData.number = qsData.class;
  if (qsData.openTerms) qsData.course_id = qsData.openTerms;
  if (qsData.crse_id) qsData.course_id = qsData.crse_id;
  if (qsData.openSections) qsData.term_id = qsData.openSections;
  if (qsData.strm) qsData.term_id = qsData.strm;
  if (qsData.class_nbr) qsData.class_id = qsData.class_nbr;
  if (qsData.section) qsData.section_id = qsData.section;

  return _.pick(
      qsData,
      'department',
      'number',
      'course_id',
      'term_id',
      'class_id',
      'section_id'
  );
};

exports.parseQSData = parseQSData;

function parallel(collection, model, finalCallback) {
  var count = 0;

  var requests = _.map(collection, function(item) {
    return function(callback) {
      utils.fetch(item.path, function(error, text, timing) {
        if (error) {
          callback(error);
        } else {
          try {
            var parsed = parsers[item.type](text);

            var qsData = parseQSData(item.path);

            if (_.isArray(parsed)) {
              parsed = _.map(parsed, function(p) {
                return _.extend(p, qsData);
              });
            } else if (_.isObject(parsed)) {
              _.extend(parsed, qsData);
            }

            var genDbRequest = function(d) {
              return function(cb) {
                db[model].update(
                    queryMap[model](d),
                    { $set: d },
                    { upsert: true },
                    function(err, data) {
                      if (err) err.item = d;
                      cb(err, data);
                    }
                );
                return d;
              };
            };
            var logProgress = function(data) {
              var pct = (++count / collection.length * 100 + '').slice(0, 4) + '%';
              console.log(
                  '(', count, '/', collection.length, '-', pct, ')',
                  'Fetched and Saved ', _.isArray(data) ? data.length : 1,
                  ' items from ', item.path,
                  'in', timing && timing.totaltime, 's'
              );
            };

            if (_.isArray(parsed)) {
              var dbRequests = _.map(parsed, function(d) {
                return genDbRequest(d);
              });

              async.parallel(dbRequests, function(err, data) {
                logProgress(data);
                callback(err, data);
              });
            } else if (_.isObject(parsed)) {
              genDbRequest(parsed)(function(err, data) {
                logProgress(data);
                callback(err, data);
              });
            } else {
              callback(parsed);
            }
          } catch (e) {
            console.trace(e);
            console.log('URL', item.path);
            callback(e);
          }
        }
      });
    };
  });

  async.parallel(requests, finalCallback);
}

exports.parallel = function(collection, model, finalCallback) {
  var chunks = utils.toChunks(collection, config.CHUNKSIZE);
  var chunkIndex = 0;
  var totaltime = 0;

  var processChunk = function() {
    var starttime = Date.now();
    console.log('Processing chunk', chunkIndex + 1, 'of', chunks.length);
    if (chunkIndex < chunks.length) {
      parallel(chunks[chunkIndex++], model, function(err, data) {
        if (err) {
          console.log('ERROR', err);
        }
        var ellapsed = (Date.now() - starttime) / 1000;
        totaltime += ellapsed;
        console.log(
            'Completed processing block in ', ellapsed, 's',
            'eta:', totaltime / chunkIndex * (chunks.length - chunkIndex), 's'
        );
        process.nextTick(processChunk);
      });
    } else {
      if (finalCallback) {
        finalCallback();
      } else {
        process.exit(0);
      }
    }
  };
  processChunk();
};
