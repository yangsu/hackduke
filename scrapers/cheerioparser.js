var _ = require('lodash');
var cheerio = require('cheerio');

var utils = require('./utils');

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

    return {
      title: $c.find('p').text(),
      path: $c.attr('href')
    };
  });
};

parsers.class = function(text) {
  var $ = cheerio.load(text);

  // Body Section
  var body = $('.ui-body').children()
  var longtitle = utils.trim(body.first().html()).split('<br>')[1];
  var description = body.last().text();

  var sections = $('ul[data-role="listview"]');

  var data = _.reduce(sections, function(memo, ul) {
    var $ul = $(ul);
    var key = $ul.find('li[data-role="list-divider"]').text();

    var attrs = _.map($ul.find('li[data-role!="list-divider"]'), function(li) {
      var $li = $(li);
      var k, v;
      if ($li.children().length <= 1) {
        k = 'requirement';
        v  = $li.text();
      } else {
        k = $li.children().first().text();
        v = $li.children().last().text();
      }
      return [ utils.toKey(k), v ];
    });

    memo[utils.toKey(key)] = utils.pairsToDict(attrs);
    return memo;
  }, {});

  // View Sections
  var sectionsPath = $('a[data-role="button"]').attr('href');

  return _.extend(data, {
    description: description,
    longtitle: longtitle,
    sectionsPath: sectionsPath
  });
};

parsers.terms = function(text) {
  var $ = cheerio.load(text);

  var terms = $('li > a');

  return _.map(terms, function(c) {
    var $c = $(c);
    return {
      title: $c.text(),
      path: $c.attr('href')
    };
  });
};

parsers.term = function(text) {
  var $ = cheerio.load(text);

  var term = $('h3').text().split(' for ').slice(-1)[0];
  var sections = $('ul[data-role="listview"]');

  var data = _.map(sections, function(ul) {
    var $ul = $(ul);
    var key = $ul.find('li[data-role="list-divider"]').text();

    return _.map($ul.find('li[data-role!="list-divider"]'), function(li) {
      var $li = $(li);
      return {
        title: term,
        campus: key,
        path: $li.find('a').attr('href')
      };
    });
  });

  return _.flatten(data);
};

_.each(parsers, function(fun, key) {
  parsers[key] = utils.trimOutput(fun);
});

module.exports = parsers;