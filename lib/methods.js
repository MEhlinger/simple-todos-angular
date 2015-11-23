Meteor.methods({
  addTask : function(text) {
    if (! Meteor.userId() || ! Meteor.user().emails[0].verified) {
      throw new Meteor.Error('not-authorized', "User must be logged-in and email verified");
    }

    Tasks.insert({
      text : text,
      createdAt : new Date(),
      owner : Meteor.userId(),
      username : Meteor.user().username
    });
  },

  deleteTask : function(taskId) {
    var task = Tasks.findOne(taskId);
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'Only task owner can delete.');
    }
    Tasks.remove(taskId);
  },

  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized', 'Only task owner can set private as checked');
    } else if (!Meteor.user().emails[0].verified) {
      throw new Meteor.Error('not-authorized', "Email must be verified to edit tasks.")
    }

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },

  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'Only task owner can set as private.');
    }
    Tasks.update(taskId, {$set: {private :setToPrivate}});
  }
  
});
