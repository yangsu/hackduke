/*
* Model for CRUD on grants given to an app by a user
* To Use: 
* var grant = require('../grant').grant;
* var myGrant = new grant();
*/

require('../dbconfigs');

function grant() {

};

//Update grant
grant.prototype.update = function(perm_array, client_id, unique_identifier, code, callback) {

  //update perms in grant as well as the code
  console.log("inside grant update: "+perm_array+" "+client_id+" "+code+" "+unique_identifier);

  //Store it into the DB
      db.collection('grants', function(err, collection) {
        collection.update({ unique_identifier: unique_identifier, client_id: client_id }, { "$addToSet" : { perms : { $each : perm_array } }, "$set": { code: code } }, {upsert:true}, function(err, result) {
          if(err) {
            console.log("There is an error updating: "+err);
            callback(err);
          }
          else {
            callback(true);
          }
        });
      });

}

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
// unique_identifier is a string
// client_id is a string
grant.prototype.remove = function(unique_identifier, client_id, callback) {

  db.collection('grants', function(err, collection) {
    collection.remove({'unique_identifier': unique_identifier, 'client': client_id}, {safe:true}, function(err, result) {
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

// Find one grant object using a unique_identifier
// unique_identifier is a string
// client_id is a string
grant.prototype.findOne = function(unique_identifier, client_id, callback) {

  db.collection('grants', function(err, collection) {
          collection.findOne({ unique_identifier: unique_identifier, client: client_id}, function(err, item) {
            if(err) {
              callback(err);
            }
            else {
              callback(item);
            }
          });
        });

}

// Find one grant object using a client_id and code
// unique_identifier is a string
// client_id is a string
grant.prototype.findGivenCode = function(client_id, code, callback) {

  db.collection('grants', function(err, collection) {
          collection.findOne({ client_id: client_id, code: code}, function(err, item) {
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
// unique_identifier is a string
// client_id is a string
grant.prototype.findGivenPerms = function(unique_identifier, client_id, perms, callback) {

  var perm_array = perms.split(",");

  db.collection('grants', function(err, collection) {
          collection.findOne({ unique_identifier: unique_identifier, client_id: client_id, perms: { "$all" : perm_array}}, function(err, item) {
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
