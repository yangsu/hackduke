var _ = require('lodash');

var short = {
  department: 1,
  number: 1,
  title: 1
};

var basic = _.extend({}, short, {
  description: 1,
  longtitle: 1
});

var detailed = _.extend({}, basic, {
  'course-details.grading-basis': 1,
  'course-details.component': 1,
  'course-offering.academic-group': 1,
  'course-offering.academic-organization': 1,
  'course-offering.career': 1,
  'enrollment-requirements': 1
});

exports.classFilters = {
  short: short,
  basic: basic,
  detailed: detailed,
  raw: {
    path: 0,
    sectionsPath: 0
  }
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
