var _ = require('lodash');
var async = require('async');

var db = require('./db');
var parsers = require('./parsers');
var utils = require('./utils');

var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var requests = _.chain(letters)
.map(function(letter) {
  return {
    type: 'departments',
    path: 'course_catalog.php?action=Catalog&letter=' + letter
  };
})
.map(function(item){
  return function(cb) {
    utils.fetch(item.path, function(error, text, timing) {
      if (error) {
        cb(e);
      } else {
        try {
          var result = parsers[item.type](text);

          if (_.isArray(result)) {
            var dbRequests = _.map(result, function(department) {
              var title = department.label.slice(department.subject.length + 3);
              var department = {
                path: department.path,
                code: department.subject,
                title: title
              };
              return function(departmentCb) {
                db.Department.update(
                  department,
                  { $set: department },
                  { upsert: true },
                  departmentCb
                );
              };
            });

            async.parallel(dbRequests, function(err, data) {
              if (data) {
                console.log('Saved ', data.length, ' departments');
              }
              cb(err, result);
            });
          }

        } catch (e) {
          cb(e);
        }

        console.log('fetched', item.path, 'in', timing.totaltime, 's');
      }
    });
  };
}).value();

async.parallel(requests, function(err, data) {
  if (err) {
    console.log('ERROR', err);
  } else {
    var departments = _.flatten(data);
    process.exit(0);
  }
})