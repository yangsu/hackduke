var fs = require('fs');
var _ = require('lodash');
var async = require('async');

var db = require('../db');

var parseDate = function(datestring) {
    var chunks = datestring.split('');
    chunks.splice(-5, 0, ':');
    chunks.splice(-3, 0, ':');
    chunks.splice(6, 0, '-');
    chunks.splice(4, 0, '-');
    return new Date(chunks.join(''));
  };

// argv[0] = 'node', argv[1] = 'processAndDumpToDb.js'
// argv[2] is the input file
var inputFile = process.argv[2];

try {
  console.log('Reading ' + inputFile + '...');
  var json = JSON.parse(fs.readFileSync(inputFile, 'ascii'));

  var events = _.map(json.events, function(e) {
    return e.event;
  });

  var eventCbs = _.map(events, function(e, i) {
    return function(cb) {
      console.log('Saving', i, ':', e.guid);

      var save = function(e, callback) {
        db.Event.update({
          guid: e.guid
        }, {
          $set: e
        }, {
          upsert: true
        }, callback);
      };

      var xprop = e.xproperties;
      if (xprop && xprop.X_BEDEWORK_IMAGE) {
        e.image = xprop.X_BEDEWORK_IMAGE.values.text;
      }
      e.creator = e.creator.replace(/\/principals\/users\/agrp(_+)/, '');
      e.start.date = parseDate(e.start.utcdate);
      e.end.date = parseDate(e.end.utcdate);

      var loc = e.location;
      if (loc && loc.link && loc.link.indexOf('=') >= 0) {
        var markerId = loc.link.split('=').slice(-1)[0];
        db.Marker.findOne({
          mrkId: +markerId
        }, { _id: 1 }, { lean: 1 }, function(err, data) {
          var id = (data && data._id) || null;
          if (err) {
            console.log('ERROR', err);
          } else {
            e.location.marker = id;
          }
          save(e, cb);
        });
      } else {
        save(e, cb);
      }
    };
  });

  async.parallel(eventCbs, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log('Saved ' + data.length + ' entries');
    }
    process.exit(0);
  });

  console.log('Parsed ' + events.length + ' events');

} catch (e) {
  console.log(e);
}
