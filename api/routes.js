var _ = require('lodash');
var async = require('async');

var db = require('../scrapers/db');

var baseOptions = {
  lean: true
};

var genOptions = function(opt) {
  return _.extend({}, baseOptions, opt);
};

var wrapError = function(res, cb) {
  return function(err, data) {
    if (err) {
      // return res.send(400);
      res.send(err);
    } else {
      cb(data);
    }
  }
};

var handlerGenerator = function(res, f) {
  return wrapError(res, function(data) {
    return res.json(f(data || []));
  });
};

var defaultHandler = function(res) {
  return handlerGenerator(res, _.identity);
};


var transformers = require('./transformers');

var limitAndSkip = function(query) {
  return genOptions({
    limit: query.limit || 100,
    skip: query.skip || 0
  });
};

var includeFilter = function(filter, key) {
  if (filter[key] === 0) {
    return _.omit(filter, key);
  } else {
    filter[key] = 1;
    return filter;
  }
};

// =============================================================================
// list.json
// =============================================================================

var distinct = function(collection, field) {
  return function(req, res, next) {
    db[collection].distinct(field).exec(defaultHandler(res));
  };
};

exports.listAcademicOrgs = distinct('Class', 'course-offering.academic-organization');
exports.listDepartment = distinct('Department', 'title');
exports.listDepartmentCode = distinct('Department', 'code');
exports.listPrograms = distinct('Class', 'course-offering.career');
exports.listSchools = distinct('Class', 'course-offering.academic-group');
exports.listTerm = distinct('Term', 'title');

var listEndpoint = function(collection, queryfields, filterField) {
  return function(req, res, next) {
    var query = _.pick.apply(_, [req.params].concat(queryfields));
    var filter = {};
    filter[filterField] = 1;

    db[collection].find(query, filter, genOptions({
      sort: filter
    }), handlerGenerator(res, function(data) {
      return _.pluck(data, filterField);
    }));
  };
};

exports.listclass = listEndpoint('Class', ['department'], 'number');

exports.listterm = listEndpoint('Term', ['department', 'number'], 'title');

exports.listsection = listEndpoint('Section', ['department', 'number', 'title'], 'section_id');

// =============================================================================
// ById
// =============================================================================

var getFormat = function(collection, format) {
  var filters = transformers[collection];
  return filters[format] || filters.basic || {};
};

var byId = function(collection) {
  return function(req, res, next) {
    var filter = getFormat(collection, req.query.format);
    db[collection].findById(req.params.id, filter, defaultHandler(res));
  };
};

// =============================================================================
// department.json
// =============================================================================

exports.departments = function(req, res, next) {
  var options = _.extend(limitAndSkip(req.query), {
    sort: { code: 1 }
  });
  db.Department.find({}, {
    code: 1,
    title: 1
  }, options, defaultHandler(res));
};

exports.departmentById = byId('Department');

// =============================================================================
// class.json
// =============================================================================

exports.class = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number');
  var filter = getFormat('Class', req.query.format);
  db.Class.findOne(query, filter, baseOptions, defaultHandler(res));
};

exports.classById = byId('Class');

exports.classTerm = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number');
  var filter = getFormat('Term', req.query.format);
  _.extend(filter, {
    department: 0,
    number: 0,
    course_id: 0
  });
  db.Term
    .find(query, filter, baseOptions)
    .exec(defaultHandler(res));
};

exports.classSection = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number', 'title');
  var filter = getFormat('Section', req.query.format);
  db.Section
    .find(query, filter, baseOptions)
    .exec(handlerGenerator(res, function(docs) {
        var response = _.map(docs, function(doc) {
          return _.omit(
              doc,
              'department',
              'number',
              'course_id',
              'longtitle',
              'title',
              'term_id'
          );
        });
        res.json(response);
      }));
};

exports.classByTerm = function(req, res, next) {
  var query = _.pick(req.params, 'title', 'department');
  var filter = getFormat('Class', req.query.format);
  var options = limitAndSkip(req.query);

  db.Term
    .find(query, { class: 1 }, options)
    .populate({
        path: 'class',
        select: filter
      })
    .exec(handlerGenerator(res, function(docs) {
        return _.pluck(docs, 'class');
      }));
};

exports.termById = byId('Term');

exports.sectionById = byId('Section');

