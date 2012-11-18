var Shred = require("shred");
var shred = new Shred();

var developer = require('../models/developer').developer;
var myDeveloper = new developer();

var client = require('../models/client').client;
var myClient = new client();

exports.home =  function(req, res) {
  var session = req.session;
  res.render('home', { title: 'CampusConnect', session: session.email});
};

exports.addApp = function(req, res) {

  var session = req.session;

  //make sure logged in
  if(!session.email) {
    res.writeHead(302, {
      'Location': '/'
    });
    res.end();
  }

  req.assert('appname', 'Invaid App name').notEmpty().len(3, 20);

  req.sanitize('appname');

  var errors = req.validationErrors();
  if (errors) {
    req.flash('error', "Your app name must be between 3 and 20 characters");
    return res.redirect('back');
  }

  var name = req.body.appname;

  // generate public key, secret and create new app
  var Hashes = require('jshashes/server/lib/hashes');

  var currTimestamp = Math.round((new Date()).getTime() / 1000);
  var randomNumberId = Math.floor(Math.random()*2500);
  var randomNumberSecret = Math.floor(Math.random()*7500);

  var uncryp_client_id = session.email+currTimestamp+randomNumberId;
  var uncryp_client_secret = randomNumberSecret+session.email+currTimestamp;
  var client_id = new Hashes.MD5().hex(uncryp_client_id);
  var client_secret = new Hashes.MD5().hex(uncryp_client_secret);

  //get user_id
  myDeveloper.findOne(session.email, function(result) {
    var user_id = result._id;

    myClient.findTotal(user_id, function(result) {
      if(result >= 5) {
        req.flash('error', "You have reached your App limit of 5. Delete one to add a new one.")
        res.redirect('back');
      }
      else {
        var insert_data = {
          name: name,
          client_id: client_id,
          client_secret: client_secret,
          user_id: user_id
        }

        myClient.insert(insert_data, function(result) {
          if(result != false) {
            req.flash('message', "Added a new Client!")
            res.redirect('back');
          }
        });
      }
    });

  });

}

exports.remove = function(req, res) {
  var client_id = req.params.id;
  myClient.remove(client_id, function(result) {
    req.flash('alert', "Client Removed")
    res.redirect('back');
  });
}

exports.documentation = function(req, res) {

  var session = req.session;

  res.render('documentation', { title: 'Duke Connect', session: session.email});

}

exports.profile = function(req, res) {

  var session = req.session;
  if(session.email) {
    //find user by email in session not hard coded
    myDeveloper.findOne(session.email, function(result) {
      if(result != false) {
        var name = result.name;
        var email = result.email;
        var id = result._id;
        myClient.findByUserid(id, function(result) {
            var apps = result;
            var flash = req.flash();
            console.log("flasher: "+flash);
            res.render('profile', { title: 'CampusConnect', apps: apps, name: name, email: email, session: session.email, flash: flash});
          
        });
      }
    });
  }
  else {
    res.writeHead(302, {
      'Location': '/'
    });
    res.end();
  }
}

exports.getUserInfo = function(req, res) {

  var session = req.session;

	var code = req.query.code;

    var req = shred.post({
      url: "http://localhost:8081/oauth/access_token",
      headers: {
        "Content-Type": "application/json"
      },
      // Shred will JSON-encode PUT/POST bodies
      content: { 
        client_id: "2f18b05f9da2c9c32c8b32cc1e1c6717",
        client_secret: "b9d84f78d9a37ba42965df2b8c513194",
        redirect_uri: "http://localhost:8081/create",
        code: code, perms: "basic_info" 
      },

      on: {
        // you can use response codes as events
        200: function(response) {

          var access_token = response.content.data.access_token;

          var req = shred.get({
            url: "http://localhost:8081/exchange?access_token="+access_token,
            headers: {
              Accept: "application/json"
            },
            on: {
              // You can use response codes as events
              200: function(response) {
                // Shred will automatically JSON-decode response bodies that have a
                // JSON Content-Type
                var userInfo = response.content.data;
                console.log("userinfo anyone? "+userInfo.basic_info.name);
                var name = userInfo.basic_info.name;
                var email = userInfo.basic_info.email;
                var insert_data = {
                  name: name,
                  email: email
                }
                myDeveloper.findOne(email, function(result) {
                  if(result == undefined) {
                    //create new user
                    myDeveloper.insert(insert_data, function(result) {
                        // set user session and send to homepage
                        session.email = email;
                        res.writeHead(302, {
                          'Location': '/profile'
                        });
                        res.end();
                    });
                  }
                  else {
                    //login user
                    session.email = email;
                    res.writeHead(302, {
                      'Location': '/profile'
                    });
                    res.end();
                  }
                });

              },
              // Any other response means something's wrong
              response: function(response) {
                console.log("Oh no!");
              }
            }
          });

        },
        response: function(response) {
          // We got a 40X that is not a 409, or a 50X
          console.log("Oh no, something went wrong!");
        }
      }
    });

}

exports.logout = function(req, res) {
  req.session.destroy();
  res.writeHead(302, {
    'Location': '/'
  });
  res.end();
}