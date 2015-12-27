function(angular) {
  var module = angular.module('dispatchbot.authentication', ['ngResource', 'ngCookies']);

  /**
   * Our authentication controllers.
   */
  module.controller('LoginController', ['$scope', '$rootScope', '$window', '$location', 'Session', 'SessionStore', 'ShuttleBotConfig', function ($scope, $rootScope, $window, $location, Session, SessionStore, ShuttleBotConfig) {
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

    var host = function() {
      var parts = ShuttleBotConfig.host.split('.');
      if (parts.length > 2) {
        return parts[1] + '.' + parts[2]
      } else  {
        return ShuttleBotConfig.host
      }
    }

    if (document.referrer == ShuttleBotConfig.protocol +  host() + '/' && !$rootScope.redirectFromResolve) {
      $rootScope.redirectFromResolve = true;
      $rootScope.withOrganization.promise.then(function() {
        $scope.message = "We identified that you are using ShuttleBot with " + $rootScope.organization.name + " and redirected you to their homepage. Please try to login again.";
      });
    }

    $scope.$on('dispatchbot.authentication.failure', function (event, data) {
      var desiredOrganizationKey = data.data.organization_key

      if (desiredOrganizationKey) {
        $window.location.href = ShuttleBotConfig.protocol + desiredOrganizationKey + "." + ShuttleBotConfig.host + "/#/login"
      } else {
        $scope.message = 'Error: Invalid user or password';
      }
    });
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
  module.factory('SessionStore', ['$cookies', function($cookies) {
    var SessionStore = {};
    SessionStore.getUserId = function() {
      return $cookies['user_id'];
    };

    SessionStore.getToken = function() {
      return $cookies['token'];
    };

    SessionStore.getLogin = function() {
      return $cookies['login'];
    };

    SessionStore.store = function(data) {
      $cookies['token'] = data.token;
      $cookies['login'] = data.login;
      $cookies['user_id'] = data.user_id;
    };

    SessionStore.destroy = function() {
      delete $cookies["user_id"]
      delete $cookies["token"]
      delete $cookies["login"]
    };

    SessionStore.isLoggedIn = function() {
      return !!$cookies['token'];
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
    return $resource(DispatchBotConfig.api_host + '/organizations', {}, {
      lookup: {
        method: 'GET',
        url: DispatchBotConfig.api_host + '/organizations/key/:key.json'
      },
      providers: {
        method: 'GET',
        isArray: true,
        url: DispatchBotConfig.api_host + '/organizations/:id/providers.json'
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

      $rootScope.$broadcast('dispatchbot:authentication:unauthenticated', response);
    };

    var handle403 = function(response) {
      $rootScope.$broadcast('dispatchbot:authorization:failure');
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

  module.directive('dbUserLogin', ['Session', 'SessionStore' , function(Session, SessionStore) {
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
}(angular);
