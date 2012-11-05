var _ = require('lodash');

var parsers = {};

function escapeRegex(regex) {
  return regex.replace(/([\/])/g, "\\$1");
};

function parseRegex(text, regex, labels, limit) {
  // match all, ignore case, multiline
  var reg = new RegExp(escapeRegex(regex), 'gim')
    , returnVal = []
    , matchCount = 0
    , matchLimit = limit || 1;
  var matches, tempVal;

  while ((matches = reg.exec(text)) !== null) {
    if (matchCount >= matchLimit) {
      break;
    }

    tempVal = _.reduce(labels, function (memo, label, i) {
      memo[label] = matches[i + 1];
      return memo;
    }, {});
    returnVal.push(tempVal);
    matchCount++;
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
  var returnVal = {}
    , tempLabel = 'content'
    , uls = parseRegex(
      text,
      '<ul[^>]+>(.+?)(</ul>)',
      [tempLabel],
      3
    );

  returnVal.info = parseRegex(
    text,
    '<h3>([^<]+)</h3><p><strong>([^<]+)</strong></p><p>([^<]+)</p>',
    ['number', 'title', 'description']
  );

  returnVal.details = parseRegex(
    uls[0][tempLabel],
    '<li[^>]*><h4>([^<]+)</h4><h4[^>]+>([^<]+)</h4',
    ['label', 'value'],
    10
  );

  returnVal.offering = parseRegex(
    uls[1][tempLabel],
    '<li[^>]*><h4>([^<]+)</h4><h4[^>]+>([^<]+)</h4',
    ['label', 'value'],
    10
  );

  if (uls[2]) {
    returnVal.enrollmentReq = parseRegex(
      uls[2][tempLabel],
      '<li style[^>]*>([^<]+)</li>',
      ['req'],
      10
    );
  }

  tempLabel = 'path';
  returnVal.path = parseRegex(
    text,
    '<a data-role="button" href="([^"]+)"',
    [tempLabel]
  )[0][tempLabel];

  returnVal.type = 'sections';

  return returnVal;
};

parsers.sections = function (text) {

};

module.exports = parsers;