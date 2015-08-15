// Create collections
EventTypes = new Mongo.Collection("eventTypes");
Events = new Mongo.Collection("events");

// Routing
Router.route('/', function () {
  this.render('home');
});

Router.route('/triggerEventType/:name', function () {
  // Find and trigger this event
  var eventType = EventTypes.findOne({name: this.params.name});
  Meteor.call("triggerEventType", eventType._id);

  // Return server response
  var res = this.response;
  res.end('Triggered event!\n');
}, {where: 'server'});

// TODO publish database objects from server

if (Meteor.isClient) {
  // Set up timer
  Meteor.startup(function () {
    setInterval(function () {
      updateTime();
    }, 500);
  });

  Template.home.helpers({
    currentEvent: function () {
      return Events.findOne({}, {sort: {createdAt: -1}});
    },
    events: function () {
      return Events.find({}, {sort: {createdAt: -1}, limit: 10});
    },
    eventTypes: function () {
      return EventTypes.find({}, {sort: {createdAt: -1}});
    },
    currentTime: function () {
      return Session.get("time");
    }
  });

  Template.home.events({
    "submit .new-event-type": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form elements
      var url = event.target.url.value;
      var name = event.target.name.value;
      var description = event.target.description.value;

      // Don't submit form unless we have both
      if (!url || !name || !description) {
        return false;
      }
 
      // Insert an event into the collection
      Meteor.call("addEventType", name, description, url);
 
      // Clear form
      event.target.url.value = "";
      event.target.name.value = "";
      event.target.description.value = "";
    }
  });

  // Event handlers on the event template
  Template.eventType.events({
    // Delete this event
    "click .delete": function () {
      Meteor.call("deleteEventType", this._id);
    },

    // Trigger this event
    "click .trigger": function() {
      Meteor.call("triggerEventType", this._id);
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
  addEventType: function (name, description, url) {
    EventTypes.insert({
      name: name,
      description: description,
      url: url,
      createdAt: new Date()
    });
  },

  // Delete this event
  deleteEventType: function (eventId) {
    EventTypes.remove(eventId);
  },

  // Trigger this event by setting lastPlayed to now
  triggerEventType: function (eventTypeId) {
    eventType = EventTypes.findOne({_id: eventTypeId});
    Events.insert({
      eventType: eventType,
      createdAt: new Date()
    });
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
    Meteor.call("triggerEventType", EventTypes.findOne({name: 'wakeup'}));
  }

  // Update session with current time
  Session.set("time", now);
}
