var _ = require('lodash');
var exec = require('child_process').exec;

var config = require('./config');


/**
 * Convert a regex to string that can be used to create another regex with different flags
 * This is avoid the type error
 *   'Cannot supply flags when constructing one RegExp from another'
 *
 * @param  {RegExp} regex input regex.
 * @return {string}       valid regex string.
 */
function regexToStr(regex) {
  // remove the slashes at the beginning and the end in the string representation of RegExp
  return regex.toString().slice(1, -1);
}


/**
 * Remove spaces at the beginning and the end of a string
 * @param  {string} str input string.
 * @return {string}     trimmed string.
 */
function trim(str) {
  if (str) {
    return str
      .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '')
      .replace(/\s+/g, ' ')
      .replace(/:$/, '');
  } else {
    return '';
  }
}
exports.trim = trim;


/**
 * Construct an object with the subgroup matches as values and labels as keys
 * @param  {array}  matches array of matches returned by regex.exec.
 * @param  {array}  labels  array of labels corresponding to the matches.
 * @return {object}         object containing label => matches.
 */
function extractMatches(matches, labels) {
  if (!matches || matches.length <= 1) {
    console.log('Irregular Data');
    console.log(matches);
  } else if (!labels || labels.length === 1) {
    return trim(matches[1]);
  } else {
    return _.reduce(labels, function(memo, label, i) {
      memo[label] = trim(matches[i + 1]);
      return memo;
    }, {});
  }
}


/**
 * Using regex to parse the input text and extract the matches
 * @param  {string} text   input text.
 * @param  {RegExp} regex  parsing RegExp.
 * @param  {array}  labels array of labels corresponding to the matches.
 * @return {object}        object containing label => matches.
 */
function regexParse(text, regex, labels) {
  // i - ignore case, m - multiline
  var reg = new RegExp(regexToStr(regex), 'im'),
      matches = reg.exec(text),
      returnVal = extractMatches(matches, labels);

  return returnVal;
}
exports.regexParse = regexParse;


/**
 * Using regex with the global flag to parse the input text and extract all the matches
 * @param  {string} text   input text.
 * @param  {RegExp} regex  parsing RegExp.
 * @param  {array}  labels array of labels corresponding to the matches.
 * @param  {int}    limit  limit on the number of matches returned.
 * @return {object}        object containing label => matches.
 */
function regexGParse(text, regex, labels, limit) {
  // g - match all, i - ignore case, m - multiline
  var reg = new RegExp(regexToStr(regex), 'gim'),
      returnVal = [],
      matchCount = 0,
      matchLimit = limit || 1000,
      matches,
      tempVal;

  while ((matches = reg.exec(text)) !== null) {
    if (matchCount >= matchLimit) {
      break;
    }
    tempVal = extractMatches(matches, labels);

    returnVal.push(tempVal);
    matchCount++;
  }

  return returnVal;
}
exports.regexGParse = regexGParse;


/**
 * Generates functions that parse lists. The results contain a type that point to the next parser to be used
 * @param  {RegExp} regex     parsing RegExp.
 * @param  {array}  labels    array of labels corresponding to the matches.
 * @param  {string} childType type of the parsed results.
 * @return {array}            object containing label => matches.
 */
exports.listParserGenerator = function listParserGenerator(regex, labels, childType) {
  return function(text) {
    var result = regexGParse(text, regex, labels);
    return _.map(result, function(item) {
      return _.extend(item, {
        type: childType
      });
    });
  };
};


/**
 * [constructURL description]
 * @param  {[type]} path [description].
 * @return {[type]}      [description].
 */
function constructURL(path) {
  if (/^http/.test(path)) {
    return path;
  }

  if (path[0] !== '/') {
    path = '/public_page/' + path;
  }
  return config.BASEURL + path;
}

function genCurlTimingFlag() {
  return ' -w curltiming:%{speed_download}:%{time_total}:%{time_appconnect}';
}

function parseCurlTiming(text) {
  return regexParse(
      text,
      /curltiming:([^:]+):([^:]+):([^:]+)/,
      ['speed', 'totaltime', 'starttime']
  );
}


/**
 * Fetch a url using curl with internal cookie headers in a child process
 * @param  {String}   path url.
 * @param  {Function} cb   callback function to receive the results of fetch
 *                         (err, text, timingInfo).
 * @return {ChildProcess}  ChildProcess executing the curl command.
 */
exports.fetch = function(path, cb) {
  if (!path || path.length === 0) cb(path);

  path = constructURL(path);

  var command = 'curl "' + path + '" --cookie "' + config.COOKIE + '"';

  command += ' -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1464.0 Safari/537.36"';
  command += genCurlTimingFlag();

  return exec(command, function(error, stdout, stderr) {
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


/**
 * Convert a list of [key, value] pairs into an object
 * @param  {Array} pairs Array of 0 or more [key, value] pairs.
 * @return {Object}      Object containing the key value pairings.
 */
exports.pairsToDict = function(pairs) {
  return _.reduce(pairs, function(o, pair) {
    o[pair[0]] = pair[1];
    return o;
  }, {});
};


/**
 * Convert a string to a valid mongoDB key name with the following replacements
 *   \s+  => -
 *   $    => ''
 *   .    => :
 * @param  {String} str Any String.
 * @return {String}     Valid Key.
 */
exports.toKey = function(str) {
  return trim(str).toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\$/g, '')
    .replace(/\./g, ':');
};


/**
 * Convert a string to Title Case
 * @param  {String} str any string.
 * @return {String}     Any String.
 */
exports.toTitleCase = function(str) {
  str = str.replace(/-/g, ' ');
  return str.replace(/\w\S*/g, function(word) {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  });
};


/**
 * Split an array into chunks
 * @param  {Array} arr     an array.
 * @param  {Int} chunkSize chunk size.
 * @return {Array}         an array of chunks.
 */
exports.toChunks = function(arr, chunkSize) {
  return _.values(_.groupBy(arr, function(v, i) {
    return Math.floor(i / chunkSize);
  }));
};


/**
 * trim values in an object
 * @param  {Object} obj an object.
 * @return {Object}     trimmed object.
 */
function trimValues(obj) {
  _.each(obj, function(value, key) {
    obj[key] = trimAll(value);
  });
  return obj;
}


/**
 * trim any data type
 * @param  {Any} data anything.
 * @return {Any}      trimmed input.
 */
function trimAll(data) {
  if (_.isObject(data)) {
    return trimValues(data);
  } else if (_.isArray(data)) {
    return _.map(data, trimAll);
  } else if (_.isString(data)) {
    return trim(data);
  } else {
    return data;
  }
}


/**
 * Wrap function to trim its output
 * @param  {Function} fun any function.
 * @return {Function}     wrapped function.
 */
exports.trimFunctionOutput = function(fun) {
  return function(input) {
    return trimAll(fun(input));
  };
};
