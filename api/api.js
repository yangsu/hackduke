var bunyan = require('bunyan')
  , restify = require('restify');

var name = 'Duke API';
var version = '0.1.0';

var log = bunyan.createLogger({
  name: name
});

var server = restify.createServer({
  name: name,
  version: version
});

server.pre(restify.pre.userAgentConnection());

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser({ mapParams: false }));
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.gzipResponse());

server.use(restify.throttle({
  burst: 100,
  rate: 50, //per second
  ip: true,
  overrides: {
    '0.0.0.0': { rate: 0, burst: 0 }
  }
}));

var routes = require('./routes');
server.get('/department.json', routes.departments);
server.get('/departmentlist.json', routes.departmentlist);

server.get('/class.json/department/:department/class/:number', routes.class);
server.get('/class.json/department/:department', routes.classes);
server.get('/class.json', routes.classes);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
