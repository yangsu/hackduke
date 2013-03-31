var _ = require('lodash');
var async = require('async');
var querystring = require('querystring');
var exec = require('child_process').exec;

var config = require('./config');
var db = require('./db');
var parsers = require('./cheerioparser');

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

var cookie = querystring.stringify({
  PHPSESSID: config.PHPSESSID
}, ';', '=');

var constructURL = function (path) {
  if (path[0] !== '/') {
    path = '/public_page/' + path
  }
  return config.BASEURL + path;
};

function genCurlTimingFlag() {
  return ' -w curltiming:%{speed_download}:%{time_total}:%{time_appconnect}';
};

function parseCurlTiming(text) {
  return regexParse(text, /curltiming:([^:]+):([^:]+):([^:]+)/, ['speed','totaltime', 'starttime']);
};


function fetch(path, cb) {
  path = constructURL(path);

  var command = 'curl "' + path + '" --cookie "' + cookie + '"';

  command += genCurlTimingFlag();

  return exec(command, function (error, stdout, stderr) {
    var timing;
    if (_.isString(stdout)) {
      timing = parseCurlTiming(stdout);
    }

    if (error) {
      error.stderr = stderr;
    }

    cb(error, stdout, timing);
  });
};

utils.parallel = function (collection, model, finalCallback) {
  var requests = _.map(collection, function(item, index){
    return function(callback) {
      utils.fetch(item.path, function(error, text, timing) {
        if (error) {
          callback(error);
        } else {
          // try {
            var parsedItems = parsers[item.type](text);

            if (_.isArray(parsedItems)) {
              var dbRequests = _.map(parsedItems, function(item) {
                return function(cb) {
                  db[model].update(
                    item,
                    { $set: item },
                    { upsert: true },
                    cb
                  );
                  return item;
                };
              });

              async.parallel(dbRequests, function(err, data) {
                console.log(
                  '(', index, '/', collection.length, ')',
                  'Fetched and Saved ', data && data.length,
                  ' items from ', item.path,
                  'in', timing.totaltime, 's'
                );
                callback(err, data);
              });
            } else {
              callback(parsedItems);
            }

          // } catch (e) {
          //   callback(e);
          // }
        }
      });
    };
  });

  async.parallel(requests, finalCallback || function(err, data) {
    if (err) {
      console.log('ERROR', err);
    }
    process.exit(0);
  });
};

utils.trim = trim;

utils.regexParse = regexParse;
utils.regexGParse = regexGParse;
utils.listParserGenerator = listParserGenerator;

utils.fetch = fetch;

module.exports = utils;