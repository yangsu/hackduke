// Node Modules
var https = require('https')
  , querystring = require('querystring');

// Other Dependencies
var _ = require('lodash');

// Local Modules
var parsers = require('./parsers');

// Index of the current item being processed in the queue
var index = 0;

// initialized queue with the root page
var queue = [{
  type: 'base',
  path: 'course_catalog.php?action=Catalog'
}];

// Cookie necessary to make https requests for aces
var cookie = querystring.stringify({
  PHPSESSID: 'rej3a4u96kvl899r6mip8132o1'
}, ';', '=');

/**
 * Read the current item in the queue
 * Makes https requests to fetch the next page if item.path exists
 * @param  {object} item item containing parsed data and urls
 */
function fetch(item) {
  if (!item || !item.path) {
    process.nextTick(processNext);
    return;
  }

  var starttime = Date.now()
    , path;

  // Process absolutel and relative links
  if (item.path[0] === '/') {
    path = item.path;
  } else {
    path = '/public_page/' + item.path
  }

  // Https options
  var options = {
    host: 'm.siss.duke.edu',
    port: 443,
    path: path,
    method: 'GET',
    headers: {
      Cookie: cookie
    }
  };

  // makes request and process the data once the download is complete
  var req = https.request(options, function(res) {
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

/**
 * Process the next step in the queue
 * If there are no more items, write the data to a json file
 */
function processNext () {
  console.log('processNext', index, '/',queue.length);

  if (index < queue.length) {
    fetch(queue[index++]);
  } else {
    var fs = require('fs');
    fs.writeFile('maces-'+Date.now()+'.json', JSON.stringify(queue, null, 4), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Data JSON file was saved!");
        }
        process.exit(0);
    });
  }
};

// start processor
processNext();
