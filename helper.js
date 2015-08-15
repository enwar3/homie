Handlebars.registerHelper('formatDate', function(date) {
    return moment(date).format("h:mm:ss a MMM Do YYYY ");
});

Handlebars.registerHelper('formatTime', function(date) {
    return moment(date).format("h:mm:ss a");
});
