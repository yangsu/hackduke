var _ = require('lodash');

var parsers = {};

/*******************************************************************************
 * Helper Functions
 ******************************************************************************/

/**
 * Convert a regex to string that can be used to create another regex with different flags
 * This is avoid the type error
 *   'Cannot supply flags when constructing one RegExp from another'
 *
 * @param  {RegExp} regex input regex
 * @return {string}       valid regex string
 */
function regexToStr(regex) {
  // remove the slashes at the beginning and the end in the string representation of RegExp
  return regex.toString().slice(1, -1);
};

/**
 * Remove spaces at the beginning and the end of a string
 * @param  {string} str input string
 * @return {string}     trimmed string
 */
function trim(str) {
  if (str) {
    return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
  } else {
    return '';
  }
};

/**
 * Construct an object with the subgroup matches as values and labels as keys
 * @param  {array}  matches array of matches returned by regex.exec
 * @param  {array}  labels  array of labels corresponding to the matches
 * @return {object}         object containing label => matches
 */
function extractMatches(matches, labels) {
  if (!labels || labels.length === 1) {
    return trim(matches[1]);
  } else {
    return  _.reduce(labels, function (memo, label, i) {
      memo[label] = trim(matches[i + 1]);
      return memo;
    }, {});
  }
};

/**
 * Using regex to parse the input text and extract the matches
 * @param  {string} text   input text
 * @param  {RegExp} regex  parsing RegExp
 * @param  {array}  labels array of labels corresponding to the matches
 * @return {object}        object containing label => matches
 */
function regexParse(text, regex, labels) {
  // ignore case, multiline
  var reg = new RegExp(regexToStr(regex), 'im')
    , matches = reg.exec(text)
    , returnVal = extractMatches(matches, labels);

  return returnVal;
};

/**
 * Using regex with the global flag to parse the input text and extract all the matches
 * @param  {string} text   input text
 * @param  {RegExp} regex  parsing RegExp
 * @param  {array}  labels array of labels corresponding to the matches
 * @param  {int}    limit  limit on the number of matches returned
 * @return {object}        object containing label => matches
 */
function regexGParse(text, regex, labels, limit) {
  // match all, ignore case, multiline
  var reg = new RegExp(regexToStr(regex), 'gim')
    , returnVal = []
    , matchCount = 0
    , matchLimit = limit || 1
    , matches
    , tempVal;

  while ((matches = reg.exec(text)) !== null) {
    if (matchCount >= matchLimit) {
      break;
    }

    tempVal = extractMatches(matches, labels)

    returnVal.push(tempVal);
    matchCount++;
  }
  return returnVal;
};

/**
 * Generates functions that parse lists. The results contain a type that point to the next parser to be used
 * @param  {RegExp} regex     parsing RegExp
 * @param  {array}  labels    array of labels corresponding to the matches
 * @param  {string} childType type of the parsed results
 * @return {array}            object containing label => matches
 */
function listParserGenerator(regex, labels, childType) {
  return function (text) {
    var result = regexGParse(text, regex, labels);
    return _.map(result, function (item) {
      return _.extend(item, {
        type: childType
      })
    });
  };
};

/*******************************************************************************
 * Parsers
 ******************************************************************************/

/**
 * Parse the root page
 */
parsers.base = listParserGenerator(
  /<a href="([^"]+)"><h6>([^<]+)<\/h6><br\/><p[^>]+>([^<]+)<\/p>/,
  ['path', 'letter', 'label'],
  'departments'
);

/**
 * Parse pages corresponding to each letter, extract departments
 */
parsers.departments = listParserGenerator(
  /<li><a href="([^"]+subject=(\w+)[^"]+)">([^<]+)<\/a><\/li>/,
  ['path', 'subject', 'label'],
  'department'
);

/**
 * Parse pages corresponding to each department, extract classes
 */
parsers.department = listParserGenerator(
  /<li><a href="([^"]+class=(\w+)[^"]+)"><h4>([^<]+)<\/h4>/,
  ['path', 'class', 'label'],
  'class'
);

/**
 * Parse pages corresponding to each class, extract terms
 */
parsers.class = function (text) {
  var returnVal = {}
    , uls = regexGParse(
      text,
      /<ul[^>]+>(.+?)(<\/ul>)/,
      null,
      3
    );

  returnVal.info = regexParse(
    text,
    /<h3>([^<]+)<\/h3><p><strong>[^<]+<\/strong><\/p><p>([^<]+)<\/p>/,
    ['number', 'title', 'description']
  );

  returnVal.details = regexGParse(
    uls[0],
    /<li[^>]*><h4>([^<]+)<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['label', 'value'],
    10
  );

  returnVal.offering = regexGParse(
    uls[1],
    /<li[^>]*><h4>([^<]+)<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['label', 'value'],
    10
  );

  if (uls[2]) {
    returnVal.enrollmentReq = regexParse(
      uls[2],
      /<li style[^>]*>([^<]+)<\/li>/
    );
  }

  returnVal.path = regexParse(
    text,
    /<a data-role="button" href="([^"]+)"/
  );

  returnVal.type = 'terms';

  return returnVal;
};

/**
 * Parse pages corresponding to the terms for a class, extract each term
 */
parsers.terms = listParserGenerator(
  /<li><a href="([^"]+openSections=(\w+)[^"]+crse_id=(\w+)[^"]+)"\s*>([^<]+)/,
  ['path', 'sectionId', 'courseId', 'sectionLabel'],
  'term'
);

/**
 * Parse pages corresponding to each term for a class, extract sections
 */
parsers.term = listParserGenerator(
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

  returnVal.info = regexParse(
    text,
    /<p><b>([^<]+)<\/b><\/p><p><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/><strong>[^<]+<\/strong>([^<]+)<br\/>/,
    ['title', 'session', 'classNumber', 'units', 'topic', 'description']
  );

  var temp = regexParse(
    text,
    /<p><strong>[^<]+<\/strong>([^<]+)<br\/><\/p>/
  );

  if (temp) {
    returnVal.enrollmentReq = temp;
  }

  returnVal.details = regexGParse(
    text,
    /<li[^>]*><h4>([^<]+)<\/h4><h4[^>]+>([^<]+)<\/h4/,
    ['label', 'value'],
    20
  );

  temp = regexParse(
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
  var returnVal = regexParse(
    text,
    /initialize\(([^,]+),([^\)]+)\);/,
    ['latitude', 'longitude']
  );
  return returnVal;
}

module.exports = parsers;