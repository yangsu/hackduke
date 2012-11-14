var sys = require('sys')
var exec = require('child_process').exec;

var userData = require('../models/userdata').userData;
var myUserData = new userData();

function aces(netid, pass) {
  this.netid = netid;
  this.pass = pass;
};

//in order to make this more versatile, find a way to pass perms to ruby mechanize script and have bunch of if statements getting
//different pieces of data adding it all into a json object to be returned at the end

aces.prototype.getAcesData = function(perms, callback) {

  var netid = this.netid;
  var pass = this.pass;

  var command = "ruby ../scrapers/authenticated_scrapes/mechanize.rb "+netid+" "+pass+" "+perms;
    // executes script that gets course from ACES
    var child = exec(command, function (error, stdout, stderr) {
      insert_data = JSON.parse(stdout);

      myUserData.insert(insert_data, function(worked) {
        callback(worked);
      });
    });

}


exports.aces = aces;