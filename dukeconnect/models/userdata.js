/*
* Model for CRUD on UserData gathered during the connect
* To Use: 
* var userData = require('../userdata').userData;
* var myUserData = new userData();
*/

require('../dbconfigs');

function userData() {

};

//Insert netid and userdata
// insert_data is JSON Object
userData.prototype.insert = function(insert_data, callback) {

  //Store it into the DB
      db.collection('userdata', function(err, collection) {
        collection.insert(insert_data, {safe:true}, function(err, result) {
          if(err) {
            callback(err);
          }
          else {
            callback(true);
          }
        });
      });

}

//Remove netid and userdata
// netid is a string
userData.prototype.remove = function(net_id, callback) {

  db.collection('userdata', function(err, collection) {
    collection.remove({'netid': net_id}, {safe:true}, function(err, result) {
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
userData.prototype.findOne = function(net_id, callback) {

  db.collection('userdata', function(err, collection) {
          collection.findOne({ netid: net_id}, function(err, item) {
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