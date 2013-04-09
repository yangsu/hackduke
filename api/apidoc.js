var _ = require('lodash');
var async = require('async');

var config = require('./config');
var db = require('../scrapers/db');

var base = {
  apiVersion: config.version,
  swaggerVersion: config.swaggerVersion,
  basePath: config.basePath
};

function extend() {
  var args = Array.prototype.slice.call(arguments, 0);
  return _.extend.apply(_, [{}, base].concat(args));
}

function get(opt) {
  return {
    path: opt.path,
    description: opt.description || '',
    operations: [{
      httpMethod: 'GET',
      nickname: opt.name,
      notes: opt.notes || '',
      responseClass: opt.responseClass,
      summary: opt.summary || opt.description || '',
      parameters: opt.parameters || [],
      errorResponses: opt.errorResponses || []
    }]
  };
}

function errRes(opt) {
  return _.map(opt, function(reason, code) {
    return {
      code: code,
      reason: reason
    };
  });
}

function listParam(opt, values) {
  return _.extend(opt, {
    defaultValue: values[0],
    allowableValues: {
      values: values,
      valueType: 'LIST'
    }
  });
}

var formatParam = listParam({
  name: 'format',
  description: 'Format of the response',
  dataType: 'String',
  paramType: 'query',
  required: false
}, ['basic', 'detailed', 'raw']);

var limitSkip = [{
  name: 'limit',
  description: 'Limit the number of responses',
  dataType: 'Number',
  paramType: 'query',
  required: false
}, {
  name: 'skip',
  description: 'Offset the number of responses',
  dataType: 'Number',
  paramType: 'query',
  required: false
}];

var formatLimitSkip = [formatParam].concat(limitSkip);

