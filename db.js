var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var config = require('./config');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var db = {};
var queryMap = {};

mongoose.connect(config.mongouri);

var CourseNumberMappingSchema = Schema({
  department: String,
  department_title: String,
  course_title: String,
  old_number: String,
  new_number: String
});

CourseNumberMappingSchema.index({
  department: 1,
  department_title: 1,
  course_title: 1,
  old_number: 1,
  new_number: 1
});

db.CourseNumberMapping = mongoose.model(
    'CourseNumberMapping',
    CourseNumberMappingSchema
    );

queryMap.CourseNumberMapping = function(q) {
  return _.pick(
      q,
      'department',
      'department_title',
      'course_title',
      'old_number',
      'new_number'
  );
};

var DepartmentSchema = Schema({
  path: String,
  code: String,
  title: String
});

DepartmentSchema.index({
  code: 1
});

db.Department = mongoose.model('Department', DepartmentSchema);
queryMap.Department = function(q) {
  return _.pick(q, 'code', 'title');
};

var ClassSchema = Schema({
  department: String,
  number: String,
  title: String,
  path: String,
  terms: [{ type: ObjectId, ref: 'Term' }]
}, {
  strict: false
});

ClassSchema.index({
  department: 1,
  number: 1
});

db.Class = mongoose.model('Class', ClassSchema);
queryMap.Class = function(q) {
  return _.pick(q, 'departments', 'number');
};

var TermSchema = Schema({
  department: String,
  number: String,
  course_id: String,
  title: String,
  path: String,
  class: { type: ObjectId, ref: 'Class' },
  sections: [{ type: ObjectId, ref: 'Section' }]
}, {
  strict: false
});

TermSchema.index({
  department: 1,
  number: 1,
  course_id: 1
});

db.Term = mongoose.model('Term', TermSchema);
queryMap.Term = function(q) {
  return _.pick(q, 'department', 'number', 'course_id', 'path');
};

var SectionSchema = Schema({
  department: String,
  number: String,
  course_id: String,
  term_id: String,
  class_id: String,
  section_id: String,
  title: String,
  path: String,
  class: { type: ObjectId, ref: 'Class' },
  term: { type: ObjectId, ref: 'Term' }
}, {
  strict: false
});

SectionSchema.index({
  department: 1,
  number: 1,
  course_id: 1,
  term_id: 1
  // class_id: 1,
  // section_id: 1
});

db.Section = mongoose.model('Section', SectionSchema);
queryMap.Section = function(q) {
  return _.pick(q, 'department', 'number', 'course_id', 'term_id', 'path');
};

var LocationSchema = Schema({
  id: Number,
  name: String,
  lat: Number,
  long: Number,
  imageURL: String,
  school_id: Number,
  school_building_id: Number,
  handicap: String,
  address: String,
  comment: String,
  campus_location: String,
  soundex: String
}, {
  strict: false
});

LocationSchema.index({
  id: 1,
  school_id: 1,
  school_building_id: 1
});

db.Location = mongoose.model('Location', LocationSchema);
queryMap.Location = function(q) {
  return _.pick(q, 'id', 'school_id', 'school_building_id');
};

var MarkerSchema = Schema({
  mrkId: Number,
  markerName: String,
  crdId: Number,
  lat: Number,
  lng: Number,
  categoryName: String,
  icon: String
}, {
  strict: false
});

MarkerSchema.index({
  mrkId: 1
});

db.Marker = mongoose.model('Marker', MarkerSchema);
queryMap.Marker = function(q) {
  return _.pick(q, 'mrkId');
};

var EventSchema = Schema({
  guid: String,
  location: {
    marker: { type: ObjectId, ref: 'Marker' }
  }
}, {
  strict: false
});

EventSchema.index({
  guid: 1
});

db.Event = mongoose.model('Event', EventSchema);
queryMap.Event = function(q) {
  return _.pick(q, 'guid');
};

var DirectorySchema = Schema({
  duLDAPKey: String
}, {
  strict: false
});

DirectorySchema.index({
  duLDAPKey: 1
});

db.Directory = mongoose.model('Directory', DirectorySchema);
queryMap.Directory = function(q) {
  return q;
};

var EvaluationSchema = Schema({
  course_id: String,
  class_id: String,
  'instructor-rating': Number,
  'class-rating': Number,
  term: String,
  detailPath: String
}, {
  strict: false
});

EvaluationSchema.index({
  course_id: 1,
  class_id: 1
});

db.Evaluation = mongoose.model('Evaluation', EvaluationSchema);
queryMap.Evaluation = function(q) {
  return _.pick(q, 'course_id', 'class_id');
};

db.schemaToJSON = function(Model) {
  var schema = db[Model].schema;
  var json = { id: Model };

  json.properties = _.reduce(schema.paths, function(memo, prop, field) {
    if (prop.instance && field != '__v' && !/path/i.test(field)) {
      memo[field] = { type: prop.instance };
    }
    return memo;
  }, {});

  return json;
};

module.exports = db;
