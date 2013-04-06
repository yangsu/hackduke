var _ = require('lodash');

// =============================================================================
// Department
// =============================================================================

exports.Department = {};

exports.Department.basic = {
  code: 1,
  title: 1
};

// =============================================================================
// Class
// =============================================================================
var Class = {};
exports.Class = Class;

exports.Class.basic = {
  course_id: 1,
  department: 1,
  number: 1,
  description: 1,
  title: 1,
  longtitle: 1
};

exports.Class.detailed = _.extend({}, Class.basic, {
  'course-details.grading-basis': 1,
  'course-details.component': 1,
  'course-offering.academic-group': 1,
  'course-offering.academic-organization': 1,
  'course-offering.career': 1,
  'enrollment-requirements': 1
});

exports.Class.raw = {
  terms: 0,
  path: 0,
  sectionsPath: 0
};

// =============================================================================
// Term
// =============================================================================

exports.Term = {};

exports.Term.basic = {
  class: 0,
  path: 0,
  sections: 0
};

// =============================================================================
// Section
// =============================================================================

var Section = {};
exports.Section = Section;

exports.Section.basic = {
  class_id: 1,
  course_id: 1,
  department: 1,
  location_id: 1,
  longtitle: 1,
  number: 1,
  section_id: 1,
  term_id: 1,
  title: 1,
  'info.dates': 1,
  'info.instructor': 1,
  'info.meets': 1
};

exports.Section.detailed = _.extend({}, Section.basic, {
  'info.session': 1,
  'info.description': 1,
  'info.class-component': 1,
  'info.status': 1,
  'info.seats-taken': 1,
  'info.seats-open': 1,
  'info.class-capacity': 1,
  'info.waitlist-total': 1
});

exports.Section.raw = {
  'info.class-number': 0,
  class: 0,
  path: 0,
  term: 0
};

// =============================================================================
// Evaluation
// =============================================================================

var Evaluation = {};
exports.Evaluation = Evaluation;

Evaluation.basic = {
  'class-rating': 1,
  class_id: 1,
  course_id: 1,
  instructor: 1,
  'instructor-rating': 1,
  term: 1,
  title: 1
};

Evaluation.detailed = _.extend({}, Evaluation.basic, {
  'details': 1
});

Evaluation.raw = {
  detailPath: 0
};

// =============================================================================
// Event
// =============================================================================

var Event = {};
exports.Event = Event;

Event.basic = {
  description: 1,
  'end.shortdate': 1,
  'end.time': 1,
  image: 1,
  'location.address': 1,
  'location.subaddress': 1,
  'location.link': 1,
  'start.shortdate': 1,
  'start.time': 1,
  'categories.category.value': 1,
  summary: 1
};

Event.detailed = _.extend({}, Event.basic, {
  contact: 1,
  cost: 1,
  guid: 1,
  creator: 1,
  'location.marker': 1,
  'start.date' : 1,
  'end.date' : 1
});

Event.raw = {
  access: 0,
  calendar: 0,
  color: 0,
  deleted: 0,
  editable: 0,
  entityType: 0,
  isAnnotation: 0,
  scheduleMethod: 0,
  'xproperties.X_BEDEWORK_ALIAS': 0,
  'xproperties.X_BEDEWORK_IMAGE': 0
};

// =============================================================================
// Location
// =============================================================================
var Location = {};
exports.Location = Location;

exports.Location.basic = {
  address: 1,
  campus_location: 1,
  lat: 1,
  long: 1,
  name: 1
};

Location.detailed = _.extend({}, Location.basic, {
  imageURL: 1,
  id: 1,
  school_building_id: 1
});

Location.raw = {
  soundex: 0
};
