var mongo = require('mongodb');

var Server = mongo.Server,
  Db = mongo.Db,
  BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('dukeconnect', server);

db.open(function(err, db) {
  if(!err) {
    console.log("connected to 'dukeconnect' database");
    db.collection('userdata', {safe:true}, function(err, collection) {
      if(err) {
        console.log("The 'userdata' collection doesnt exist. Creating it with sample data...");
        populateData();
      }
    });
  }
});

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

      //Store it into the DB
      db.collection('userdata', function(err, collection) {
        collection.insert(insert_data, {safe:true}, function(err, result) {
          if(err) {
            res.send({'error':'An error has occured'});
          }
          else {
            console.log("success: " + JSON.stringify(result[0]));
            res.writeHead(303, {Location: req.body.next || '/'});
            res.end();
          }
        });
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

    if(req.session.user) {
        db.collection('userdata', function(err, collection) {
          collection.findOne({ netid: req.session.user}, function(err, item) {
            if(err) {
              res.send("error: "+err);
            }
            else {
              res.send(item);
            }
          });
        });
    }
    else {
      res.writeHead(403);
      res.end('permissions denied');
    }

  };

  /*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateData = function() {

    var userdata = [
    {
        netid: "flb5",
        data: "['COMPSCI 250-001 LEC (1721)','COMPSCI 250-01R REC (1722)','COMPSCI 330-001 LEC (1730)','COMPSCI 330-01R REC (1731)','ECON 462-01 LEC (3179)','PHYSICS 136-01 LEC (2605)' ]"
    },
    ];

    db.collection('userdata', function(err, collection) {
        collection.insert(userdata, {safe:true}, function(err, result) {});
    });

};



