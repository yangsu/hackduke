var AppRouter = Backbone.Router.extend({

    routes: {
        ""                     : "home",
        "courses"              : "list",
        "about"                : "about",
        "documentation"        : "doc",
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    home: function (id) {
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('.content').html(this.homeView.el);
    },

    doc: function (id) {
        if (!this.docView) {
            this.docView = new DocView();
        }
        $('.content').html(this.docView.el);
    },

    list: function(page) {
        var p = page ? parseInt(page, 10) : 1;
        var courseList = new CourseCollection();
        courseList.fetch({success: function(){
            $(".content").html(new CourseListView({model: courseList, page: p}).el);
        }});
    },

    about: function () {
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('.content').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
    },

});

utils.loadTemplate(['HomeView', 'HeaderView', 'CourseListItemView', 'AboutView', 'DocView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});