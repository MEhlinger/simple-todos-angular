Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"
});

angular.module('simple-todos',['angular-meteor', 'accounts.ui']);

angular.module('simple-todos').controller('TodosListCtrl', ['$scope', '$meteor',
  function ($scope, $meteor) {

    $scope.$meteorSubscribe('tasks');

    $scope.tasks = $meteor.collection(function () {
      return Tasks.find($scope.getReactively('query'), {sort : {createdAt: -1}});
    });

    $scope.addTask = function (newTask) {
      $meteor.call('addTask', newTask).then(
        function(data) {
          Bert.alert({
            title: "New Task Added!",
            message: '"' + newTask + '" added.',
            style: 'growl-top-right',
            type: 'success'
          });
        },
        function(err) {
          Bert.alert({
            title: "Unauthorized Attempt",
            message: "" + err,
            style: 'growl-top-right',
            type: 'danger'
          });
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
      $meteor.call('setChecked', task._id, !task.checked).then(
        function(data){
          Bert.alert({
            title: "Task Completed!",
            message: '"' + task.text + '"',
            type: 'info',
            style: 'growl-top-right'
          });
        },
        function(err){
          Bert.alert({
            title: "Unauthorized Attempt",
            message: "" + err,
            style: 'growl-top-right',
            type: 'danger'
          });
        });
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