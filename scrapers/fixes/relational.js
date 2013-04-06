var _ = require('lodash');
var async = require('async');

var db = require('../db');

var wrapError = function(cb) {
  return function(err, data) {
    if (err) {
      console.log('ERROR', err);
    } else {
      cb(data);
    }
  }
};

var genClassTermRel = function() {
  db.Class.find({
    // number: '110L'
  }, {
    department: 1,
    number: 1
  }, {
    // limit: 1
  }, wrapError(function(classes) {
    _.map(classes, function(c, i) {
      var query = {
        department: c.department,
        number: c.number
      };
      db.Term.find(query, {
        _id: 1,
        title: 1
      }, {}, wrapError(function(terms) {
        c.terms = _.pluck(terms, '_id');
        c.save(wrapError(function(data) {
          var requests = _.map(terms, function(t) {
            return function(cb) {
              var q = _.extend({}, query, {
                title: t.title
              });
              db.Section.find(q, {
                _id: 1
              }, {}, wrapError(function(sections) {
                t.class = c._id;
                t.sections = _.pluck(sections, '_id');
                t.save(wrapError(function(newt) {
                  var reqs = _.map(sections, function(s) {
                    return function(cb2) {
                      s.class = c._id;
                      s.term = t._id;
                      s.save(cb2);
                    };
                  });
                  async.parallel(reqs, cb);
                }));
              }));
            };
          });
          async.parallel(requests, wrapError(function(data) {
            console.log('saved', i, 'of', classes.length);
          }));
        }));
      }));
    });
  }));
};

genClassTermRel();
