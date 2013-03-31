var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var qs = require('querystring');

var config = require('./config');

var db = {};
var queryMap = {};

mongoose.connect('localhost', 'aces');

var CourseNumberMappingSchema = mongoose.Schema({
  department:       String,
  department_title: String,
  course_title:     String,
  old_number:       String,
  new_number:       String
});

CourseNumberMappingSchema.index({
  department:       1,
  department_title: 1,
  course_title:     1,
  old_number:       1,
  new_number:       1
});

db.CourseNumberMapping = mongoose.model(
  'CourseNumberMapping',
  CourseNumberMappingSchema
);

queryMap.CourseNumberMapping = function(q) {
  return {
    department: q.department,
    department_title: q.department_title,
    course_title: q.course_title,
    old_number: q.old_number,
    new_number: q.new_number
  };
};

var DepartmentSchema = mongoose.Schema({
  path: String,
  code: String,
  title: String
});

DepartmentSchema.index({
  code: 1
});

db.Department = mongoose.model('department', DepartmentSchema);
queryMap.Department = function(q) {
  return {
    code: q.code,
    title: q.title
  };
};

var ClassSchema = mongoose.Schema({
  department: String,
  number:     String,
  title:      String,
  path:       String
}, {
  strict: false
});

ClassSchema.index({
  department: 1,
  number: 1
});

db.Class = mongoose.model('class', ClassSchema);
queryMap.Class = function(q) {
  return {
    department: q.department,
    number: q.number
  }
};

var parsers = require('./cheerioparser');
var utils = require('./utils');

function parallel(collection, model, finalCallback) {
  var count = 0;

  var requests = _.map(collection, function(item){
    return function(callback) {
      utils.fetch(item.path, function(error, text, timing) {
        if (error) {
          callback(error);
        } else {
          // try {
            var parsed = parsers[item.type](text);

            var qsData = qs.parse(item.path);
            if (qsData.subject) qsData.department = qsData.subject;
            if (qsData.class) qsData.number = qsData.class;
            if (qsData.openTerms) qsData.course_id = qsData.openTerms;
            if (qsData.openSections) qsData.term_id = qsData.openSections;

            _.extend(parsed, _.pick(qsData, 'department', 'number', 'course_id', 'term_id'));

            var genDbRequest = function (d) {
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
              console.log(
                '(', count++, '/', collection.length, '-',
                (count/collection.length * 100 + '').slice(0, 4) + '%',')',
                'Fetched and Saved ', _.isArray(data) ? data.length : 1,
                ' items from ', item.path,
                'in', timing.totaltime, 's'
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
              })
            } else {
              callback(parsed);
            }

          // } catch (e) {
          //   callback(e);
          // }
        }
      });
    };
  });

  async.parallel(requests, finalCallback);
};

db.parallel = function (collection, model, finalCallback) {
  var chunks = utils.toChunks(collection, config.CHUNKSIZE);
  var chunkIndex = 0;

  var processChunk = function() {
    console.log('Processing chunk', chunkIndex, 'of', chunks.length);
    if (chunkIndex < chunks.length) {
      parallel(chunks[chunkIndex++], model, function(err, data) {
        if (err) {
          console.log('ERROR', err);
        }
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

module.exports = db;