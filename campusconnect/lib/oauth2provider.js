/**
 * index.js
 * OAuth 2.0 provider
 *
 * @author Amir Malik & Fabio Berger
 */

var grant = require('../models/grant').grant;
var myGrant = new grant();
var client = require('../models/client').client;
var myClient = new client();

var EventEmitter = require('events').EventEmitter,
     querystring = require('querystring'),
      serializer = require('serializer');

/* OAuth2Provider('encryption secret', 'signing secret'); */
function OAuth2Provider(crypt_key, sign_key) {
  this.serializer = serializer.createSecureSerializer(crypt_key, sign_key);
}

OAuth2Provider.prototype = new EventEmitter();

OAuth2Provider.prototype.generateAccessToken = function(user_id, client_id, extra_data) {
  var out = {
    access_token: this.serializer.stringify([user_id, client_id, +new Date, extra_data]),
    refresh_token: null,
  };

  return out;
};

OAuth2Provider.prototype.login = function() {

  var self = this;

  return function(req, res, next) {

    var data, atok, user_id, client_id, grant_date, extra_data;

    if(req.query['access_token']) {
      atok = req.query['access_token'];
    } else if((req.headers['authorization'] || '').indexOf('Bearer ') == 0) {
      atok = req.headers['authorization'].replace('Bearer', '').trim();
    } else {
      return next();
    }

    try {
      data = self.serializer.parse(atok);
      user_id = data[0];
      client_id = data[1];
      grant_date = new Date(data[2]);
      extra_data = data[3];
    } catch(e) {
      res.writeHead(400);
      return res.end(e.message);
    }

    var token = {
      user_id: user_id,
      client_id: client_id,
      extra_data: extra_data,
      grant_date: grant_date
    };

    var TOKEN_TTL = 10000 * 60 * 1000; // 10 minutes

    if(token.grant_date.getTime() + TOKEN_TTL > Date.now()) {
      req.session.user = token.user_id;
      req.session.data = token.extra_data;
    } else {
      console.warn('access token for user %s has expired', token.user_id);
    }

    next();

  }

};


OAuth2Provider.prototype.oauth = function() {

  var self = this;

  return function(req, res, next) {
    var session = req.session;

    var uri = ~req.url.indexOf('?') ? req.url.substr(0, req.url.indexOf('?')) : req.url;

    if(req.method == 'GET' && '/oauth/authorize' == uri) {

      console.log("prototype oauth GET called");

      var    client_id = req.query.client_id,
          redirect_uri = req.query.redirect_uri;

      if(!client_id || !redirect_uri) {
        res.writeHead(400);
        return res.end('client_id and redirect_uri required');
      }

      // authorization form will be POSTed to same URL, so we'll have all params
      var authorize_url = req.url;

      if(req.session.user) {
        var user_id = req.session.user;

          // store user_id in an HMAC-protected encrypted query param
        authorize_url += '&' + querystring.stringify({x_user_id: self.serializer.stringify(user_id)});

        // user is logged in, render approval page
        var legible_perms = {
          schedule: 'Current Course Schedule', 
          basic_info: "Basic Info (full name & email)", 
          advanced_info: "Advanced Info (phone number)", 
          transcript: "Full university transcript (highschool credits, degree, grades)"};
        var perms = querystring.parse(authorize_url).perms.split(",");
        var perm_descriptors = [];
        for(var i in perms) {
          console.log("perm: "+perms[i]);
          perm_descriptors.push(legible_perms[perms[i]]);
        }
        myClient.findByClientid(client_id, function(result) {
            if(result != false) {
              app_name = (Object.keys(result).length === 0) ? "App" : result.name;
              res.render('permission_page', { title: 'Home', url: authorize_url, app_name: app_name, perms:perm_descriptors, session: session.email});
            }
        });
      } 
      else {
        res.writeHead(303, {Location: '/login?next=' + encodeURIComponent(authorize_url)});
        res.end();
      }

      
    } else if(req.method == 'POST' && '/oauth/authorize' == uri) {

      console.log("prototype oauth POST called");

      var     client_id = req.query.client_id,
           redirect_uri = req.query.redirect_uri,
          response_type = req.query.response_type || 'code',
                  state = req.query.state,
              x_user_id = req.query.x_user_id,
                  perms = req.query.perms;

      var url = redirect_uri;

      switch(response_type) {
        case 'code': url += '?'; break;
        case 'token': url += '#'; break;
        default:
          res.writeHead(400);
          return res.end('invalid response_type requested');
      }

      if('allow' in req.body) {
        if('token' == response_type) {
          var user_id;

          try {
            user_id = self.serializer.parse(x_user_id);
          } catch(e) {
            console.error('allow/token error', e.stack);

            res.writeHead(500);
            return res.end(e.message);
          }

          var atok = self.generateAccessToken(user_id, client_id, perms);

          url += querystring.stringify(atok);

          res.writeHead(303, {Location: url});
          res.end();
          
        } else {

          var code = serializer.randomString(128);
          
          var perm_array = perms.split(",");

          myGrant.update(perm_array, client_id, req.session.user, code, function(result) {
            if(result != true) {
              //an error occured in saving
              console.log('update error occured: '+result);
            }
            else {
              var extras = {
              code: code,
              };

              // pass back anti-CSRF opaque value
              if(state)
                extras['state'] = state;

              url += querystring.stringify(extras);
              res.writeHead(303, {Location: url});
              res.end();
            }
          });

        }
      } else {
        url += querystring.stringify({error: 'access_denied'});

        res.writeHead(303, {Location: url});
        res.end();
      }

    } else if(req.method == 'POST' && '/oauth/access_token' == uri) {

      var     client_id = req.body.client_id,
          client_secret = req.body.client_secret,
           redirect_uri = req.body.redirect_uri,
            code = req.body.code,
            perms = req.body.perms;


        myClient.findOne(client_id, client_secret, function(result) {
          if(result != false) {
            myGrant.findGivenCode(client_id, code, function(result) {
              if(result != false) {
                var user_id = result.unique_identifier;

                res.writeHead(200, {'Content-type': 'application/json'});
        
                var atok = self.generateAccessToken(user_id, client_id, perms);

                res.end(JSON.stringify(self.generateAccessToken(user_id, client_id, perms)));
              }
              else {
                next(new Error('no such grant found'));
              }
            });
          }
        });

        
    } else {
      return next();
    }
  };
};

exports.OAuth2Provider = OAuth2Provider;
