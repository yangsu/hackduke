/*
* Model for CRUD on UserData gathered during the connect
* To Use: 
* var userData = require('../userdata').userData;
* var myUserData = new userData();
*/

require('../dbconfigs');

function userData() {

};

//Insert unique_identifier and userdata
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

//Remove userdata
// unique_identifier is a string
userData.prototype.remove = function(unique_identifier, callback) {
  
  db.collection('userdata', function(err, collection) {
    collection.remove({'unique_identifier': unique_identifier}, {safe:true}, function(err, result) {
        if(err) {
          callback(err);
        }
        else {
          console.log('' + result + ' document(s) deleted');
          callback(true);
        }
    });
  });


callback(true);

}

// Find one userdata object using a unique_identifier
// unique_identifier is a string
userData.prototype.findOne = function(unique_identifier, callback) {

  db.collection('userdata', function(err, collection) {
          collection.findOne({ unique_identifier: unique_identifier}, function(err, item) {
            if(err) {
              callback(err);
            }
            else {
              callback(item);
            }
          });
        });

}

// Find one userdata object using a unique_identifier
// unique_identifier is a string
userData.prototype.findByPerms = function(unique_identifier, perms, callback) {

  //TODO: check to make sure perm field exists in table
  var field_info = {};
  perms.forEach(function(perm, i) {
    field_info[perm.toString()] = 1;
  });
  field_info['_id'] = 0;
  db.collection('userdata', function(err, collection) {
          collection.findOne({ unique_identifier: unique_identifier}, field_info, function(err, item) {
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