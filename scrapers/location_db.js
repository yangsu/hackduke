var _ = require('lodash');

var locations = require('./locations');

var db = require('./db');

var handleError = function(err) {
  console.log('Error', err);
};

var total = locations.length;
var count = 0;

_.each(locations, function(loc) {
  db.Location.update(
    loc,
    { $set: loc },
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
