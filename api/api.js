var _ = require('lodash')
  , bunyan = require('bunyan')
  , mongoose = require('mongoose')
  , restify = require('restify');

var name = 'Duke API';
var version = '0.1.0';
var timeout = 500;

var log = bunyan.createLogger({
  name: name
});

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  return next();
}

var server = restify.createServer({
  name: name,
  version: version
});

server.pre(restify.pre.userAgentConnection());

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser({ mapParams: false }));
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.gzipResponse());

server.use(function slowHandler(req, res, next) {
  setTimeout(function() {
    return next();
  }, timeout);
});

server.use(restify.throttle({
  burst: 100,
  rate: 50, //per second
  ip: true,
  overrides: {
    '0.0.0.0': { rate: 0, burst: 0 }
  }
}));

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
