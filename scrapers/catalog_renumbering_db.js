var _ = require('lodash');
var mongoose = require('mongoose');

mongoose.connect('localhost', 'aces');

var catalog = require('./catalog_renumbering').catalog;

var schema = mongoose.Schema({
  department_code:  String,
  department:       String,
  course_title:     String,
  old_number:       String,
  new_number:       String
});

schema.index({
  department_code:  1,
  department:       1,
  course_title:     1,
  old_number:       1,
  new_number:       1
});

var CatalogMapping = mongoose.model('CatalogMapping', schema);

var handleError = function (err) {
  console.log('Error', err);
};

var total = catalog.length;
var count = 0;

_.each(catalog, function(entry) {
  var mapping = {
    department_code:  entry[0],
    department:       entry[1],
    course_title:     entry[2],
    old_number:       entry[3],
    new_number:       entry[4]
  };

  CatalogMapping.update(mapping, { $set: mapping }, { upsert: true }, function(err) {
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
  });
});