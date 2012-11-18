var userData = require('../models/userdata').userData;
var myUserData = new userData();
var client = require('../models/client').client;
var myClient = new client();
var grant = require('../models/grant').grant;
var myGrant = new grant();

var querystring = require('querystring');

exports.loginPage = function(req, res, next) {

    var session = req.session;

    if(session.user) {
      res.writeHead(303, {Location: '/'});
      return res.end();
    }

    var universities = {unc: "UNC", duke: "Duke", upenn: "UPenn"};

    var uri = ~req.query.next.indexOf('?') ? req.query.next.substr(req.query.next.indexOf('?')+1) : req.query.next;
    var query = querystring.parse(uri);
    var client_id = query.client_id;
    var university = universities[query.uni];
    myClient.findByClientid(client_id, function(result) {

      if(result != false) {
        app_name = result.name;

        var next_url = req.query.next ? req.query.next : '/';

        res.render('login', { title: 'Duke Connect', url: next_url, app_name: app_name, university: university, session: session.email});
      }
    });

  };

exports.loginSubmit = function(req, res, next) {

    var user = req.body.username;
    var pass = req.body.password;

    var uri = ~req.body.next.indexOf('?') ? req.body.next.substr(req.body.next.indexOf('?')+1) : req.body.next;
    var query = querystring.parse(uri);
    var perms = query.perms;
    var university = query.uni;
    var client_id = query.client_id;
    var redirect_uri = query.redirect_uri;

    //Generate unique_identifier using username and univeristy
    var Hashes = require('jshashes/server/lib/hashes');
    var unique_identifier = new Hashes.MD5().hex(user+university);
    req.session.user = unique_identifier;

    //call aces lib and get & store schedule
    var aces = require('../lib/aces').aces;
    var myAces = new aces(user, pass, university);

    myAces.getAcesData(perms, unique_identifier, function(result) {
      if(result == true) {

        //check if perms already given to this app
        console.log("Searching for grant using: "+unique_identifier+" "+client_id+" "+perms);
        myGrant.findGivenPerms(unique_identifier, client_id, perms, function(result) {
          if(result != null) {
            //then redirect with old code
            redirect_uri = redirect_uri+"?code="+result.code;            
            res.writeHead(303, {Location: redirect_uri || '/'});
            res.end();
          }
          else {
            //if not, redirect to permission grant page
            res.writeHead(303, {Location: req.body.next || '/'});
            res.end();
          }
        });

      }
    });

  };

  exports.exchange = function(req, res, next) {

    if(req.session.user) {
          //split perms and fetch data related to each
          var perms = req.session.data.split(',');

          myUserData.findByPerms(req.session.user, perms, function(result) {
            var user_data = result;
            console.log("Final userdata: "+user_data);
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



