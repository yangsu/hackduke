exports.home =  function(req, res, next) {
    res.end('home, logged in? ' + !!req.session.user);
  };

exports.loginPage = function(req, res, next) {
    if(req.session.user) {
      res.writeHead(303, {Location: '/'});
      return res.end();
    }

    var next_url = req.query.next ? req.query.next : '/';

    res.end('<html><form method="post" action="/login"><input type="hidden" name="next" value="' + next_url + '"><input type="text" placeholder="username" name="username"><input type="password" placeholder="password" name="password"><button type="submit">Login</button></form>');
  };

exports.loginSubmit = function(req, res, next) {
    req.session.user = req.body.username;

    res.writeHead(303, {Location: req.body.next || '/'});
    res.end();
  };

exports.logout = function(req, res, next) {
    req.session.destroy(function(err) {
      res.writeHead(303, {Location: '/'});
      res.end();
    });
  };

exports.secret = function(req, res, next) {
    if(req.session.user) {
      res.end('proceed to secret lair, extra data: ' + JSON.stringify(req.session));
    } else {
      res.writeHead(403);
      res.end('no');
    }
  };

  