exports.classHistory = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number');

  var filter = getFormat('Class', req.query.format);
  filter = includeFilter(filter, 'terms');

  var termFilter = getFormat('Term', req.query.format);
  termFilter = includeFilter(termFilter, 'sections');

  var sectionFilter = getFormat('Section', req.query.format);

  db.Class
    .find(query, filter, baseOptions)
    .populate({
        path: 'terms',
        select: termFilter
      })
    .exec(wrapError(res, function(docs) {
        var opts = {
          path: 'sections',
          select: sectionFilter,
          model: 'Section'
        };
        db.Term.populate(_.pluck(docs, 'terms'), opts, handlerGenerator(res, function(d) {
          return docs;
        }));
      }));
};

exports.classHistoryById = function(req, res, next) {
  var filter = getFormat('Class', req.query.format);
  filter = includeFilter(filter, 'terms');

  var termFilter = getFormat('Term', req.query.format);
  termFilter = includeFilter(termFilter, 'sections');

  var sectionFilter = getFormat('Section', req.query.format);

  db.Class
    .findById(req.params.id, filter, baseOptions)
    .populate({
        path: 'terms',
        select: termFilter
      })
    .exec(wrapError(res, function(docs) {
        var opts = {
          path: 'sections',
          select: sectionFilter
        };
        db.Term.populate(docs.terms, opts, handlerGenerator(res, function(d) {
          return docs;
        }));
      }));
};

exports.classes = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'title');
  var filter = getFormat('Class', req.query.format);
  var options = limitAndSkip(req.query);
  _.extend(options, {
    sort: {
      department: 1,
      number: 1
    }
  });

  db.Class.find(query, filter, options, defaultHandler(res));
};

// =============================================================================
// evaluation.json
// =============================================================================

exports.evaluation = function(req, res, next) {
  var query = _.pick(req.params, 'department', 'number');

  var filter = getFormat('Section', req.query.format);
  var evalfilter = getFormat('Evaluation', req.query.format);

  db.Section.find(query, filter, baseOptions, handlerGenerator(res, function(d) {
    var course_id = _.unique(_.pluck(d, 'course_id'))[0];

    db.Evaluation.find({
      course_id: course_id,
      details: { $exists: true }
    }, evalfilter, baseOptions, handlerGenerator(res, function(data) {
      var ratings = data.details['course-quality'].ratings;
      data.details['course-quality'].ratings = _.filter(ratings, function(r) {
        return r.question == 'Mean' || r.question == 'Median';
      });
      return data;
    }));
  }));
};

exports.evaluationById = byId('Evaluation');

// =============================================================================
// event
// =============================================================================

var eventEndpoint = function(query, req, res, next) {
  var filter = getFormat('Event', req.query.format);
  var options = _.extend(limitAndSkip(req.query), {
    'start.date': 1
  });

  db.Event.find(query || {}, filter, options, handlerGenerator(res, function(data) {
    return _.map(data, function(doc) {
      var cats = doc.categories && doc.categories.category;
      doc.categories = _.compact(_.pluck(cats, 'value'));
      return doc;
    });
  }));
};

exports.event = function(req, res, next) {
  var query = {};
  var q = req.query;

  if (q.category) q['categories.category.value'] = q.category;
  if (q.end) q['end.date'] = { $lte: new Date(q.end) };
  if (q.host) q['creator'] = q.host;
  if (q.start) q['start.date'] = { $gte: new Date(q.start) };
  if (q.venue) q['location.address'] = q.venue;

  eventEndpoint(query, req, res, next);
};

exports.listEventHost = distinct('Event', 'creator');
exports.listEventCategory = distinct('Event', 'categories.category.value');
exports.listEventVenue = distinct('Event', 'location.address');
exports.eventById = byId('Event');

exports.eventByCategory = function(req, res, next) {
  eventEndpoint({
    'categories.category.value': req.params[0]
  }, req, res, next);
};

exports.eventByVenue = function(req, res, next) {
  eventEndpoint({
    'location.address': req.params.location
  }, req, res, next);
};

exports.eventByHost = function(req, res, next) {
  eventEndpoint({
    'creator': req.params.host
  }, req, res, next);
};

exports.eventByDate = function(req, res, next) {
  var query = {
    'start.year': req.params.year,
    'start.month': req.params.month,
    'start.day': req.params.day
  };
  eventEndpoint(query, req, res, next);
};

exports.eventByMonth = function(req, res, next) {
  var query = {
    'start.year': req.params.year,
    'start.month': req.params.month
  };
  eventEndpoint(query, req, res, next);
};

exports.eventToday = function(req, res, next) {
  var d = new Date;

  eventEndpoint({
    'start.year': '' + d.getFullYear(),
    'start.month': '' + (d.getMonth() + 1),
    'start.day': '' + d.getDate()
  }, req, res, next);
};

