var https = require('https')
  , querystring = require('querystring');

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
    parseBaseCat(text);
  });
});
req.end();

req.on('error', function(e) {
  console.error(e);
});

function parseBaseCat(text) {
  var myRe = /<a[^>]*><h6>(\w+)<\/h6><br\/><p[^>]+>([^<]+)<\/p>/g;
  var matches;
  while ((matches = myRe.exec(text)) !== null) {
    var msg = "Found " + matches.slice(1).join(',');
    console.log(msg);
  }
};