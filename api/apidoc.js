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

function listParam(opt) {
  return {
    dataType: opt.dataType,
    description: opt.description,
    name: opt.name,
    paramType: opt.paramType,
    defaultValue: opt.values[0],
    allowableValues: {
      values: opt.values,
      valueType: 'LIST'
    },
    required: !!opt.required
  };
}

var formatParam = listParam({
  name: 'format',
  description: 'Format of the response',
  dataType: 'String',
  paramType: 'query',
  values: ['basic', 'detailed', 'raw'],
  required: false
});

var baseOpt = [formatParam, {
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

module.exports = function(callback) {
  async.parallel({
    departments: function(cb) {
      db.Department.distinct('code').exec(cb);
    }
  }, function(err, values) {

    var departmentParam = listParam({
      name: 'department',
      paramType: 'path',
      description: 'department code',
      dataType: 'String',
      values: values.departments,
      required: true
    });

    var classApi = extend({
      resourcePath: '/class',
      apis: [
        get({
          path: '/class',
          description: 'Get a list of class',
          name: 'getClasses',
          responseClass: 'Class',
          parameters: baseOpt
        }),
        get({
          path: '/class/{classId}',
          description: 'Get a class by id',
          name: 'getClassById',
          responseClass: 'Class',
          parameters: [{
            name: 'classId',
            paramType: 'path',
            description: 'Class Id',
            dataType: 'String',
            required: true
          }],
          errorResponses: errRes({
            500: 'Invalid ID'
          })
        }),
        get({
          path: '/class/department/{department}',
          description: 'Get a list of class from a department',
          name: 'getClassFromDepartment',
          notes: 'department codes can be found at /list/department-code',
          responseClass: 'Class',
          parameters: [departmentParam, formatParam],
          errorResponses: errRes({
            500: 'Invalid ID'
          })
        }),
        get({
          path: '/class/department/{department}/number/{number}',
          description: 'Get a class by class number',
          name: 'getClassByClassNumber',
          responseClass: 'Class',
          parameters: [departmentParam].concat(baseOpt),
          errorResponses: errRes({
            500: 'Invalid ID'
          })
        })
      ]
    });

    callback(err, extend({
      apis: [{
        path: '/apidoc/class'
      // }, {
      //   path: '/doc/department'
      // }, {
      //   path: '/doc/directory'
      // }, {
      //   path: '/doc/event'
      // }, {
      //   path: '/doc/list'
      // }, {
      //   path: '/doc/location'
      // }, {
      //   path: '/doc/marker'
      }],
      class: classApi
    }));
  });
};
