/*
* Model for CRUD on clients given to an app by a user
* To Use: 
* var client = require('../client').client;
* var myClient = new client();
*/

require('../dbconfigs');

function client() {

};

//Insert client
// insert_data is JSON Object
client.prototype.insert = function(insert_data, callback) {

  //Store it into the DB
      db.collection('clients', function(err, collection) {
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

//Remove client by client_id
// email is a string
client.prototype.remove = function(client_id, callback) {

  db.collection('clients', function(err, collection) {
    collection.remove({'client_id': client_id}, {safe:true}, function(err, result) {
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

// Find one client's app objects using a client_id and secret
// client_id is a string
// secret is a string
client.prototype.findOne = function(client_id, client_secret, callback) {

  db.collection('clients', function(err, collection) {
          collection.findOne({"client_id": client_id, "client_secret": client_secret}, {_id:0, apps:1}, function(err, item) {
            if(err) {
              callback(false);
            }
            else {
              callback(item);
            }
          });
        });

}

// Find total number of client a user has
// user_id is a string
client.prototype.findTotal = function(user_id, callback) {

  db.collection('clients', function(err, collection) {
          collection.find({"user_id": user_id}).count(function(err, count) {
            if(err) {
              callback(false);
            }
            else {
              callback(count);
            }
          });
        });

}


// Find one client's app objects using a client_id
// client_id is a string
client.prototype.findByClientid = function(client_id, callback) {

  db.collection('clients', function(err, collection) {
          collection.findOne({"client_id": client_id}, {_id:0}, function(err, item) {
            if(err) {
              callback(false);
            }
            else {
              callback(item);
            }
          });
        });

}

// Find one client's app objects using a client_id
// client_id is a string
client.prototype.findByUserid = function(user_id, callback) {

  db.collection('clients', function(err, collection) {
          collection.find({"user_id": user_id}, {_id:0}, function(err, cursor) {
            cursor.toArray(function(err, items) {
              if(err) {
                callback(err);
              }
              else {
                callback(items);
              }
            });
          });
        });

}


exports.client = client;
