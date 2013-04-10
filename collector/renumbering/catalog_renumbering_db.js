var _ = require('lodash');

var catalog = require('./catalog_renumbering');

var db = require('../../db');

var handleError = function(err) {
  console.log('Error', err);
};

var total = catalog.length;
var count = 0;

_.each(catalog, function(entry) {
  var mapping = {
    department: entry[0],
    department_title: entry[1],
    course_title: entry[2],
    old_number: entry[3],
    new_number: entry[4]
  };

  db.CourseNumberMapping.update(
      mapping,
      { $set: mapping },
      { upsert: true },
      function(err) {
        if (err) {
          return handleError(err);
        } else {
          count++;
          if (count >= total) {
            process.exit(0);
          } else {
            console.log('Saved', count, '/', total);
          }
        }
      }
  );
});
