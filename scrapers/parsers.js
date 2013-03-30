var utils = require('./utils');

var parsers = {};

/**
 * Parse the root page
 */
parsers.base = utils.listParserGenerator(
  /<a href="([^"]+)"><h6>([^<]+)<\/h6><br\/><p[^>]+>([^<]+)<\/p>/,
  ['path', 'letter', 'label'],
  'departments'
);

/**
 * Parse pages corresponding to each letter, extract departments
 */
parsers.departments = utils.listParserGenerator(
  /<li><a href="([^"]+subject=(\w+)[^"]+)">([^<]+)<\/a><\/li>/,
  ['path', 'subject', 'label'],
  'department'
);

/**
 * Parse pages corresponding to each department, extract classes
 */
parsers.department = utils.listParserGenerator(
  /<li><a href="([^"]+class=(\w+)[^"]+)"><h4>([^<]+)<\/h4>/,
  ['path', 'class', 'label'],
  'class'
);

/**
 * Parse pages corresponding to each class, extract terms
 */
parsers.class = function (text) {
  var returnVal = {}
    , uls = utils.regexGParse(
      text,
      /<ul[^>]+>(.+?)(<\/ul>)/
    );

  returnVal.info = utils.regexParse(
    text,
    /<h3>([^<]+)<\/h3><p><strong>([^<]+)<\/strong><\/p><p>([^<]+)<\/p>/,
    ['number', 'title', 'description']
  );

  returnVal.details = utils.regexGParse(
    uls[0],
    /<li[^>]*><h4>([^<]+)<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['label', 'value']
  );

  returnVal.offering = utils.regexGParse(
    uls[1],
    /<li[^>]*><h4>([^<]+)<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['label', 'value']
  );

  if (uls[2]) {
    returnVal.enrollmentReq = utils.regexParse(
      uls[2],
      /<li style[^>]*>([^<]+)<\/li>/
    );
  }

  returnVal.path = utils.regexParse(
    text,
    /<a data-role="button" href="([^"]+)"/
  );

  returnVal.type = 'terms';

  return returnVal;
};

/**
 * Parse pages corresponding to the terms for a class, extract each term
 */
parsers.terms = utils.listParserGenerator(
  /<li><a href="([^"]+openSections=(\w+)[^"]+crse_id=(\w+)[^"]+)"\s*>([^<]+)/,
  ['path', 'sectionId', 'courseId', 'sectionLabel'],
  'term'
);

/**
 * Parse pages corresponding to each term for a class, extract sections
 */
parsers.term = utils.listParserGenerator(
  /<li><a href="([^"]+strm=(\w+)[^"]+section=(\w+)[^"]+class_nbr=(\w+)[^"]+)">([^<]+)/,
  ['path', 'termId', 'sectionId', 'classNumber'],
  'section'
);

/**
 * Parse pages corresponding to each section for a class
 * Extract all info
 * Extract location info if available
 */
parsers.section = function (text) {
  var returnVal = {};

  returnVal.info = utils.regexParse(
    text,
    /<p><b>([^<]+)<\/b><\/p><p><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/>/,
    ['title', 'session', 'classNumber', 'units', 'topic', 'description']
  );

  var temp = utils.regexParse(
    text,
    /<p><strong>[^<]+<\/strong>([^<]+)<br\/><\/p>/
  );

  if (temp) {
    returnVal.enrollmentReq = temp;
  }

  returnVal.details = utils.regexGParse(
    text,
    /<li[^>]*><h4>([^<]+)<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['label', 'value']
  );

  temp = utils.regexParse(
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

/**
 * Parse location page, extract latitude and longitude
 */
parsers.location = function (text) {
  var returnVal = utils.regexParse(
    text,
    /initialize\(([^,]+),([^\)]+)\);/,
    ['latitude', 'longitude']
  );
  return returnVal;
};

module.exports = parsers;