
window.courses = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function() {
    console.log('Hello from Backbone!');
    $.getJSON('../data/courses.json', function (data) {
      courses.courses = new courses.Collections.CourseCollection(data);

      courses.attributes = {};
      var keys = _.keys(courses.courses.at(0).attributes);
      _.each(keys, function (key) {
        courses.attributes[key] = _.keys(courses.courses.groupByAttr(key));
      });

      courses.view = new courses.Views.courseView({model: courses.courses});

    });
  },
  toTitleCase: function (str) {
    return $.trim(str).replace(/-|_/, ' ').replace(/\w+/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  Templates: {},
  getTemplate: function (templateName) {
    var path = 'scripts/templates/' + templateName + ".ejs";

    if (!courses.Templates[path]) {
      $.ajax({ url: path, async: false }).then(function(contents) {
        courses.Templates[path] = _.template(contents);
      });
    }

    return courses.Templates[path];
  }
};

$(document).ready(function(){
  courses.init();
  courses.visualSearch = VS.init({
    container : $('.visual_search'),
    query     : '',
    callbacks : {
      search       : function(query, searchCollection) {
        courses.courses.filterByAttrs(courses.visualSearch.searchQuery.facets());
      },
      facetMatches : function(callback) {
        var rt = _.map(courses.attributes, function (value, key) {
          if (/^[A-Z]+$/.test(key)) {
            return { label: key, value: key, category: 'class attribute' };
          } else {
            return { label: courses.toTitleCase(key), value: key, category: 'attribute' };
          }
        });
        callback(rt);
      },
      valueMatches : function(facet, searchTerm, callback) {
        var rt = _.map(courses.attributes[facet], function (attr) {
          return { value: attr, label: attr };
        });
        callback(rt);
      }
    }
  });
});
