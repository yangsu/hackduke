// simple server with a protected resource at /secret secured by OAuth 2
var flash = require('connect-flash'),
    express = require('express'),
    path = require('path'),
    http = require('http'),
    oauth = require('./routes/oauth.js'),
    developer = require('./routes/developer.js'),
    expressValidator = require('express-validator'),
    MemoryStore = express.session.MemoryStore,
    OAuth2Provider = require('./lib/oauth2provider').OAuth2Provider;

var myOAP = new OAuth2Provider('7335df5e75fb966f241e7ce637c4cbdb', '2c874f517847d927b291bc2bf7f390d4');

var app = module.exports = express();

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


app.get('/', developer.home);

//OAUTH routes
app.get('/login', oauth.loginPage);
app.post('/login', oauth.loginSubmit);
app.get('/exchange', oauth.exchange);

//Developper page routes
app.get('/signup', developer.getUserInfo);
app.delete('/client/:id', developer.remove); //Fix all routes to be REST for client
app.post('/client', developer.addApp);
app.get('/profile', developer.profile);
app.get('/documentation', developer.documentation);
app.get('/logout', developer.logout);

app.listen(8081);

function escape_entities(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
