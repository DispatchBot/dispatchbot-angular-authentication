var module = angular.module('dispatchbot.authentication', ['ngResource']);
/**
 * Our authentication controllers.
 */
module.controller('LoginController', ['$scope', '$window', '$location', 'Session', function ($scope, $window, $location, Session) {
  var redirect = function($location, $window) {
    var redirectTo = '/';
    if ($window.sessionStorage.redirectAfterAuth) {
      redirectTo = $window.sessionStorage.redirectAfterAuth;
      delete $window.sessionStorage.redirectAfterAuth;
    }
    $location.path(redirectTo);
  };

  if ($window.sessionStorage.token && $window.sessionStorage.email) {
    redirect($location, $window);
    return;
  }
  $scope.user = {login: '', password: '', organization_id: '-1'};
  $scope.message = '';
  $scope.submit = function () {

    Session.login(
      { user: $scope.user},
      function (data, status, headers, config) {
        $window.sessionStorage.token = data.token;
        $window.sessionStorage.email = $scope.user.login;
        redirect($location, $window);
      },
      function (data, status, headers, config) {
        // Erase the token if the user fails to log in
        delete $window.sessionStorage.token;
        delete $window.sessionStorage.email;

        // Handle login errors here
        $scope.message = 'Error: Invalid user or password';
      }
    );
  };
}])
.controller('LogoutController', ['$scope', '$window', '$location', 'Session', function($scope, $window, $location, Session) {
    Session.logout(function() {
      delete $window.sessionStorage.token;
      delete $window.sessionStorage.email;
    })
}])
.controller('UnauthorizedController', ['$scope', function($scope) {
  // Just render a view
}]);

/**
 * The service.
 */
module.factory('Session', ['$resource', 'DispatchBotConfig', function($resource, DispatchBotConfig) {
  return $resource(DispatchBotConfig.api_host + '/users/:action.json', {}, {
    login: {
      method: 'POST',
      params: {
        action: 'sign_in'
      }
    },
    logout: {
      method: 'DELETE',
      params: {
        action: 'sign_out'
      }
    }
  })
}]);

/**
 * The interceptor.
 */
module.factory('authInterceptor', function ($rootScope, $q, $window, $location) {
  var loginPath = '/login'; // TODO: This should not be hard-coded

  var handle404 = function(response) {
    delete $window.sessionStorage.token;
    delete $window.sessionStorage.email;

    if ($location.path().toLowerCase() != loginPath) {
      $window.sessionStorage.redirectAfterAuth = $location.path();
    }

    $rootScope.$broadcast('event:unauthorized');
    $location.path(loginPath);
  };

  var handle403 = function(response) {
    $rootScope.$broadcast('event:unauthorized');
    $location.path('/unauthorized'); // TODO: This should not be hard-coded
  };

  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers['X-User-Email'] = $window.sessionStorage.email;
        config.headers['X-User-Token'] = $window.sessionStorage.token;
      }
      return config;
    },

    responseError: function (response) {
      switch (response.status) {
        case 401:
          handle404(response);
          break;
        case 403:
          handle403(response);
          break;
      }

      return $q.reject(response);
    }
  };
});
