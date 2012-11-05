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
  if (!item || !item.path) {
    process.nextTick(processNext);
    return;
  }

  var starttime = Date.now()
    , path;

  if (item.path[0] === '/') {
    path = item.path;
  } else {
    path = '/public_page/' + item.path
  }

  var options = {
    host: 'm.siss.duke.edu',
    port: 443,
    path: path,
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
      console.log('fetched',item.path, 'in', (Date.now() - starttime)/1000, 's');
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
  } else {
    var fs = require('fs');
    fs.writeFile('data.json', JSON.stringify(queue, null, 4), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Data JSON file was saved!");
        }
        process.exit(0);
    });
  }
};

processNext();
