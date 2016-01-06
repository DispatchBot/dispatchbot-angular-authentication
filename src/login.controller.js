module.exports = function(appModule) {
  /**
   * Our authentication controllers.
   */
  appModule.controller('LoginController', ['$scope', '$rootScope', '$window', '$location', 'Session', 'SessionStore', function ($scope, $rootScope, $window, $location, Session, SessionStore) {
    var redirect = function($location, $window) {
      var redirectTo = '/';
      if ($window.sessionStorage.redirectAfterAuth) {
        redirectTo = $window.sessionStorage.redirectAfterAuth;
        delete $window.sessionStorage.redirectAfterAuth;
      }
      $location.path(redirectTo);
    };

    if (SessionStore.isLoggedIn()) {
      redirect($location, $window);
      return;
    }

    $scope.$on('dispatchbot.authentication.success', function (event, data) {
      $rootScope.parentMessage = "You have logged in successfully.";
      redirect($location, $window);
    });

    // TODO: Get rid of ShuttleBot config!
    var host = function() {
      var parts = ShuttleBotConfig.host.split('.');
      if (parts.length > 2) {
        return parts[1] + '.' + parts[2]
      } else  {
        return ShuttleBotConfig.host
      }
    }

    // TODO: This should move to ShuttleBot
    if (document.referrer == ShuttleBotConfig.protocol +  host() + '/' && !$rootScope.redirectFromResolve) {
      $rootScope.redirectFromResolve = true;
      $rootScope.withOrganization.promise.then(function() {
        $scope.message = "We identified that you are using ShuttleBot with " + $rootScope.organization.name + " and redirected you to their homepage. Please try to login again.";
      });
    }

    $scope.$on('dispatchbot.authentication.failure', function (event, data) {
      var desiredOrganizationKey = data.data.organization_key

      if (desiredOrganizationKey) {
        // TODO: ShuttleBot config!!
        $window.location.href = ShuttleBotConfig.protocol + desiredOrganizationKey + "." + ShuttleBotConfig.host + "/#/login"
      } else {
        $scope.message = 'Error: Invalid user or password';
      }
    });
  }])
}
