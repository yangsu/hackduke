// Node Modules
var https = require('https')
  , querystring = require('querystring');

// Other Dependencies
var _ = require('lodash');

// Local Modules
var parsers = require('./parsers');

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

function fetch(item) {
  if (!item || !item.path) return;

  var starttime = Date.now();
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
      queue = queue.concat(result);
      process.nextTick(processNext);

      console.log('fetching',item.path, 'in', (Date.now() - starttime)/1000, 's');
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
    // console.log(queue);
  } else {
    process.exit(0);
  }
};

processNext();
