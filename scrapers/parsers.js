var _ = require('lodash');

var parsers = {};

function escapeRegex(regex) {
  return regex.replace(/([\/])/g, "\\$1");
};

function parseRegex(text, regex, labels) {
  // match all, ignore case
  var reg = new RegExp(escapeRegex(regex), 'gi');
  var returnVal = [];
  var matches, tempVal;

  // while => if to limit to 1 link
  if ((matches = reg.exec(text)) !== null) {
    tempVal = _.reduce(labels, function (memo, label, i) {
      memo[label] = matches[i + 1];
      return memo;
    }, {});
    returnVal.push(tempVal);
  }
  return returnVal;
};

function liParseGenerator(regex, labels, childType) {
  return function (text) {
    var result = parseRegex(text, regex, labels);
    return _.map(result, function (item) {
      return _.extend(item, {
        type: childType
      })
    });
  };
};

parsers.base = liParseGenerator(
  '<a href="([^"]+)"><h6>([^<]+)</h6><br/><p[^>]+>([^<]+)</p>',
  ['path', 'letter', 'label'],
  'letter'
);

parsers.letter = liParseGenerator(
  '<li><a href="([^"]+subject=(\\w+)[^"]+)">([^<]+)</a></li>',
  ['path', 'subject', 'label'],
  'classes'
);

parsers.classes = liParseGenerator(
  '<li><a href="([^"]+class=(\\w+)[^"]+)"><h4>([^<]+)</h4>',
  ['path', 'class', 'label'],
  'class'
);

parsers.class = function (text) {

};

module.exports = parsers;