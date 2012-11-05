// Node Modules
var https = require('https')
  , querystring = require('querystring');

var _ = require('lodash');

var data = {}
  , queue = []
  , index = 0;

var cookie = querystring.stringify({
  PHPSESSID: 'rej3a4u96kvl899r6mip8132o1'
}, ';', '=');

var base = {
  type: 'base',
  path: 'course_catalog.php?action=Catalog'
};

queue.push(base);

var parsers = {};

function fetch(item) {
  if (!item || !item.path) return;
  console.log('fetching',item.path);
  var options = {
    host: 'm.siss.duke.edu',
    port: 443,
    path: '/public_page/' + item.path,
    method: 'GET',
    headers: {
      Cookie: cookie
    }
  };

  var req = https.request(options, function(res) {
    // console.log("statusCode: ", res.statusCode);
    // console.log("headers: ", res.headers);
    var text = '';

    res.on('data', function(chunk) {
      text += chunk.toString();
    });

    res.on('end', function () {
      var result = parsers[item.type](text);
      console.log(text);
      queue = queue.concat(result);
      process.nextTick(processNext);
    });

  });
  req.end();

  req.on('error', function(e) {
    console.error(e);
  });
};

function processNext () {
  console.log('processNext', index, '/',queue.length);
  if (index < queue.length) {
    fetch(queue[index++]);
    console.log(queue);
  } else {
    process.exit(0);
  }
};

processNext();

function escapeRegex(regex) {
  return regex.replace(/([\/])/g, "\\$1");
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