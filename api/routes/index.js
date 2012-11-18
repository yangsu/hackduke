/*
 * GET home page.
 */

 var http = require('http');
 var querystring = require('querystring');
 var Shred = require("shred");
 var shred = new Shred();

exports.index = function(req, res){
	/*
  	// if user is not logged in, ask them to login
    if (typeof req.session.email == 'undefined') res.render('home', { title: 'Home'});
    // if user is logged in already, take them straight to the items list
    else res.redirect('/profile');
    */
    res.render('home', { title: 'Home'});
};

// handler for form submitted from homepage
exports.index_process_form = function(req, res) {
    // if the username is not submitted, give it a default of "Anonymous"
    email = req.body.email || 'anonymous';
    // store the username as a session variable
    req.session.email = email;
    // redirect the user to homepage
    res.render('profile', {title: "Profile", email: req.session.email});
};

//   http://localhost:8081/oauth/authorize?client_id=21a71360d6a6093b4f8a577b61af776d&perms=basic_info,advanced_info&uni=unc&redirect_uri=http://localhost:3000/oauthcall

exports.oauthcall = function(req, res) {

   var code = req.query.code;


    var req = shred.post({
      url: "http://localhost:8081/oauth/access_token",
      headers: {
        "Content-Type": "application/json"
      },
      // Shred will JSON-encode PUT/POST bodies
      content: { client_id: "21a71360d6a6093b4f8a577b61af776d", client_secret: "df42bb12f0015d25ebf9bbc2c785baaf", redirect_uri: "http://localhost:3000/oauthresp", code: code, uni: "duke", perms: "schedule,basic_info,advanced_info" },

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
                console.log(response.content.data);
                res.send(response.content.data);
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
    

};