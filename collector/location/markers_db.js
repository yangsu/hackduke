var _ = require('lodash');

var markers = require('./markers');

var db = require('../../db');

var handleError = function(err) {
  console.log('Error', err);
};

var total = _.keys(markers).length;
var count = 0;

_.each(markers, function(marker) {
  db.Marker.update(
    { mrkId: marker.mrkId },
    { $set: marker },
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
