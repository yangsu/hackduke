var grant = require('../models/grant').grant;
var myGrant = new grant();

var userData = require('../models/userdata').userData;
var myUserData = new userData();

var client = require('../models/client').client;
var myClient = new client();

var aces = require('../lib/aces').aces;

var querystring = require('querystring');

exports.loginPage = function(req, res, next) {

    var session = req.session;

    if(session.user) {
      res.writeHead(303, {Location: '/'});
      return res.end();
    }

    var client = querystring.parse(req.query.next);
    var client_id = client["/oauth/authorize?client_id"]; //this is a querystring hack (refactor)
    myClient.findByClientid(client_id, function(result) {

      if(result != false) {
        app_name = result.name;

        var next_url = req.query.next ? req.query.next : '/';

        res.render('login', { title: 'Duke Connect', url: next_url, app_name: app_name, session: session.email});
      }
    });

  };

exports.loginSubmit = function(req, res, next) {

    var user = req.body.username;
    var pass = req.body.password;
    req.session.user = user;

    var query = querystring.parse(req.body.next);
    var perms = query.perms;

    //call aces lib and get & store schedule
    var myAces = new aces(user, pass);

    myAces.getAcesData(perms, function(result) {
      if(result == true) {
        res.writeHead(303, {Location: req.body.next || '/'});
        res.end();
      }
    });

  };

exports.secret = function(req, res, next) {
    if(req.session.user) {
      res.end('proceed to secret lair, extra data: ' + JSON.stringify(req.session.data));
    } else {
      res.writeHead(403);
      res.end('no');
    }
  };

  exports.exchange = function(req, res, next) {

    if(req.session.user) {
          //split perms and fetch data related to each
          console.log("Final perms: "+req.session.data);
          var perms = req.session.data.split(',');

          myUserData.findByPerms(req.session.user, perms, function(result) {
            var user_data = result;
            myUserData.remove(req.session.user, function(result) {
                  if(result == true) {
                    //delete users session and send data to app
                    delete req.session.user;
                    res.send(user_data);
                  }
                });
              });

    }
    else {
      res.writeHead(403);
      res.end('permissions denied');
    }

  };



