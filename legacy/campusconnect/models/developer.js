/*
* Model for CRUD on developers given to an app by a developer
* To Use: 
* var developer = require('../developer').developer;
* var myUser = new developer();
*/

require('../dbconfigs');

function developer() {

};

//Insert developer
// insert_data is JSON Object
developer.prototype.insert = function(insert_data, callback) {

  //Store it into the DB
      db.collection('developers', function(err, collection) {
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

//Remove developer by email
// email is a string
developer.prototype.remove = function(email, callback) {

  db.collection('developers', function(err, collection) {
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

// Find one developer's objects using a email
// email is a string
developer.prototype.findOne = function(email, callback) {

  db.collection('developers', function(err, collection) {
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

exports.developer = developer;
