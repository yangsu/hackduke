// simple server with a protected resource at /secret secured by OAuth 2

var OAuth2Provider = require('./lib/oauth2provider').OAuth2Provider,
    express = require('express'),
    path = require('path'),
    http = require('http'),
    oauth = require('./routes/oauth.js'),
    MemoryStore = express.session.MemoryStore;

var grant = require('./models/grant').grant;
var myGrant = new grant();

var client = require('./models/client').client;
var myClient = new client();

var app = module.exports = express();

var myOAP = new OAuth2Provider('encryption secret', 'signing secret');

// before showing authorization page, make sure the user is logged in
myOAP.on('enforce_login', function(req, res, authorize_url, next) {
  if(req.session.user) {
    next(req.session.user);
  } else {
    res.writeHead(303, {Location: '/login?next=' + encodeURIComponent(authorize_url)});
    res.end();
  }
});

// render the authorize form with the submission URL
// use two submit buttons named "allow" and "deny" for the user's choice
myOAP.on('authorize_form', function(req, res, client_id, authorize_url) {
  res.render('permission_page', { title: 'Home', url: authorize_url});
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
  /*
  myGrant.remove(user_id, client_id, function(result) {
    //could check if deleted here
  });
  */
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
  console.log("Access token listener called!");
  var TOKEN_TTL = 10 * 60 * 1000; // 10 minutes

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
app.use(express.query());
app.use(express.cookieParser());
app.use(express.session({store: new MemoryStore({reapInterval: 50 * 60 * 1000}), secret: 'abracadabra'}));
app.use(myOAP.oauth());
app.use(myOAP.login());
app.use(app.router);
app.use(express.static(__dirname + '/public'));


app.get('/', oauth.home);
app.get('/login', oauth.loginPage);
app.post('/login', oauth.loginSubmit);
app.get('/logout', oauth.logout);
app.get('/secret', oauth.secret);
app.get('/exchange', oauth.exchange);

app.listen(8081);

function escape_entities(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
