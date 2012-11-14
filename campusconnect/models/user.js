/*
* Model for CRUD on users given to an app by a user
* To Use: 
* var user = require('../user').user;
* var myUser = new user();
*/

require('../dbconfigs');

function user() {

};

//Insert user
// insert_data is JSON Object
user.prototype.insert = function(insert_data, callback) {

  //Store it into the DB
      db.collection('users', function(err, collection) {
        collection.insert(insert_data, {safe:true}, function(err, result) {
          if(err) {
            callback(false);
          }
          else {
            callback(true);
          }
        });
      });

}

//Remove user by email
// email is a string
user.prototype.remove = function(email, callback) {

  db.collection('users', function(err, collection) {
    collection.remove({'email': email}, {safe:true}, function(err, result) {
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

// Find one user's objects using a email
// email is a string
user.prototype.findOne = function(email, callback) {

  db.collection('users', function(err, collection) {
          collection.findOne({"email": email}, function(err, item) {
            if(err) {
              callback(false);
            }
            else {
              callback(item);
            }
          });
        });

}

exports.user = user;
