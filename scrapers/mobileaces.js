// Node Modules
var https = require('https')
  , querystring = require('querystring');

var _ = require('lodash');

var data = {};

var cookie = querystring.stringify({
  PHPSESSID: 'rej3a4u96kvl899r6mip8132o1'
}, ';', '=');

var qs = querystring.stringify({
  action: 'Catalog'
});

var options = {
  host: 'm.siss.duke.edu',
  port: 443,
  path: '/public_page/course_catalog.php?' + qs,
  method: 'GET',
  headers: {
    Cookie: cookie
  }
};

var req = https.request(options, function(res) {
  // console.log("statusCode: ", res.statusCode);
  // console.log("headers: ", res.headers);
  res.on('data', function(chunk) {
    var text = chunk.toString();
    console.log(parseBaseCat(text));
  });
});
req.end();

req.on('error', function(e) {
  console.error(e);
});

function escapeRegex(regex) {
  return regex.replace(/([\/])/g, "\\$1");
};

function parseBaseCat(text) {
  var reg = '<a href="([^"]+)"><h6>(\\w+)</h6><br/><p[^>]+>([^<]+)</p>';
  return parseRegex(text, reg, ['link', 'letter', 'label']);
};

function parseRegex(text, regex, labels) {
  // match all, ignore case
  var reg = new RegExp(escapeRegex(regex), 'gi');
  var returnVal = [];
  var matches, tempVal;

  while ((matches = reg.exec(text)) !== null) {
    tempVal = _.reduce(labels, function (memo, label, i) {
      memo[label] = matches[i + 1];
      return memo;
    }, {});
    returnVal.push(tempVal);
  }
  return returnVal;
};