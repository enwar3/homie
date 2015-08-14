// Create Events collection
Events = new Mongo.Collection("events");

// Routing
Router.route('/', function() {
  this.render('home');
});

Router.route('/triggerEvent/:name', function() {
  // Set reactive = false to avoid infinite loop; look into this later
  var event = Events.findOne({name: this.params.name}, {reactive: false});
  Meteor.call("triggerEvent", event._id);

  // Pass on the event name
  this.render('triggerEvent', {
    data: {
      eventName: event.name
    }
  });
});

if (Meteor.isClient) {
  Template.home.helpers({
    currentEvent: function () {
      return Events.findOne({}, {sort: {lastPlayed: -1}});
    },
    events: function() {
      return Events.find({}, {sort: {lastPlayed: -1}});
    }
  });

  Template.home.events({
    "submit .new-event": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form elements
      var url = event.target.url.value;
      var name = event.target.name.value;

      // Don't submit form unless we have both
      if (!url || !name) {
        return false;
      }
 
      // Insert an event into the collection
      Meteor.call("addEvent", name, url);
 
      // Clear form
      event.target.url.value = "";
      event.target.name.value = "";
    }
  });

  // Event handlers on the event template
  Template.event.events({
    // Delete this event
    "click .delete": function () {
      Meteor.call("deleteEvent", this._id);
    },

    // Trigger this event
    "click .trigger": function() {
      Meteor.call("triggerEvent", this._id);
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
  // Add a new event
  addEvent: function (name, url) {
    Events.insert({
      name: name,
      url: url,
      createdAt: new Date(),
      lastPlayed: new Date()
    });
  },

  // Delete this event
  deleteEvent: function (eventId) {
    Events.remove(eventId);
  },

  // Trigger this event by setting lastPlayed to now
  triggerEvent: function (eventId) {
    Events.update(eventId, { $set: { lastPlayed: new Date() } });
  }
});
