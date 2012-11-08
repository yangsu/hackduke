/*
* Model for CRUD on clients given to an app by a user
* To Use: 
* var client = require('../client').client;
* var myGrant = new client();
*/

require('../dbconfigs');

function client() {

};

//Insert client
// insert_data is JSON Object
client.prototype.insert = function(insert_data, callback) {

  //Store it into the DB
      db.collection('client', function(err, collection) {
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

//Remove client
// client_id is a string
client.prototype.remove = function(client_id, callback) {

  db.collection('client', function(err, collection) {
    collection.remove({'client': client_id}, {safe:true}, function(err, result) {
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

// Find one client object using a netid
// client_id is a string
// secret is a string
client.prototype.findOne = function(client_id, secret, callback) {

  db.collection('client', function(err, collection) {
          collection.findOne({client: client_id, secret: secret}, function(err, item) {
            if(err) {
              callback(false);
            }
            else {
              callback(item);
            }
          });
        });

}


exports.client = client;
