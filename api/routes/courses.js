var mysql      = require('mysql');

//Use this for AppFog dev 

var vcap_service = JSON.parse(process.env.VCAP_SERVICES);
var creds = vcap_service["mysql-5.1"][0]["credentials"];

var connection = mysql.createConnection({
  host     : creds.host,
  user     : creds.username,
  password : creds.password,
  port: creds.port,
});

connection.connect();
connection.query("use "+creds.name);

//Use this for local dev
/*
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'root',
  port: 8889,
});

connection.connect();
connection.query("use openuniversity");
*/

exports.findAll=function(req, res) {
  
  connection.query("select * from courses",function selectCb(err, details, fields) {
    if (err) {
      res.send(err);
    }
    res.send(details);
  });
}

//finds courses with exclusively the reqs you choose
exports.findRequirements=function(req, res) {
  var sql    = 'SELECT * FROM courses WHERE ';
  var required = req.query;

  var i = 0;
  var value = "";
  for(trait in required) {
    if(i != 0) { sql = sql + ' AND '; }
    value = (typeof required[trait] == 'string') ? "'"+ required[trait] +"'" : required[trait];
    sql = sql + trait + '=' + value;
    i++;
  }

  if(i == 0) {
    sql = sql + "1";
  }

  connection.query(sql ,function selectCb(err, details, fields) {
    if (err) {
      res.send(err);
    }
    res.send(details);
  });
}


