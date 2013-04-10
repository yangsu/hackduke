var _ = require('lodash');

var db = require('../db');
var collector = require('./collector');

var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var departments = _.map(letters, function(letter) {
  return {
    type: 'departments',
    path: 'course_catalog.php?action=Catalog&letter=' + letter
  };
});

collector.parallel(departments, 'Department');