var week = 1000 * 3600 * 24 * 7;

exports.eventThisWeek = function(req, res, next) {
  var current = new Date;
  var d = new Date(current.getTime() + week);

  eventEndpoint({
    'start.date': { $gte: current },
    'end.date': { $lte: d }
  }, req, res, next);
};

// =============================================================================
// location
// =============================================================================

exports.listLocation = distinct('Location', 'name');

var locationEndpoint = function(query, req, res, next) {
  var filter = getFormat('Location', req.query.format);
  var options = limitAndSkip(req.query);

  db.Location.find(query || {}, filter, options, defaultHandler(res));
};

exports.location = function(req, res, next) {
  locationEndpoint({}, req, res, next);
};
exports.locationById = byId('Location');

exports.locationByBuildingId = function(req, res, next) {
  locationEndpoint({
    school_building_id: +req.params.id
  }, req, res, next);
};

exports.locationByName = function(req, res, next) {
  locationEndpoint({
    name: req.params.name
  }, req, res, next);
};

// =============================================================================
// Marker
// =============================================================================

exports.listMarker = distinct('Marker', 'markerName');
exports.listMarkerCategory = distinct('Marker', 'categoryName');

var markerEndpoint = function(query, req, res, next) {
  var filter = getFormat('Marker', req.query.format);
  var options = limitAndSkip(req.query);

  db.Marker.find(query || {}, filter, options, defaultHandler(res));
};

exports.marker = function(req, res, next) {
  markerEndpoint({}, req, res, next);
};

exports.markerById = byId('marker');

exports.markerByMarkerId = function(req, res, next) {
  markerEndpoint({
    mrkId: +req.params.id
  }, req, res, next);
};

exports.markerByName = function(req, res, next) {
  markerEndpoint({
    markerName: req.params.name
  }, req, res, next);
};

exports.markerByCategory = function(req, res, next) {
  markerEndpoint({
    categoryName: req.params.category
  }, req, res, next);
};

// =============================================================================
// Directory
// =============================================================================

exports.listEducationalAffiliation = distinct('Directory', 'eduPersonAffiliation');
// exports.listDirectoryCategory = distinct('Directory', 'categoryName');

var DirectoryEndpoint = function(query, req, res, next) {
  var filter = getFormat('Directory', req.query.format);
  var options = limitAndSkip(req.query);

  db.Directory.find(query || {}, filter, options, defaultHandler(res));
};

exports.directory = function(req, res, next) {
  var query = _.pick(req.query,
      'cn',
      'displayName',
      'duAcMailboxExists',
      'duDempoID',
      'duDempoIDhist',
      'duLDAPKey',
      'duMiddleName1',
      'duPSAcadCareerC1',
      'duPSAcadCareerDescC1',
      'duPSAcadProgC1',
      'duPSCareerSeqNbrC1',
      'duSAPCompany',
      'duSAPCompanyDesc',
      'duSAPOrgUnit',
      'eduPersonAffiliation',
      'eduPersonPrimaryAffiliation',
      'eduPersonPrincipalName',
      'facsimileTelephoneNumber',
      'gidNumber',
      'givenName',
      'homeDirectory',
      'loginShell',
      'mail',
      'objectClass',
      'ou',
      'pager',
      'postOfficeBox',
      'postalAddress',
      'sn',
      'telephoneNumber',
      'title',
      'uid',
      'uidNumber'
    );
  DirectoryEndpoint(query, req, res, next);
};

exports.directoryById = byId('Directory');

exports.directoryByNetId = function(req, res, next) {
  DirectoryEndpoint({
    uid: req.params.netid
  }, req, res, next);
};

exports.directoryByPhone = function(req, res, next) {
  // strip all non numeric chars, turn string into char array
  var phone = req.params.phone && req.params.phone.replace(/\D+/g, '').split('');
  // insert 6th space
  phone.splice(6, 0, ' ');
  // insert 3rd space
  phone.splice(3, 0, ' ');
  // insert prefix
  phone.splice(0, 0, '+1 ');
  phone = phone.join('');

  DirectoryEndpoint({
    $or: [{
      telephoneNumber: phone
    }, {
      facsimileTelephoneNumber: phone
    }]
  }, req, res, next);
};

exports.directoryByAffiliation = function(req, res, next) {
  DirectoryEndpoint({
    eduPersonAffiliation: req.params.affiliation
  }, req, res, next);
};
