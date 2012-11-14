// simple server with a protected resource at /secret secured by OAuth 2

var OAuth2Provider = require('./lib/oauth2provider').OAuth2Provider,
    flash = require('connect-flash'),
    express = require('express'),
    path = require('path'),
    http = require('http'),
    oauth = require('./routes/oauth.js'),
    users = require('./routes/users.js'),
    expressValidator = require('express-validator'),
    MemoryStore = express.session.MemoryStore;

var grant = require('./models/grant').grant;
var myGrant = new grant();
var client = require('./models/client').client;
var myClient = new client();
var querystring = require('querystring');

var app = module.exports = express();

var myOAP = new OAuth2Provider('7335df5e75fb966f241e7ce637c4cbdb', '2c874f517847d927b291bc2bf7f390d4');

// before showing authorization page, make sure the user is logged in
myOAP.on('enforce_login', function(req, res, authorize_url, next) {
  if(req.session.user) {
    next(req.session.user);
  } else {
    res.writeHead(303, {Location: '/login?next=' + encodeURIComponent(authorize_url)});
    res.end();
  }
});

//TODO Move this to oauth.js
// render the authorize form with the submission URL
// use two submit buttons named "allow" and "deny" for the user's choice
myOAP.on('authorize_form', function(req, res, client_id, authorize_url) {
  var session = req.session;
  var legible_perms = {schedule: 'Current Course Schedule', basic_info: "Basic Info (full name & email)", advanced_info: "Advanced Info (phone number)"};
  var perms = querystring.parse(authorize_url).perms.split(",");
  var perm_descriptors = [];
  for(var i in perms) {
    console.log("perm: "+perms[i]);
    perm_descriptors.push(legible_perms[perms[i]]);
  }
  myClient.findByClientid(client_id, function(result) {
      if(result != false) {
        app_name = result.name;
        res.render('permission_page', { title: 'Home', url: authorize_url, app_name: app_name, perms:perm_descriptors, session: session.email});
      }
  });
});

// save the generated grant code for the current user
myOAP.on('save_grant', function(req, client_id, code, perms, next) {
  var perm_array = perms.split(",");
  var perm_json = JSON.stringify(perm_array);
  var insert_data = {
    netid: req.session.user,
    client: client_id,
    code: code,
    perms: perm_json
  }

  myGrant.insert(insert_data, function(result) {
    if(result != true) {
      //an error occured in saving
      console.log('saving error occured: '+result);
    }
  });

  next();
});

// remove the grant when the access token has been sent
myOAP.on('remove_grant', function(user_id, client_id, code) {
  
  myGrant.remove(user_id, client_id, function(result) {
    //could check if deleted here
  });
  
});

// find the user for a particular grant
myOAP.on('lookup_grant', function(client_id, client_secret, code, next) {
  // verify that client id/secret pair are valid
  myClient.findOne(client_id, client_secret, function(result) {
    if(result != false) {
      myGrant.findGivenCode(client_id, code, function(result) {
        if(result != false) {
          next(null, result.netid);
        }
        else {
          next(new Error('no such grant found'));
        }
      });
    }
  });


});

// embed an opaque value in the generated access token
myOAP.on('create_access_token', function(user_id, client_id, perms, next) {
  next(perms);
});

// (optional) do something with the generated access token
myOAP.on('save_access_token', function(user_id, client_id, access_token) {
  console.log('saving access token %s for user_id=%s client_id=%s', access_token, user_id, client_id);
});

// an access token was received in a URL query string parameter or HTTP header
myOAP.on('access_token', function(req, token, next) {
  var TOKEN_TTL = 10000 * 60 * 1000; // 10 minutes

  if(token.grant_date.getTime() + TOKEN_TTL > Date.now()) {
    req.session.user = token.user_id;
    req.session.data = token.extra_data;
  } else {
    console.warn('access token for user %s has expired', token.user_id);
  }

  next();
});


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
app.get('/secret', oauth.secret);
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
