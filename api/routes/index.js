
/*
 * GET home page.
 */

 var http = require('http');
 var querystring = require('querystring');

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

//   http://localhost:8081/oauth/authorize?client_id=1&perms=schedule&redirect_uri=http://localhost:3000/oauthcall

exports.oauthcall = function(req, res) {

    var code = req.query.code;

    //change req, res var names
    // get code from get var and pass
    // edit below post request

    var post_data = querystring.stringify({
      'client_id' : '1',
      'client_secret': '1secret',
      'redirect_uri': 'http://localhost:3000/oauthresp',
        'code' : code,
    });

    
    var options = {
      host: 'localhost',
      port: 8081,
      path: '/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_data.length
      }
    };

    var req2 = http.request(options, function(res2) {
      console.log('STATUS: ' + res2.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res2.headers));
      res2.setEncoding('utf8');
      res2.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
        var responseObj = JSON.parse(chunk);
        res.writeHead(302, {
          'Location': 'http://localhost:8081/exchange?access_token='+responseObj.access_token
        });
        res.end();
      });
    });

    req2.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req2.write(post_data);
    req2.end();
    

};

exports.oauthresp = function(req, res) {

    res.end(req.body);

};