module.exports = function(appModule) {
  appModule.factory('authInterceptor', ['$rootScope', '$q', '$window', '$location', 'SessionStore', function ($rootScope, $q, $window, $location, SessionStore) {
    var loginPath = '/login'; // TODO: This should not be hard-coded

    var WHITELIST_DOMAINS = [ 'localhost', 'dispatchbot.com', 'dpb.local' ];

    var handle401 = function(response) {
      SessionStore.destroy();
      if ($location.path().toLowerCase() != loginPath) {
        $window.sessionStorage.redirectAfterAuth = $location.path();
      }

      $rootScope.$broadcast('dispatchbot:authentication:unauthenticated', response);
    };

    var handle403 = function(response) {
      $rootScope.$broadcast('dispatchbot:authorization:failure', response);
    };

    return {
      request: function (config) {
        var isDispatchBot = WHITELIST_DOMAINS.map(function(d) {
          return config.url.indexOf(d) >= 0;
        }).indexOf(true) >= 0;

        config.headers = config.headers || {};
        if (isDispatchBot && SessionStore.isLoggedIn()) {
          config.headers['X-User-Email'] = SessionStore.getLogin();
          config.headers['X-User-Token'] = SessionStore.getToken();
        } else {
          delete config.headers['X-User-Email'];
          delete config.headers['X-User-Token'];
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
}
