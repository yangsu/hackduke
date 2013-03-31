var _ = require('lodash');
var async = require('async');

var parsers = require('./parsers');

var db = require('./db');
var utils = require('./utils');

db.Department.find({}, 'path', null, function (err, departments) {
  var requests = _.chain(departments)
    .map(function(department) {
      return {
        type: 'department',
        path: department.path
      };
    })
    .map(function(item){
      return function(cb) {
        utils.fetch(item.path, function(error, text, timing) {
          if (error) {
            cb(error);
          } else {
            // try {
              var result = parsers[item.type](text);

              if (_.isArray(result)) {
                var dbRequests = _.map(result, function(klass) {
                  return function(klassCb) {
                    db.Class.update(
                      klass,
                      { $set: klass },
                      { upsert: true },
                      klassCb
                    );
                  };
                });

                async.parallel(dbRequests, function(err, data) {
                  if (err) {
                    console.log('DB ERROR', err);
                  }
                  console.log('Saved ', data.length, ' classes');
                  cb(err, result);
                });
              }

            // } catch (e) {
            //   cb(e);
            // }

            console.log('fetched', item.path, 'in', timing.totaltime, 's');
          }
        });
      };
    }).value();

  async.parallel(requests, function(err, data) {
    if (err) {
      console.log('ERROR', err);
    } else {
      process.exit(0);
    }
  })
});
