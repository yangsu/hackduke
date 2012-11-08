var userData = require('../models/userdata').userData;
var myUserData = new userData();

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
    var sys = require('sys')
    var exec = require('child_process').exec;

    var user = req.body.username;
    var pass = req.body.password;
    req.session.user = user;
    var schedule = "temp";

    var command = "ruby ../scrapers/authenticated_scrapes/mechanize.rb "+user+" "+pass;
    // executes script that gets course from ACES
    var child = exec(command, function (error, stdout, stderr) {
      console.log(error+" "+stderr+" "+command);
      schedule = stdout;

      var insert_data = {
      netid: req.session.user,
      data: schedule
    };

      myUserData.insert(insert_data, function(worked) {
        console.log(worked+" returned");
        if(worked == true) {
          res.writeHead(303, {Location: req.body.next || '/'});
          res.end();
        }
      });

      if (error !== null) {
          console.log('exec error: ' + error);
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

    var schedule = "temp";
    if(req.session.user) {
        myUserData.findOne(req.session.user, function(result) {
          schedule = result;
          myUserData.remove(req.session.user, function(result) {
            if(result == true) {
              res.send(schedule);
            }
          });
        });
    }
    else {
      res.writeHead(403);
      res.end('permissions denied');
    }

  };



