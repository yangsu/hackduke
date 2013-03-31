var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var db = {};

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

var DepartmentSchema = mongoose.Schema({
  path: String,
  code: String,
  title: String
});

DepartmentSchema.index({
  code: 1,
});

db.Department = mongoose.model('department', DepartmentSchema);

var ClassSchema = mongoose.Schema({
  department: String,
  number:     String,
  title:      String,
  path:       String
});

ClassSchema.index({
  department: 1,
  number: 1
});

db.Class = mongoose.model('class', ClassSchema);

var parsers = require('./cheerioparser');
var utils = require('./utils');

db.parallel = function (collection, model, finalCallback) {
  var requests = _.map(collection, function(item, index){
    return function(callback) {
      utils.fetch(item.path, function(error, text, timing) {
        if (error) {
          callback(error);
        } else {
          // try {
            var parsedItems = parsers[item.type](text);

            if (_.isArray(parsedItems)) {
              var dbRequests = _.map(parsedItems, function(item) {
                return function(cb) {
                  db[model].update(
                    item,
                    { $set: item },
                    { upsert: true },
                    cb
                  );
                  return item;
                };
              });

              async.parallel(dbRequests, function(err, data) {
                console.log(
                  '(', index, '/', collection.length, ')',
                  'Fetched and Saved ', data && data.length,
                  ' items from ', item.path,
                  'in', timing.totaltime, 's'
                );
                callback(err, data);
              });
            } else {
              callback(parsedItems);
            }

          // } catch (e) {
          //   callback(e);
          // }
        }
      });
    };
  });

  async.parallel(requests, finalCallback || function(err, data) {
    if (err) {
      console.log('ERROR', err);
    }
    process.exit(0);
  });
};

module.exports = db;