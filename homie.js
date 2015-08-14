// Create Events collection
Events = new Mongo.Collection("events");

// Routing
Router.route('/', function() {
  this.render('home');
});

Router.route('/triggerEvent/:name', function() {
  // Find and trigger this event
  var event = Events.findOne({name: this.params.name});
  Meteor.call("triggerEvent", event._id);

  // Return server response
  var res = this.response;
  res.end('Triggered event!\n');
}, {where: 'server'});

if (Meteor.isClient) {
  // Set up timer
  Meteor.startup(function () {
    setInterval(function () {
      updateTime();
    }, 500);
  });

  Template.home.helpers({
    currentEvent: function () {
      return Events.findOne({}, {sort: {lastPlayed: -1}});
    },
    events: function() {
      return Events.find({}, {sort: {lastPlayed: -1}});
    },
    currentTime: function() {
      return Session.get("time");
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
  },
});

// Update the time on the session, and make a wakeup call if necessary
function updateTime() {
  now = new Date();
  hours = now.getHours();
  minutes = now.getMinutes();
  seconds = now.getSeconds();

  // Trigger wakeup event
  if (hours == 9 && minutes == 0 && seconds == 0) {
    Meteor.call("triggerEvent", Events.findOne({name: 'wakeup'}));
  }

  // Update session with current time
  Session.set("time", now);
}
