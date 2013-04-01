var _ = require('lodash');

var basic = {
  department: 1,
  number: 1,
  title: 1
};

var detailed = _.extend({}, basic, {
  description: 1,
  longtitle: 1,
  'enrollment-requirements': 1
});

exports.classFilters = {
  basic: basic,
  detailed: detailed,
  raw: {}
};

exports.termFilter = {
  class_id: 1,
  course_id: 1,
  department: 1,
  location_id: 1,
  longtitle: 1,
  number: 1,
  section_id: 1,
  term_id: 1,
  title: 1
};

exports.evaluationFilter = {
  'class-rating': 1,
  class_id: 1,
  course_id: 1,
  instructor: 1,
  'instructor-rating': 1,
  term: 1,
  title: 1
};
