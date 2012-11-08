/*
* Model for CRUD on UserData gathered during the connect
* To Use: 
* var userData = require('../userdata').userData;
* var myUserData = new userData();
*/

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
  }
});

function userData() {

};

//Insert netid and userdata
// insert_data is JSON Object
userData.prototype.insert = function(insert_data, callback) {

  console.log("Insert was called!");

  //Store it into the DB
      db.collection('userdata', function(err, collection) {
        console.log("We are in the collection");
        collection.insert(insert_data, {safe:true}, function(err, result) {
          console.log("We are in the insert part");
          if(err) {
            console.log("insert error");
            callback(err);
          }
          else {
            console.log("returning true");
            callback(true);
          }
        });
      });

}

//Remove netid and userdata
// netid is a string
userData.prototype.remove = function(netid, callback) {

  db.collection('userdata', function(err, collection) {
    collection.remove({'netid': netid}, {safe:true}, function(err, result) {
        if(err) {
          callback(err);
        }
        else {
          console.log('' + result + ' document(s) deleted');
          callback(true);
        }
    });
  });

}

// Find one userdata object using a netid
// netid is a string
userData.prototype.findOne = function(netid, callback) {

  db.collection('userdata', function(err, collection) {
          collection.findOne({ netid: netid}, function(err, item) {
            if(err) {
              callback(err);
            }
            else {
              callback(item);
            }
          });
        });

}

exports.userData = userData;