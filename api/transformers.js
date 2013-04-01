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
