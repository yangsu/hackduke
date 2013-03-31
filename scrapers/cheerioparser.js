var _ = require('lodash');
var cheerio = require('cheerio');

var parsers = {};

parsers.department = function(text) {
  var $ = cheerio.load(text);

  var classes = $('li > a');

  return _.map(classes, function(c) {
    var $c = $(c);
    var courseNumber = $c.find('h4').text().split(' ');
    var department = courseNumber[0];
    var number = courseNumber.slice(1).join(' ');
    var title = $c.find('p').text();
    var path = $c.attr('href');
    return {
      department: department,
      number: number,
      title: title,
      path: path
    };
  });
};

module.exports = parsers;