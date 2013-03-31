var mongoose = require('mongoose');

var models = {};

mongoose.connect('localhost', 'aces');

var CourseNumberMappingSchema = mongoose.Schema({
  department:       String,
  department_title: String,
  course_title:     String,
  old_number:       String,
  new_number:       String
});

CourseNumberMappingSchema.index({
  department:       1,
  department_title: 1,
  course_title:     1,
  old_number:       1,
  new_number:       1
});

models.CourseNumberMapping = mongoose.model(
  'CourseNumberMapping',
  CourseNumberMappingSchema
);

var DepartmentSchema = mongoose.Schema({
  path: String,
  code: String,
  title: String
});

DepartmentSchema.index({
  code: 1,
});

models.Department = mongoose.model('department', DepartmentSchema);

var ClassSchema = mongoose.Schema({
  department: String,
  number:     String,
  title:      String,
  path:       String
});

ClassSchema.index({
  department: 1,
  number: 1
});

models.Class = mongoose.model('class', ClassSchema);

module.exports = models;