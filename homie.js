Youtubes = new Mongo.Collection("youtubes");

if (Meteor.isClient) {
  Template.body.helpers({
    currentYoutube: function () {
      return Youtubes.findOne({}, {sort: {createdAt: -1}}).url;
    },
    youtubeList: function() {
      return Youtubes.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-youtube": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var url = event.target.text.value;
 
      // Insert a task into the collection
      Meteor.call("addYoutube", url);
 
      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

// Database methods
Meteor.methods({
  addYoutube: function (url) {
    // Add youtube URL 
    Youtubes.insert({
      url: url,
      createdAt: new Date(),
    });
  }
});
