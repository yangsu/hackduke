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

server.get('/list.json/department', routes.listdepartment);
server.get('/list.json/department/:department', routes.listclass);
server.get('/list.json/department/:department/class/:number', routes.listterm);
server.get('/list.json/department/:department/class/:number/term/:title', routes.listsection);

server.get('/department.json', routes.departments);
server.get('/department.json/:id', routes.departmentById);

server.get('/class.json/department/:department/class/:number', routes.class);
server.get('/class.json/:id', routes.classById);

server.get('/class.json', routes.classes);

server.get('/classes.json/department/:department', routes.classes);

server.get('/evaluation.json/department/:department/class/:number', routes.evaluation);
// server.get('/evaluation.json/course_id/:cid/class_id/:section', routes.evaluation);


server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
