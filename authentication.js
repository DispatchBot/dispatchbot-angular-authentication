var module = angular.module('dispatchbot.authentication', ['ngResource']);
/**
 * Our authentication controllers.
 */
module.controller('LoginController', ['$scope', '$window', '$location', 'Session', 'SessionStore', function ($scope, $window, $location, Session, SessionStore) {
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

  $scope.user = {login: '', password: '', organization_id: '-1'};
  $scope.message = '';
  $scope.submit = function () {

    Session.login(
      { user: $scope.user},
      function (data, status, headers, config) {
        SessionStore.store(data);
        redirect($location, $window);
      },
      function (data, status, headers, config) {
        // Erase the token if the user fails to log in
        SessionStore.destroy();

        // Handle login errors here
        $scope.message = 'Error: Invalid user or password';
      }
    );
  };
}])
.controller('LogoutController', ['$scope', '$window', '$location', 'Session', 'SessionStore', function($scope, $window, $location, Session, SessionStore) {
  Session.logout(function() {
    SessionStore.destroy();
  })
}])
.controller('UnauthorizedController', ['$scope', function($scope) {
  // Just render a view
}]);

/**
 * The service.
 */
module.factory('SessionStore', ['$window', function($window) {
  var SessionStore = {};
  SessionStore.getUserId = function() {
    return $window.sessionStorage.user_id;
  };

  SessionStore.getToken = function() {
    return $window.sessionStorage.token;
  };

  SessionStore.getLogin = function() {
    return $window.sessionStorage.login;
  };

  SessionStore.store = function(data) {
    $window.sessionStorage.token = data.token;
    $window.sessionStorage.login = data.login;
    $window.sessionStorage.user_id = data.user_id;
  };

  SessionStore.destroy = function() {
    delete $window.sessionStorage.user_id;
    delete $window.sessionStorage.token;
    delete $window.sessionStorage.login;
  };

  SessionStore.isLoggedIn = function() {
    return !!$window.sessionStorage.token;
  };

  return SessionStore;
}]);

module.factory('Session', ['$resource', 'DispatchBotConfig', '$window', function($resource, DispatchBotConfig, $window) {
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
  });
}]);

module.factory('Organization', ['$resource', 'DispatchBotConfig', function($resource, DispatchBotConfig) {
  return $resource(DispatchBotConfig.api_host + '/organizations/key/:key.json', {}, {
    lookup: {
      method: 'GET'
    }
  })
}]);

/**
 * The interceptor.
 */
module.factory('authInterceptor', ['$rootScope', '$q', '$window', '$location', 'SessionStore', function ($rootScope, $q, $window, $location, SessionStore) {
  var loginPath = '/login'; // TODO: This should not be hard-coded

  var handle401 = function(response) {
    SessionStore.destroy();

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
      if (SessionStore.isLoggedIn()) {
        config.headers['X-User-Email'] = SessionStore.getLogin();
        config.headers['X-User-Token'] = SessionStore.getToken();
      }
      return config;
    },

    responseError: function (response) {
      switch (response.status) {
        case 401:
          handle401(response);
          break;
        case 403:
          handle403(response);
          break;
      }

      return $q.reject(response);
    }
  };
}]);
