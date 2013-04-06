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
server.get('/list/department-code', routes.listDepartmentCode);
server.get('/list/program', routes.listPrograms);
server.get('/list/school', routes.listSchools);
server.get('/list/term', routes.listTerm);
server.get('/list/event-type', routes.listEventType);
server.get('/list/event-venue', routes.listEventVenue);

server.get('/list/department/:department', routes.listclass);
server.get('/list/department/:department/class/:number', routes.listterm);
server.get('/list/department/:department/class/:number/term/:title', routes.listsection);

server.get('/department', routes.departments);
server.get('/department/:id', routes.departmentById);

server.get('/class', routes.classes);
server.get('/class/:id', routes.classById);
server.get('/class/department/:department', routes.classes);
server.get('/class/department/:department/number/:number', routes.class);
server.get('/class/department/:department/number/:number/term', routes.classTerm);
server.get('/class/department/:department/number/:number/term/:title', routes.classSection);
server.get('/class/term/:title', routes.classByTerm);
server.get('/class/term/:title/department/:department', routes.classByTerm);

server.get('/term/:id', routes.termById);
server.get('/section/:id', routes.sectionById);

server.get('/history/:id', routes.classHistoryById);
server.get('/history/department/:department/number/:number', routes.classHistory);

server.get('/evaluation/:id', routes.evaluationById);
server.get('/evaluation/department/:department/class/:number', routes.evaluation);

server.get('/event', routes.event);
server.get('/event/:id', routes.eventById);
server.get(/event\/category\/([A-Za-z0-9\/]+)/, routes.eventByCategory);
server.get('/event/venue/:location', routes.eventByVenue);
// server.get('/event/month/:month', routes.eventByMonth);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
