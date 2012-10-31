
/*
 * GET home page.
 */

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