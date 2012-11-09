var sys = require('sys')
var exec = require('child_process').exec;

var userData = require('../models/userdata').userData;
var myUserData = new userData();

function aces(netid, pass) {
  this.netid = netid;
  this.pass = pass;
};


aces.prototype.getSchedule = function(callback) {

  var netid = this.netid;
  var pass = this.pass;

  console.log("access getSchedule called");
  var command = "ruby ../scrapers/authenticated_scrapes/mechanize.rb "+netid+" "+pass;
    // executes script that gets course from ACES
    var child = exec(command, function (error, stdout, stderr) {
      schedule = stdout;
      console.log("Retrieved: "+schedule);

      var insert_data = {
        netid: netid,
        schedule: schedule
      };

      console.log(this.netid);

      myUserData.insert(insert_data, function(worked) {
        callback(worked);
      });
    });

}


exports.aces = aces;