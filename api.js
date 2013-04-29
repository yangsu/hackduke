var bunyan = require('bunyan')
  , restify = require('restify');

var config = require('./config');

var log = bunyan.createLogger({
  name: config.name
});

var server = restify.createServer({
  name: config.name,
  version: config.version
});

server.pre(restify.pre.userAgentConnection());

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser({ mapParams: false }));
server.use(restify.bodyParser({ mapParams: false }));
// server.use(restify.gzipResponse());
server.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
})

server.use(restify.throttle({
  burst: 200,
  rate: 100, //per second
  ip: true,
  overrides: {
    'www.hackduke.com': { rate: 0, burst: 0 }
  }
}));

server.get('/', restify.serveStatic({
  directory: './docs/',
  default: 'index.html'
}));
server.get(/^\/.+\.js$/, restify.serveStatic({
  directory: './docs/'
}));
server.get(/^\/css\/.+\.css$/, restify.serveStatic({
  directory: './docs/'
}));
server.get(/^\/images\/.+\.(png|gif)$/, restify.serveStatic({
  directory: './docs/'
}));

require('./apidoc')(function(err, docs) {
  server.get('/apidoc', function(req, res, next) {
    return res.json(docs.api);
  });
  server.get('/apidoc/:resource', function(req, res, next) {
    return res.json(docs[req.params.resource]);
  });
});

server.get(/^\/\w+\.(html|json|png)/, restify.serveStatic({
  directory: './sampleapps/'
}));

var routes = require('./routes');

var list = routes.list;
server.get('/list/academic-organization', list.academicOrgs);
server.get('/list/academic-programs', list.directoryProgram);
server.get('/list/department', list.department);
server.get('/list/department-code', list.departmentCode);
server.get('/list/department/:department', list.class);
server.get('/list/department/:department/class/:number', list.term);
server.get('/list/department/:department/class/:number/term/:title', list.section);
server.get('/list/education-affiliation', list.educationalAffiliation);
server.get('/list/event-category', list.eventCategory);
server.get('/list/event-host', list.eventHost);
server.get('/list/event-venue', list.eventVenue);
server.get('/list/graduation-term', list.directoryGraduationTerm);
server.get('/list/location', list.location);
server.get('/list/marker', list.marker);
server.get('/list/marker-category', list.markerCategory);
server.get('/list/program', list.programs);
server.get('/list/school', list.schools);
server.get('/list/term', list.term);

var department = routes.department;
server.get('/department', department.index);
server.get('/department/:id', department.byId);

var cls = routes.class;
server.get('/class', cls.classes);
server.get('/class/:id', cls.byId);
server.get('/class/department/:department', cls.classes);
server.get('/class/department/:department/number/:number', cls.index);
server.get('/class/department/:department/number/:number/evaluation', cls.evaluation);
server.get('/class/department/:department/number/:number/term', cls.term);
server.get('/class/department/:department/number/:number/term/:title', cls.section);
server.get('/class/term/:title', cls.byTerm);
server.get('/class/term/:title/department/:department', cls.byTerm);
server.get('/class/history/department/:department/number/:number', cls.history);

server.get('/evaluation/:id', cls.evaluationById);
server.get('/history/:id', cls.historyById);
server.get('/section/:id', cls.sectionById);
server.get('/term/:id', cls.termById);

var event = routes.event;
server.get('/event', event.index);
server.get('/event/:id', event.byId);
server.get(/event\/category\/(.+)/, event.byCategory);
server.get('/event/venue/:location', event.byVenue);
server.get('/event/host/:host', event.byHost);
server.get('/event/date/:year/:month', event.byMonth);
server.get('/event/date/:year/:month/:day', event.byDate);
server.get('/event/date/today', event.today);
server.get('/event/date/this-week', event.thisWeek);

var location = routes.location;
server.get('/location', location.index);
server.get('/location/:id', location.byId);
server.get('/location/building-id/:id', location.byBuildingId);
server.get('/location/name/:name', location.byName);

var marker = routes.marker;
server.get('/marker', marker.index);
server.get('/marker/:id', marker.byId);
server.get('/marker/marker-id/:id', marker.byMarkerId);
server.get('/marker/name/:name', marker.byName);
server.get('/marker/category/:category', marker.byCategory);

var directory = routes.directory;
server.get('/directory', directory.index);
server.get('/directory/:id', directory.byId);
server.get('/directory/netid/:netid', directory.byNetId);
server.get('/directory/phone/:phone', directory.byPhone);
server.get('/directory/affiliation/:affiliation', directory.byAffiliation);
server.get('/directory/program/:program', directory.byProgram);
server.get('/directory/program/:program/class/:class', directory.byProgramClass);
server.get('/directory/program/:program/graduation-term/:term', directory.byProgramGraduation);

var port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
