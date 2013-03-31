var mongoose = require('mongoose');

var models = {};

mongoose.connect('localhost', 'aces');

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