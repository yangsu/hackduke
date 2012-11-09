var grant = require('../models/grant').grant;
var myGrant = new grant();

var userData = require('../models/userdata').userData;
var myUserData = new userData();

var aces = require('../lib/aces').aces;

exports.home =  function(req, res, next) {
    res.end('home, logged in? ' + !!req.session.user);
  };

exports.loginPage = function(req, res, next) {

    console.log('login tests: '+JSON.stringify(req.session.user));

    if(req.session.user) {
      res.writeHead(303, {Location: '/'});
      return res.end();
    }

    var next_url = req.query.next ? req.query.next : '/';

    res.render('login', { title: 'Duke Connect', url: next_url});

  };

exports.loginSubmit = function(req, res, next) {

    var user = req.body.username;
    var pass = req.body.password;
    req.session.user = user;

    //call aces lib and get & store schedule
    var myAces = new aces(user, pass);

    myAces.getSchedule(function(result) {
      console.log("Aces returned: "+result);
      if(result == true) {
        res.writeHead(303, {Location: req.body.next || '/'});
        res.end();
      }
    });

  };

exports.logout = function(req, res, next) {
    req.session.destroy(function(err) {
      res.writeHead(303, {Location: '/'});
      res.end();
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

    //TODO: Make this function work asyncronously for multiple perms
    if(req.session.user) {
          //split perms and fetch data related to each
          var perms = req.session.data.split(',');

          myUserData.findByPerms(req.session.user, perms, function(result) {
            var user_data = result;
            myUserData.remove(req.session.user, function(result) {
                  if(result == true) {
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



