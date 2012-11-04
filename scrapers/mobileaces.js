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

var parsers = {
  base: parseBaseCat,
  letter: parseLetter,
  classes: parseClasses,
  class: parseClass
};

function fetch(item) {
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
  } else {
    console.log(queue);
    process.exit(0);
  }
};

processNext();

function escapeRegex(regex) {
  return regex.replace(/([\/])/g, "\\$1");
};

function parseBaseCat(text) {
  var reg = '<a href="([^"]+)"><h6>([^<]+)</h6><br/><p[^>]+>([^<]+)</p>'
    , result = parseRegex(text, reg, ['path', 'letter', 'label']);
  return _.map(result, function (item) {
    return _.extend(item, {
      type: 'letter'
    })
  });
};

function parseLetter(text) {
  var reg = '<li><a href="([^"]+subject=(\\w+)[^"]+)">([^<]+)</a></li>'
    , result = parseRegex(text, reg, ['path', 'subject', 'label']);
  return _.map(result, function (item) {
    return _.extend(item, {
      type: 'classes'
    })
  });
};

function parseClasses(text) {
  var reg = '<li><a href="([^"]+class=(\\w+)[^"]+)"><h4>([^<]+)</h4>'
    , result = parseRegex(text, reg, ['path', 'class', 'label']);
  return _.map(result, function (item) {
    return _.extend(item, {
      type: 'class'
    })
  });
};

function parseClass(text) {
  // var reg = '<li><a href="([^"]+class=(\\w+)[^"]+)"><h4>([^<]+)</h4></a></li>'
  //   , result = parseRegex(text, reg, ['path', 'class', 'label']);
  // return _.map(result, function (item) {
  //   return _.extend(item, {
  //     type: 'class'
  //   })
  // });
};

function parseRegex(text, regex, labels) {
  // match all, ignore case
  var reg = new RegExp(escapeRegex(regex), 'gi');
  var returnVal = [];
  var matches, tempVal;

  if ((matches = reg.exec(text)) !== null) {
    tempVal = _.reduce(labels, function (memo, label, i) {
      memo[label] = matches[i + 1];
      return memo;
    }, {});
    returnVal.push(tempVal);
  }
  return returnVal;
};