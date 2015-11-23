Meteor.startup(function () {
	Accounts.emailTemplates.from = 'Verification <no-reply@simple-todos.com>';
	Accounts.emailTemplates.siteName= 'simpleTODOS';
});

Meteor.publish('tasks', function () {
  return Tasks.find({
    $or: [
    {private: {$ne: true}},
    {owner: this.userId}
    ]
  });
});

Accounts.config({
	sendVerificationEmail : true
});