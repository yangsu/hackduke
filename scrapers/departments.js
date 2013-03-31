var _ = require('lodash');

var utils = require('./utils');

var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var departments = _.map(letters, function(letter) {
  return {
    type: 'departments',
    path: 'course_catalog.php?action=Catalog&letter=' + letter
  };
});

utils.parallel(departments, 'Department');