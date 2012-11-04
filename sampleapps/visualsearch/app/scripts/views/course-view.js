courses.Views.courseView = Backbone.View.extend({

  el: '#results',
  template: courses.getTemplate('course'),
  initialize: function () {
    this.model.bind('change', this.render, this);
  },
  render: function () {
    var self = this;
    self.$el.html(_.reduce(self.model.filteredModels, function (memo, model) {
      return memo + self.template(model.toJSON());
    }, ''));
    return self;
  }

});
