var sys = require('sys')
var exec = require('child_process').exec;

var userData = require('../models/userdata').userData;
var myUserData = new userData();

function aces(netid, pass, university) {
  this.netid = netid;
  this.pass = pass;
  this.university = university;
};

//in order to make this more versatile, find a way to pass perms to ruby mechanize script and have bunch of if statements getting
//different pieces of data adding it all into a json object to be returned at the end

aces.prototype.getAcesData = function(perms, unique_identifier, callback) {

  var netid = this.netid;
  var pass = this.pass;
  var university = this.university;

  var command = "ruby ../scrapers/authenticated_scrapes/"+ university +"/mechanize.rb "+netid+" "+pass+" "+perms;
    // executes script that gets course from ACES
    var child = exec(command, function (error, stdout, stderr) {
      insert_data = JSON.parse(stdout);
      console.log("Email is: "+insert_data.email);
      insert_data.unique_identifier = unique_identifier;

      myUserData.insert(insert_data, function(worked) {
        callback(worked);
      });
    });

}


exports.aces = aces;