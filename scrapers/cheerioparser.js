var _ = require('lodash');
var cheerio = require('cheerio');

var parsers = {};

parsers.departments = function(text) {
  var $ = cheerio.load(text);

  var departments = $('li > a');

  return _.map(departments, function(d) {
    var $d = $(d);

    var path = $d.attr('href');

    var code = path.match(/subject=(\w+)/)[1];

    // format '<code> - <name>'
    var title = $d.text().slice(code.length + 3);

    return {
      path: path,
      code: code,
      title: title
    };
  });
};

parsers.department = function(text) {
  var $ = cheerio.load(text);

  var classes = $('li > a');

  return _.map(classes, function(c) {
    var $c = $(c);
    var courseNumber = $c.find('h4').text().split(' ');

    return {
      department: courseNumber[0],
      number: courseNumber.slice(1).join(' '),
      title: $c.find('p').text(),
      path: $c.attr('href')
    };
  });
};

module.exports = parsers;