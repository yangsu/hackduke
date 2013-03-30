var _ = require('lodash');

var utils = {};

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
    return str
      .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'')
      .replace(/\s+/g,' ')
      .replace(/:$/, '');
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
  if (!matches || matches.length <= 1) {
    console.log('Irregular Data');
    console.log(matches);
  } else if (!labels || labels.length === 1) {
    return trim(matches[1]);
  } else {
    return  _.reduce(labels, function(memo, label, i) {
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
    , matchLimit = limit || 1000
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
  return function(text) {
    var result = regexGParse(text, regex, labels);
    return _.map(result, function(item) {
      return _.extend(item, {
        type: childType
      })
    });
  };
};

function genCurlTimingFlag() {
  return ' -w curltiming:%{speed_download}:%{time_total}:%{time_appconnect}';
};

function parseCurlTiming(text) {
  return regexParse(text, /curltiming:([^:]+):([^:]+):([^:]+)/, ['speed','totaltime', 'starttime']);
};

utils.trim = trim;

utils.regexParse = regexParse;
utils.regexGParse = regexGParse;
utils.listParserGenerator = listParserGenerator;

utils.genCurlTimingFlag = genCurlTimingFlag;
utils.parseCurlTiming = parseCurlTiming;

module.exports = utils;