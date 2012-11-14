/*
* Model for CRUD on grants given to an app by a user
* To Use: 
* var grant = require('../grant').grant;
* var myGrant = new grant();
*/

require('../dbconfigs');

function grant() {

};

//Insert grant
// insert_data is JSON Object
grant.prototype.insert = function(insert_data, callback) {

  //Store it into the DB
      db.collection('grants', function(err, collection) {
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

//Remove grant
// netid is a string
// client_id is a string
grant.prototype.remove = function(net_id, client_id, callback) {

  db.collection('grants', function(err, collection) {
    collection.remove({'netid': net_id, 'client': client_id}, {safe:true}, function(err, result) {
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

// Find one grant object using a netid
// netid is a string
// client_id is a string
grant.prototype.findOne = function(net_id, client_id, callback) {

  db.collection('grants', function(err, collection) {
          collection.findOne({ netid: net_id, client: client_id}, function(err, item) {
            if(err) {
              callback(false);
            }
            else {
              callback(item);
            }
          });
        });

}

// Find one grant object using a client_id and code
// netid is a string
// client_id is a string
grant.prototype.findGivenCode = function(client_id, code, callback) {

  db.collection('grants', function(err, collection) {
          collection.findOne({ client: client_id, code: code}, function(err, item) {
            if(err) {
              callback(false);
            }
            else {
              callback(item);
            }
          });
        });

}

exports.grant = grant;
