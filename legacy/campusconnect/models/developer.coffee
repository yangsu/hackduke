#
#* Model for CRUD on developers given to an app by a developer
#* To Use: 
#* var developer = require('../developer').developer;
#* var myUser = new developer();
#
developer = ->
require "../dbconfigs"

#Insert developer
# insert_data is JSON Object
developer::insert = (insert_data, callback) ->
  
  #Store it into the DB
  db.collection "developers", (err, collection) ->
    collection.insert insert_data,
      safe: true
    , (err, result) ->
      if err
        callback false
      else
        callback true




#Remove developer by email
# email is a string
developer::remove = (email, callback) ->
  db.collection "developers", (err, collection) ->
    collection.remove
      email: email
    ,
      safe: true
    , (err, result) ->
      if err
        callback err
      else
        console.log "" + result + " document(s) deleted"
        callback true




# Find one developer's objects using a email
# email is a string
developer::findOne = (email, callback) ->
  db.collection "developers", (err, collection) ->
    collection.findOne
      email: email
    , (err, item) ->
      if err
        callback false
      else
        callback item



exports.developer = developer
