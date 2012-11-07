var sys = require('sys');
var exec = require('child_process').exec;

var user = 'flb5';
var pass = 'handyArmsWursti7';

    // executes script that gets course from ACES
var child = exec("ruby ../../scrapers/authenticated_scrapes/mechanize.rb "+user+" "+pass, function (error, stdout, stderr) {
var schedule = stdout;

console.log(schedule);

return true;
