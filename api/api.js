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

server.get('/list/academic-organization', routes.listAcademicOrgs);
server.get('/list/department', routes.listDepartment);
server.get('/list/departmentCode', routes.listDepartmentCode);
server.get('/list/program', routes.listPrograms);
server.get('/list/school', routes.listSchools);
server.get('/list/term', routes.listTerm);

server.get('/list/department/:department', routes.listclass);
server.get('/list/department/:department/class/:number', routes.listterm);
server.get('/list/department/:department/class/:number/term/:title', routes.listsection);

server.get('/department', routes.departments);

server.get('/class/department/:department/class/:number', routes.class);

server.get('/department/:id', routes.departmentById);
server.get('/class/:id', routes.classById);
server.get('/term/:id', routes.termById);
server.get('/section/:id', routes.sectionById);

server.get('/classes', routes.classes);
server.get('/classes/department/:department', routes.classes);

server.get('/evaluation/department/:department/class/:number', routes.evaluation);
// server.get('/evaluation/course_id/:cid/class_id/:section', routes.evaluation);


server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
