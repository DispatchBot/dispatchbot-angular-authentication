module.exports = function(appModule) {
  appModule.directive('dbUserLogin', ['Session', 'SessionStore' , function(Session, SessionStore) {
    return {
      restrict: 'E',
      templateUrl: function(elem,attrs) {
        return attrs.dbTemplateUrl
      },
      scope: {
        organization: "=dbOrganization",
      },
      link: function(scope, element, attributes, ngModel) {
        scope.user = {};

        scope.submit = function() {
          if (scope.organization) {
            scope.user.organization_id = scope.organization.id;
          }

          Session.login(
            { user: scope.user},
            function (data, status, headers, config) {
              SessionStore.store(data);
              scope.$emit("dispatchbot.authentication.success", data);
            },
            function (data, status, headers, config) {
              // Erase the token if the user fails to log in
              SessionStore.destroy();
              scope.$emit("dispatchbot.authentication.failure", data);
            }
          );
        }
      }
    };
  }]);
}
