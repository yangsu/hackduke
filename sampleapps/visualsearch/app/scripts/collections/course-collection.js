courses.Collections.CourseCollection = Backbone.Collection.extend({

  model: courses.Models.CourseModel,
  lastFilter: {},
  filteredModels: [],
  filterByAttrs: function (arrayOfAttrs) {
    if (!_.isEqual(arrayOfAttrs, this.lastFilter)) {
      this.lastFilter = arrayOfAttrs;
      var chain = this.chain();
      _.each(arrayOfAttrs, function (facet) {
        chain = chain.filter(function (course) {
          return _.all(facet, function (value, key) {
            return course.get(key) == value;
          });
        });
      });
      this.filteredModels = chain.value();
      this.trigger('change');
    }
  },
  groupByAttr: function(attr) {
    return this.groupBy(function (course) {
      return course.get(attr);
    });
  }
});
