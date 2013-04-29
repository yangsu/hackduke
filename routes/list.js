var util = require('./util');
var distinct = util.distinct;
var list = util.listEndpoint;

exports.academicOrgs = distinct('Class', 'course-offering.academic-organization');
exports.department = distinct('Department', 'title');
exports.departmentCode = distinct('Department', 'code');
exports.directoryGraduationTerm = distinct('Directory', 'duPSExpGradTermC1');
exports.directoryProgram = distinct('Directory', 'duPSAcadCareerDescC1');
exports.educationalAffiliation = distinct('Directory', 'eduPersonAffiliation');
exports.eventCategory = distinct('Event', 'categories.category.value');
exports.eventHost = distinct('Event', 'creator');
exports.eventVenue = distinct('Event', 'location.address');
exports.location = distinct('Location', 'name');
exports.marker = distinct('Marker', 'markerName');
exports.markerCategory = distinct('Marker', 'categoryName');
exports.programs = distinct('Class', 'course-offering.career');
exports.schools = distinct('Class', 'course-offering.academic-group');
exports.term = distinct('Term', 'title');

exports.class = list('Class', ['department'], 'number title');
exports.section = list('Section', ['department', 'number', 'title'], 'section_id');
exports.term = list('Term', ['department', 'number'], 'title');
