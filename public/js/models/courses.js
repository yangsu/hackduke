window.Course = Backbone.Model.extend({

    urlRoot: "/courses",

    idAttribute: "_id",

    initialize: function () {
        this.validators = {};
        /*
        this.validators.title = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter a title"};
        };
        */
    },

    validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },

    defaults: {
        year: "",
        term: "",
        department: "",
        course_number: "",
        course_name: "",
        ALP: 0,
        CZ: 0,
        SS: 0,
        QS: 0,
        NS: 0,
        FL: 0,
        STS: 0,
        CCI: 0,
        EI: 0,
        W: 0,
        R: 0,
    }
});

window.CourseCollection = Backbone.Collection.extend({

    model: Course,

    url: "/courses"

});