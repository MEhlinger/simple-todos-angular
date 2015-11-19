Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  angular.module('simple-todos',['angular-meteor', 'accounts.ui']);

  angular.module('simple-todos').controller('TodosListCtrl', ['$scope', '$meteor',
    function ($scope, $meteor) {

      $scope.$meteorSubscribe('tasks');

      $scope.tasks = $meteor.collection(function () {
        return Tasks.find($scope.getReactively('query'), {sort : {createdAt: -1}});
      });

      $scope.addTask = function (newTask) {
        $meteor.call('addTask', newTask);
        Bert.alert({
          title: "New Task Added!",
          message: '"' + newTask + '" added.',
          style: 'growl-top-right',
          type: 'success'
        });
      };

      $scope.deleteTask = function (task) {
        $meteor.call('deleteTask', task._id);
        Bert.alert({
          title: "Task Deleted!",
          message: '"' + task.text + '" deleted.',
          type: 'danger',
          style: 'growl-top-right'
        });
      };

      $scope.setChecked = function (task) {
        $meteor.call('setChecked', task._id, !task.checked);
        if (task.checked) {
          Bert.alert({
            title: "Task Completed!",
            message: '"' + task.text + '"',
            type: 'info',
            style: 'growl-top-right'
          });
        }
      };

      $scope.setPrivate = function (task) {
        $meteor.call('setPrivate', task._id, !task.private);
        Bert.alert({
          title: "Task Privacy Changed!",
          message: '"' + task.text + '" set to ' + (task.private ? "private" : "public") + ".",
          type: 'privacy-changed',
          style: 'growl-top-right',
          icon: 'fa-warning'
        });
      };

      $scope.$watch('hideCompleted', function () {
        if ($scope.hideCompleted) {
          $scope.query = {checked: {$ne : true}};
        } else {
          $scope.query = {};
        }
      });

      $scope.incompleteCount = function () {
        return Tasks.find({checked: {$ne : true}}).count();
      };
  }]); 
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // STARTUP ONLY
  });

  Meteor.publish('tasks', function () {
      return Tasks.find({
        $or: [
        {private: {$ne: true}},
        {owner: this.userId}
        ]
      });
    });
}


Meteor.methods({
  addTask : function(text) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("unauthorized behavior");
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
      throw new Meteor.Error('not-authorized');
    }
    Tasks.remove(taskId);
  },

  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },

  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Tasks.update(taskId, {$set: {private :setToPrivate}});
  }
});