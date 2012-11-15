// simple server with a protected resource at /secret secured by OAuth 2
var flash = require('connect-flash'),
    express = require('express'),
    path = require('path'),
    http = require('http'),
    oauth = require('./routes/oauth.js'),
    users = require('./routes/users.js'),
    expressValidator = require('express-validator'),
    MemoryStore = express.session.MemoryStore;

var app = module.exports = express();

var myOAP = require('./lib/oap');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(expressValidator);
app.use(express.query());
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.session({store: new MemoryStore({reapInterval: 50 * 60 * 1000}), secret: 'abracadabra'}));
app.use(flash());
app.use(myOAP.oauth());
app.use(myOAP.login());
app.use(app.router);


app.get('/', users.home);

//OAUTH routes
app.get('/login', oauth.loginPage);
app.post('/login', oauth.loginSubmit);
app.get('/exchange', oauth.exchange);

//Developper page routes
app.get('/signup', users.getUserInfo);
app.delete('/client/:id', users.remove); //Fix all routes to be REST for client
app.post('/client', users.addApp);
app.get('/profile', users.profile);
app.get('/documentation', users.documentation);
app.get('/logout', users.logout);

app.listen(8081);

function escape_entities(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
