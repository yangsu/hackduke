var _ = require('lodash');

var parsers = {};

function regexToStr(regex) {
  return regex.toString().slice(1, -1);
};

function trim(str) {
  if (str) {
    return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
  } else {
    return '';
  }
};

function parseMatches(matches, labels) {
  if (!labels || labels.length === 1) {
    return trim(matches[1]);
  } else {
    return  _.reduce(labels, function (memo, label, i) {
      memo[label] = trim(matches[i + 1]);
      return memo;
    }, {});
  }
};

function parseRegex(text, regex, labels) {
  var reg = new RegExp(regexToStr(regex), 'im')
    , matches = reg.exec(text)
    , returnVal = parseMatches(matches, labels);

  return returnVal;
};

function parseRegexG(text, regex, labels, limit) {
  // match all, ignore case, multiline
  var reg = new RegExp(regexToStr(regex), 'gim')
    , returnVal = []
    , matchCount = 0
    , matchLimit = limit || 1;
  var matches, tempVal;
  console.log(reg.toString());

  while ((matches = reg.exec(text)) !== null) {
    if (matchCount >= matchLimit) {
      break;
    }

    tempVal = parseMatches(matches, labels)

    returnVal.push(tempVal);
    matchCount++;
  }
  return returnVal;
};

function liParseGenerator(regex, labels, childType) {
  return function (text) {
    var result = parseRegexG(text, regex, labels);
    return _.map(result, function (item) {
      return _.extend(item, {
        type: childType
      })
    });
  };
};

parsers.base = liParseGenerator(
  /<a href="([^"]+)"><h6>([^<]+)<\/h6><br\/><p[^>]+>([^<]+)<\/p>/,
  ['path', 'letter', 'label'],
  'letter'
);

parsers.letter = liParseGenerator(
  /<li><a href="([^"]+subject=(\w+)[^"]+)">([^<]+)<\/a><\/li>/,
  ['path', 'subject', 'label'],
  'classes'
);

parsers.classes = liParseGenerator(
  /<li><a href="([^"]+class=(\w+)[^"]+)"><h4>([^<]+)<\/h4>/,
  ['path', 'class', 'label'],
  'class'
);

parsers.class = function (text) {
  var returnVal = {}
    , uls = parseRegexG(
      text,
      /<ul[^>]+>(.+?)(<\/ul>)/,
      null,
      3
    );

  returnVal.info = parseRegex(
    text,
    /<h3>([^<]+)<\/h3><p><strong>[^<]+<\/strong><\/p><p>([^<]+)<\/p>/,
    ['number', 'title', 'description']
  );

  returnVal.details = parseRegexG(
    uls[0],
    /<li[^>]*><h4>([^<]+)<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['label', 'value'],
    10
  );

  returnVal.offering = parseRegexG(
    uls[1],
    /<li[^>]*><h4>([^<]+)<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['label', 'value'],
    10
  );

  if (uls[2]) {
    returnVal.enrollmentReq = parseRegex(
      uls[2],
      /<li style[^>]*>([^<]+)<\/li>/,
      null,
      10
    );
  }

  returnVal.path = parseRegex(
    text,
    /<a data-role="button" href="([^"]+)"/
  );

  returnVal.type = 'terms';

  return returnVal;
};

parsers.terms = liParseGenerator(
  /<li><a href="([^"]+openSections=(\w+)[^"]+crse_id=(\w+)[^"]+)"\s*>([^<]+)/,
  ['path', 'sectionId', 'courseId', 'sectionLabel'],
  'term'
);

parsers.term = liParseGenerator(
  /<li><a href="([^"]+strm=(\w+)[^"]+section=(\w+)[^"]+class_nbr=(\w+)[^"]+)">([^<]+)/,
  ['path', 'termId', 'sectionId', 'classNumber'],
  'section'
);

parsers.section = function (text) {
  var returnVal = {};

  returnVal.info = parseRegex(
    text,
    /<p><b>([^<]+)<\/b><\/p><p><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/>/,
    ['title', 'session', 'classNumber', 'units', 'topic', 'description']
  );

  var temp = parseRegex(
    text,
    /<p><strong>[^<]+<\/strong>([^<]+)<br\/><\/p>/
  );

  if (temp) {
    returnVal.enrollmentReq = temp;
  }

  returnVal.details = parseRegexG(
    text,
    /<li[^>]*><h4>([^<]+)<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['label', 'value'],
    20
  );

  temp = parseRegex(
    text,
    /<li[^>]*><a[^>]*href="([^"]+)"><h4>[^<]+<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['link', 'location']
  );

  if (temp) {
    returnVal.location = temp;
    returnVal.path = returnVal.location.link;
    returnVal.type = 'location';
    return returnVal;
  }
};

parsers.location = function (text) {
  var returnVal = parseRegex(
    text,
    /initialize\(([^,]+),([^\)]+)\);/,
    ['latitude', 'longitude']
  );
  return returnVal;
}

module.exports = parsers;