module.exports = function(callback) {
  console.log('Loading Documentation Data...');
  async.parallel({
    departments: function(cb) {
      db.Department.distinct('code').exec(cb);
    },
    terms: function(cb) {
      db.Term.distinct('title').exec(cb);
    },
    affiliations: function(cb) {
      db.Directory.distinct('eduPersonAffiliation').exec(cb);
    },
    eventCategories: function(cb) {
      db.Event.distinct('categories.category.value').exec(cb);
    },
    eventHosts: function(cb) {
      db.Event.distinct('creator').exec(cb);
    },
    eventVenues: function(cb) {
      db.Event.distinct('location.address').exec(cb);
    },
    locationNames: function(cb) {
      db.Location.distinct('name').exec(cb);
    },
    markerNames: function(cb) {
      db.Marker.distinct('markerName').exec(cb);
    },
    markerCategories: function(cb) {
      db.Marker.distinct('categoryName').exec(cb);
    },
    academicPrograms: function(cb) {
      db.Directory.distinct('duPSAcadCareerDescC1').exec(cb);
    },
    graduationTerms: function(cb) {
      db.Directory.distinct('duPSExpGradTermC1').exec(cb);
    }
  }, function(err, values) {

    _.each(values, function(data, key) {
      values[key] = data.sort();
    });

    console.log('Documentation Data Loaded');

    var idParam = {
      name: 'id',
      paramType: 'path',
      description: 'id',
      dataType: 'ObjectId',
      required: true
    };

    var departmentParam = listParam({
      name: 'department',
      paramType: 'path',
      description: 'department code',
      dataType: 'String',
      required: true
    }, values.departments);

    var numberParam = {
      name: 'number',
      paramType: 'path',
      description: 'class number',
      dataType: 'String',
      required: true
    };

    var termParam = listParam({
      name: 'term',
      paramType: 'path',
      description: 'class term',
      dataType: 'String',
      required: true
    }, values.terms);

    var classApi = extend({
      resourcePath: '/class',
      apis: [
        get({
          path: '/class',
          description: 'Get a list of classes',
          name: 'getClasses',
          responseClass: 'LIST[Class]',
          parameters: formatLimitSkip
        }),
        get({
          path: '/class/{id}',
          description: 'Get class by id',
          name: 'getClassById',
          responseClass: 'Class',
          parameters: [idParam, formatParam],
          errorResponses: errRes({
            500: 'Invalid ID'
          })
        }),
        get({
          path: '/class/department/{department}',
          description: 'Get a list of classes from a department',
          name: 'getClassFromDepartment',
          notes: 'department codes can be found at /list/department-code',
          responseClass: 'LIST[Class]',
          parameters: [departmentParam, formatParam]
        }),
        get({
          path: '/class/department/{department}/number/{number}',
          description: 'Get a class by class number',
          name: 'getClassByClassNumber',
          responseClass: 'Class',
          parameters: [departmentParam, numberParam].concat(formatLimitSkip)
        }),
        get({
          path: '/class/department/{department}/number/{number}/evaluation',
          description: 'Get class evaluation by class number',
          name: 'getClassByClassNumber',
          responseClass: 'Class',
          parameters: [departmentParam, numberParam].concat(formatLimitSkip)
        }),
        get({
          path: '/class/department/{department}/number/{number}/term',
          description: 'Get class terms by class number',
          name: 'getTermsByClassNumber',
          responseClass: 'LIST[Term]',
          parameters: [departmentParam, numberParam].concat(formatLimitSkip)
        }),
        get({
          path: '/class/department/{department}/number/{number}/term/{term}',
          description: 'Get class sections by class number and term',
          name: 'getSectionsByClassNumberAndTerm',
          responseClass: 'LIST[Section]',
          parameters: [departmentParam, numberParam, termParam].concat(formatLimitSkip)
        }),
        get({
          path: '/class/history/department/{department}/number/{number}',
          summary: 'Get class history by class number',
          description: 'Get class history, including all terms, sections, and evaluations of the class, by class number',
          name: 'getHistoryByClassNumber',
          responseClass: 'Class',
          parameters: [departmentParam, numberParam, formatParam]
        }),
        get({
          path: '/class/term/{term}',
          summary: 'Get classes by class term',
          description: 'Get classes offered in a given class term or semester',
          name: 'getClassesByTerm',
          responseClass: 'LIST[Class]',
          parameters: [termParam].concat(formatLimitSkip)
        }),
        get({
          path: '/class/term/{term}/department/{department}',
          description: 'Get classes by class term and department',
          name: 'getClassesByTermAndDepartment',
          responseClass: 'LIST[Class]',
          parameters: [termParam, departmentParam].concat(formatLimitSkip)
        }),
        get({
          path: '/evaluation/{id}',
          description: 'Get class evaluation by id',
          name: 'getEvaluationById',
          responseClass: 'Evaluation',
          parameters: [idParam, formatParam]
        }),
        get({
          path: '/history/{id}',
          description: 'Get class history by id',
          name: 'getHistoryById',
          responseClass: 'Class',
          parameters: [idParam, formatParam]
        }),
        get({
          path: '/term/{id}',
          description: 'Get class term by id',
          name: 'getTermById',
          responseClass: 'Term',
          parameters: [idParam, formatParam]
        }),
        get({
          path: '/section/{id}',
          description: 'Get class section by id',
          name: 'getSectionById',
          responseClass: 'Section',
          parameters: [idParam, formatParam]
        })
      ],
      models: {
        Class: db.schemaToJSON('Class'),
        Term: db.schemaToJSON('Term'),
        Section: db.schemaToJSON('Section'),
        Evaluation: db.schemaToJSON('Evaluation')
      }
    });

    var departmentApi = extend({
      resourcePath: '/department',
      apis: [
        get({
          path: '/department',
          description: 'Get a list of departments',
          name: 'getDepartments',
          responseClass: 'LIST[Department]',
          parameters: formatLimitSkip
        }),
        get({
          path: '/department/{id}',
          description: 'Get a department by id',
          name: 'getDepartmentById',
          responseClass: 'Department',
          parameters: [idParam, formatParam],
          errorResponses: errRes({
            500: 'Invalid ID'
          })
        })
      ],
      models: {
        Department: db.schemaToJSON('Department')
      }
    });

    var programParam = listParam({
      name: 'program',
      paramType: 'path',
      description: 'Academic program',
      dataType: 'String',
      required: true
    }, values.academicPrograms);

    var classes = _.uniq(_.invoke(values.graduationTerms, 'slice', 0, 4));
    var directoryApi = extend({
      resourcePath: '/directory',
      apis: [
        get({
          path: '/directory',
          description: 'Get a list of directory entries',
          name: 'getDirectory',
          responseClass: 'LIST[Directory]',
          parameters: formatLimitSkip
        }),
        get({
          path: '/directory/{id}',
          description: 'Get a directory entry by id',
          name: 'getDirectoryById',
          responseClass: 'Directory',
          parameters: [idParam, formatParam],
          errorResponses: errRes({
            500: 'Invalid ID'
          })
        }),
        get({
          path: '/directory/netid/{netId}',
          description: 'Get directory entries by netId',
          name: 'getDirectoryByNetId',
          responseClass: 'Directory',
          parameters: [{
            name: 'netId',
            paramType: 'path',
            description: 'Net Id',
            dataType: 'String',
            required: true
          }].concat(formatLimitSkip),
          errorResponses: errRes({
            500: 'Invalid Net ID'
          })
        }),
        get({
          path: '/directory/phone/{phone}',
          description: 'Get directory entries by phone number',
          name: 'getDirectoryByPhone',
          responseClass: 'Directory',
          parameters: [{
            name: 'phone',
            paramType: 'path',
            description: 'Phone Number',
            dataType: 'String',
            required: true
          }].concat(formatLimitSkip)
        }),
        get({
          path: '/directory/affiliation/{affiliation}',
          description: 'Get directory entries by phone number',
          notes: 'Affiliations can be found under /list/education-affiliation',
          name: 'getDirectoryByAffiliation',
          responseClass: 'LIST[Directory]',
          parameters: [listParam({
            name: 'affiliation',
            paramType: 'path',
            description: 'Affiliation',
            dataType: 'String',
            required: true
          }, values.affiliations)].concat(formatLimitSkip)
        }),
        get({
          path: '/directory/program/{program}',
          description: 'Get directory entries by academic program',
          notes: 'Programs can be found at /list/academic-programs',
          name: 'getDirectoryByProgram',
          responseClass: 'LIST[Directory]',
          parameters: [programParam].concat(formatLimitSkip)
        }),
        get({
          path: '/directory/program/{program}/class/{class}',
          description: 'Get directory entries by program class',
          name: 'getDirectoryByProgramClass',
          responseClass: 'LIST[Directory]',
          parameters: [programParam, listParam({
            name: 'class',
            paramType: 'path',
            description: 'Graduation Class',
            dataType: 'String',
            required: true
          }, classes)].concat(formatLimitSkip)
        }),
        get({
          path: '/directory/program/{program}/graduation-term/{term}',
          description: 'Get directory entries by program and graduation term',
          notes: 'Programs can be found at /list/academic-programs and graduation terms can be found at /list/graduation-term',
          name: 'getDirectoryByProgramGraduation',
          responseClass: 'LIST[Directory]',
          parameters: [programParam, listParam({
            name: 'term',
            paramType: 'path',
            description: 'Graduation term',
            dataType: 'String',
            required: true
          }, values.graduationTerms)].concat(formatLimitSkip)
        })
      ],
      models: {
        Directory: db.schemaToJSON('Directory')
      }
    });


    var yearParam = listParam({
      name: 'year',
      paramType: 'path',
      description: 'Year (YYYY)',
      dataType: 'Number',
      required: true
    }, _.range(2012, 2015));

    var monthParam = listParam({
      name: 'month',
      paramType: 'path',
      description: 'Month (non zero padded)',
      dataType: 'Number',
      required: true
    }, _.range(1, 12));

    var dayParam = listParam({
      name: 'day',
      paramType: 'path',
      description: 'Day (non zero padded)',
      dataType: 'Number',
      required: true
    }, _.range(1, 32));

    var eventApi = extend({
      resourcePath: '/event',
      apis: [
        get({
          path: '/event',
          description: 'Get a list of events',
          name: 'getEvent',
          responseClass: 'LIST[Event]',
          parameters: formatLimitSkip
        }),
        get({
          path: '/event/{id}',
          description: 'Get a event entry by id',
          name: 'getEventById',
          responseClass: 'Event',
          parameters: [idParam, formatParam],
          errorResponses: errRes({
            500: 'Invalid ID'
          })
        }),
        get({
          path: '/event/category/{category}',
          description: 'Get events by category',
          name: 'getEventByCategory',
          responseClass: 'LIST[Event]',
          parameters: [listParam({
            name: 'category',
            paramType: 'path',
            description: 'event category',
            dataType: 'String',
            required: true
          }, values.eventCategories)].concat(formatLimitSkip)
        }),
        get({
          path: '/event/host/{host}',
          description: 'Get events by host',
          name: 'getEventByHost',
          responseClass: 'LIST[Event]',
          parameters: [listParam({
            name: 'host',
            paramType: 'path',
            description: 'event host',
            dataType: 'String',
            required: true
          }, values.eventHosts)].concat(formatLimitSkip)
        }),
        get({
          path: '/event/venue/{venue}',
          description: 'Get events by venue',
          name: 'getEventByVenue',
          responseClass: 'LIST[Event]',
          parameters: [listParam({
            name: 'venue',
            paramType: 'path',
            description: 'event venue',
            dataType: 'String',
            required: true
          }, values.eventVenues)].concat(formatLimitSkip),
          errorResponses: errRes({
            500: 'Invalid Net ID'
          })
        }),
        get({
          path: '/event/affiliation/{affiliation}',
          description: 'Get events by phone number',
          notes: 'Affiliations can be found under /list/education-affiliation',
          name: 'getEventByAffiliation',
          responseClass: 'LIST[Event]',
          parameters: [listParam({
            name: 'affiliation',
            paramType: 'path',
            description: 'Affiliation',
            dataType: 'String',
            required: true
          }, values.affiliations)].concat(formatLimitSkip)
        }),
        get({
          path: '/event/date/{year}/{month}',
          description: 'Get events by year and month',
          name: 'getEventByYearAndMonth',
          responseClass: 'LIST[Event]',
          parameters: [yearParam, monthParam].concat(formatLimitSkip)
        }),
        get({
          path: '/event/date/{year}/{month}/{day}',
          description: 'Get events by date',
          name: 'getEventByDate',
          responseClass: 'LIST[Event]',
          parameters: [yearParam, monthParam, dayParam].concat(formatLimitSkip)
        }),
        get({
          path: '/event/date/today',
          description: 'Get events from today',
          name: 'getEventFromToday',
          responseClass: 'LIST[Event]',
          parameters: formatLimitSkip
        }),
        get({
          path: '/event/date/this-week',
          description: 'Get events from this week',
          name: 'getEventFromThisWeek',
          responseClass: 'LIST[Event]',
          parameters: formatLimitSkip
        })
      ],
      models: {
        Event: db.schemaToJSON('Event')
      }
    });

    var listApi = extend({
      resourcePath: '/list',
      apis: [
        get({
          path: '/list/academic-programs',
          description: 'Get a list of possible academic programs',
          name: 'getAcademicPrograms',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/academic-organization',
          description: 'Get a list of academic organizations',
          name: 'getAcademicOrganizations',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/department',
          description: 'Get a list of department names',
          name: 'getDepartments',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/department-code',
          description: 'Get a list of department codes',
          name: 'getDepartments',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/department/{department}',
          description: 'Get a list of classes in a department',
          name: 'getClassListByDepartment',
          responseClass: 'LIST',
          parameters: [departmentParam].concat(formatLimitSkip)
        }),
        get({
          path: '/list/department/{department}/class/{number}',
          description: 'Get a list of terms a class has been offered',
          name: 'getTermListByClassNumber',
          responseClass: 'LIST',
          parameters: [departmentParam, numberParam].concat(formatLimitSkip)
        }),
        get({
          path: '/list/department/{department}/class/{number}/term/{term}',
          description: 'Get a list of sections of a class in a given semester',
          name: 'getSectionListByClassNumberTerm',
          responseClass: 'LIST',
          parameters: [departmentParam, numberParam, termParam].concat(formatLimitSkip)
        }),
        get({
          path: '/list/education-affiliation',
          description: 'Get a list of education affiliations',
          name: 'getEducationAffiliation',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/event-host',
          description: 'Get a list of event hosts',
          name: 'getEventHosts',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/event-category',
          description: 'Get a list of event categories',
          name: 'getEventCategories',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/event-venue',
          description: 'Get a list of event venues',
          name: 'getEventVenues',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/graduation-term',
          description: 'Get a list of possible graduation terms',
          name: 'getGraduationTerm',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/location',
          description: 'Get a list of building locations',
          name: 'getLocations',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/marker',
          description: 'Get a list of map markers',
          name: 'getMarkers',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/marker-category',
          description: 'Get a list of map marker categories',
          name: 'getMarkerCategories',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/program',
          description: 'Get a list of programs',
          name: 'getPrograms',
          responseClass: 'LIST'
        }),
        get({
          path: '/list/school',
          description: 'Get a list of schools',
          name: 'getSchools',
          responseClass: 'LIST'
        })
      ]
    });


    var locationApi = extend({
      resourcePath: '/location',
      apis: [
        get({
          path: '/location',
          description: 'Get a list of locations',
          name: 'getLocations',
          responseClass: 'LIST[Location]',
          parameters: formatLimitSkip
        }),
        get({
          path: '/location/{id}',
          description: 'Get a location by id',
          name: 'getLocationById',
          responseClass: 'Location',
          parameters: [idParam, formatParam],
          errorResponses: errRes({
            500: 'Invalid ID'
          })
        }),
        get({
          path: '/location/building-id/{buildingId}',
          description: 'Get a location by building id',
          name: 'getLocationByBuildingId',
          responseClass: 'Location',
          parameters: [{
            name: 'buildingId',
            paramType: 'path',
            description: 'Building ID',
            dataType: 'Number',
            required: true
          }, formatParam],
          errorResponses: errRes({
            500: 'Invalid Building ID'
          })
        }),
        get({
          path: '/location/name/{name}',
          description: 'Get a location by name',
          notes: 'location names can be found at /list/location',
          name: 'getLocationByName',
          responseClass: 'Location',
          parameters: [listParam({
            name: 'name',
            paramType: 'path',
            description: 'Location Name',
            dataType: 'String',
            required: true
          }, values.locationNames), formatParam]
        })
      ],
      models: {
        Location: db.schemaToJSON('Location')
      }
    });

    var markerApi = extend({
      resourcePath: '/marker',
      apis: [
        get({
          path: '/marker',
          description: 'Get a list of markers',
          name: 'getMarkers',
          responseClass: 'LIST[Marker]',
          parameters: formatLimitSkip
        }),
        get({
          path: '/marker/{id}',
          description: 'Get marker by id',
          name: 'getMarkerById',
          responseClass: 'Marker',
          parameters: [idParam, formatParam],
          errorResponses: errRes({
            500: 'Invalid ID'
          })
        }),
        get({
          path: '/marker/marker-id/{markerId}',
          description: 'Get marker by marker id',
          name: 'getMarkerByMarkerId',
          responseClass: 'Marker',
          parameters: [{
            name: 'markerId',
            paramType: 'path',
            description: 'Marker ID',
            dataType: 'Number',
            required: true
          }, formatParam],
          errorResponses: errRes({
            500: 'Invalid Marker ID'
          })
        }),
        get({
          path: '/marker/name/{name}',
          description: 'Get marker by name',
          notes: 'marker names can be found at /list/marker',
          name: 'getMarkerByName',
          responseClass: 'Marker',
          parameters: [listParam({
            name: 'name',
            paramType: 'path',
            description: 'Marker Name',
            dataType: 'String',
            required: true
          }, values.markerNames), formatParam]
        }),
        get({
          path: '/marker/category/{category}',
          description: 'Get marker by category',
          notes: 'Categories can be found under /list/marker-category',
          name: 'getMarkerByCategory',
          responseClass: 'LIST[Marker]',
          parameters: [listParam({
            name: 'category',
            paramType: 'path',
            description: 'Marker category',
            dataType: 'String',
            required: true
          }, values.markerCategories), formatParam]
        })
      ],
      models: {
        Marker: db.schemaToJSON('Marker')
      }
    });

    var apis = _.map([
      'class',
      'department',
      'directory',
      'event',
      'list',
      'location',
      'marker'
    ], function(api) { return { path: '/apidoc/' + api }; });

    callback(err, {
      api: extend({
        apis: apis
      }),
      class: classApi,
      department: departmentApi,
      directory: directoryApi,
      event: eventApi,
      list: listApi,
      location: locationApi,
      marker: markerApi
    });
  });
};
