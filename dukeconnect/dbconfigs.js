var mongo = require('mongodb');

var Server = mongo.Server,
  Db = mongo.Db,
  BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('dukeconnect', server);

db.open(function(err, db) {
  if(!err) {
    console.log("connected to 'dukeconnect' database");
    db.collection('userdata', {safe:true}, function(err, collection) {
      if(err) {
        console.log("The 'userdata' collection doesnt exist. Creating it with sample data...");
        populateData();
      }
    });
    db.collection('grant', {safe:true}, function(err, collection) {
      if(err) {
        console.log("The 'grant' collection doesnt exist. Creating it with sample data...");
        populateGrants();
      }
    });
    db.collection('client', {safe:true}, function(err, collection) {
      if(err) {
        console.log("The 'client' collection doesnt exist. Creating it with sample data...");
        populateClients();
      }
    });
  }
});



/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateData = function() {

    var userdata = [
    {
        netid: "flb5",
        schedule: "['COMPSCI 250-001 LEC (1721)','COMPSCI 250-01R REC (1722)','COMPSCI 330-001 LEC (1730)','COMPSCI 330-01R REC (1731)','ECON 462-01 LEC (3179)','PHYSICS 136-01 LEC (2605)' ]"
    },
    ];

    db.collection('userdata', function(err, collection) {
        collection.insert(userdata, {safe:true}, function(err, result) {});
    });

};

var populateGrants = function() {

    var grant = [
    {
        netid: "flb5",
        client: "1",
        code: "lkjskjdakjefs",
        perms: ["schedule", "courses_taken"]
    },
    ];

    db.collection('grant', function(err, collection) {
        collection.insert(grant, {safe:true}, function(err, result) {});
    });

};

var populateClients = function() {

    var client = [
    {
        client: "1",
        secret: "1secret"
    },
    ];

    db.collection('client', function(err, collection) {
        collection.insert(client, {safe:true}, function(err, result) {});
    });

};