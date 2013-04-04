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

    var code = path.match(/subject=([^&]+)&/)[1];

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
  var body = $('.ui-body').children();
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
        v = $li.text();
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

  if (utils.trim(sections.children().first().text()) == 'No sections found') {
    return [];
  }

  var data = _.map(sections, function(ul) {
    var $ul = $(ul);
    var key = $ul.find('li[data-role="list-divider"]').text();

    return _.map($ul.find('li[data-role!="list-divider"]'), function(li) {
      var $li = $(li);
      return {
        title: term,
        campus: key,
        path: $li.find('a').attr('href').replace('§', '&sect')
      };
    });
  });

  return _.flatten(data);
};


parsers.section = function(text) {
  var $ = cheerio.load(text);

  var body = $('.ui-body');
  var $p = body.find('p');
  var longtitle = utils.trim($p.first().text());

  var parse = function(node) {
    var details = node.html()
      .replace(/<br>/g, '|')
      .replace(/<[^>]+>/g, '').split('|');

    return utils.pairsToDict(_.map(_.compact(details), function(kv) {
      var arr = kv.split(': ');
      return [ utils.toKey(arr[0]), arr[1] ];
    }));
  };

  var attrs = {};
  var node = $p.next();
  var text = utils.trim(node.html());
  while (node && text !== '' && text != utils.trim(node.next().html())) {
    _.extend(attrs, parse(node));
    node = node.next();
    text = utils.trim(node.html());
  }

  var $ul = $('ul[data-role="listview"]');

  var otherattrs = _.map($ul.find('li[data-role!="list-divider"]'), function(li) {
    var $li = $(li);
    var h4s = $li.find('h4');

    if (h4s.length == 2) {
      var k = h4s.first().text();
      var v = h4s.last().text();
      return [ utils.toKey(k), v ];
    } else {
      return null;
    }
  });

  _.extend(attrs, utils.pairsToDict(_.compact(otherattrs)));

  var data = {
    info: attrs,
    longtitle: longtitle
  };

  var locationPath = $('li > a').attr('href');

  if (locationPath) {
    _.extend(data, {
      locationPath: locationPath,
      location_id: locationPath.match(/bldg_cd=([^&]+)&/)[1]
    });
  }

  var label = $('li[data-role="list-divider"]').last();
  if (utils.trim(label.html()) == 'Combined Section') {
    node = label.next();
    text = utils.trim(node.html());
    var combinedSections = [];

    while (node && text !== '' && text != utils.trim(node.next().html())) {
      var sectionInfo = node.find('h4').html().split('<br>');
      var section = {
        title: sectionInfo[0],
        number: sectionInfo[1]
      };

      var otherInfo = _.chain(node.find('p'))
        .map(function(p) {
          return $(p).text();
        })
        .compact()
        .map(function(p) {
          return p.split(': ');
        })
        .value();

      _.extend(section, utils.pairsToDict(otherInfo));

      combinedSections.push(section);

      node = node.next();
      text = utils.trim(node.html());
    }
    _.extend(data, {
      'combined-sections': combinedSections
    });
  }

  return data;
};

parsers.evaluation = function(text) {
  var $ = cheerio.load(text);

  var title = $('p > strong').text();

  if (title) {
    var rows = $('tr').first().siblings();
    return _.map(rows, function(r) {
      var $r = $(r);
      var tds = $r.find('td');
      return {
        title: title,
        term: $(tds[0]).text(),
        instructor: $(tds[1]).text(),
        'class-rating': $(tds[2]).text(),
        'instructor-rating': $(tds[3]).text(),
        'detailPath': $r.find('td > a').attr('href')
      };
    });
  } else {
    return [];
  }
};

parsers.evaluationdetail = function(text) {
  var $ = cheerio.load(text);

  var title = $('p > strong').text();

  if (title) {
    var instructor = $('p > b').text();

    var rows = $('tr').first().siblings();
    var pairs = _.map(rows, function(r) {
      var $r = $(r);
      var cell = $r.find('td').first();
      var key = utils.toKey(cell.find('a').text());

      var details = cell.find('script').html().match(/= '([^']+)';/)[1];
      var description, ratings;

      if (details) {
        var trs = $('tr', details);
        description = trs.first().find('b').text();

        ratings = _.map(trs.slice(2), function(tr) {
          var $tds = $(tr).find('td');
          var k = $tds.first().text();
          if (k) {
            return {
              question: k,
              count: +($tds.last().text())
            };
          }
        });
      }

      return [key, {
        description: description,
        ratings: _.compact(ratings)
      }];
    });
    return {
      details: utils.pairsToDict(pairs)
    };
  } else {
    return [];
  }
};

_.each(parsers, function(fun, key) {
  parsers[key] = utils.trimFunctionOutput(fun);
});

module.exports = parsers;
