/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var appModule = angular.module('dispatchbot.authentication', [
	    'ngResource',
	    'angular-cache'
	  ]);

	  __webpack_require__(1)(appModule);
	  __webpack_require__(2)(appModule);
	  __webpack_require__(3)(appModule);
	  __webpack_require__(4)(appModule);
	  __webpack_require__(5)(appModule);

	  __webpack_require__(6)(appModule);
	  __webpack_require__(7)(appModule);
	  __webpack_require__(8)(appModule);


	  /**
	   * ON_TEST is set by webpack (see the config for how). This approach allows us to
	   * pass the appModule into the test module so that everything is encapsulated nicely.
	   */
	  if (false) {
	    require('./session-store.test')(appModule);
	  }
	})();

	module.exports = {};


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = function(appModule) {

	  appModule.factory('SessionStore', ['CacheFactory', SessionStore]);

	  function SessionStore(CacheFactory) {

	    var cache = CacheFactory.get('sessionStore');
	    if (!cache) {
	      cache = CacheFactory.createCache('sessionStore', {
	        deleteOnExpire: true,
	        recycleFreq: 60000
	      });
	    }

	    var SessionStore = {};
	    SessionStore.getUserId = function() {
	      return cache.get('user_id');
	    };

	    SessionStore.getToken = function() {
	      return cache.get('token');
	    };

	    SessionStore.getLogin = function() {
	      return cache.get('login');
	    };

	    SessionStore.store = function(data) {
	      options = {};
	      cache.put('token', data.token, options);
	      cache.put('login', data.login, options);
	      cache.put('user_id', data.user_id, options);
	    };

	    SessionStore.destroy = function() {
	      cache.remove('user_id');
	      cache.remove('token');
	      cache.remove('login');
	    };

	    SessionStore.isLoggedIn = function() {
	      return !!cache.get('token');
	    };

	    return SessionStore;
	  };
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function(appModule) {

	  appModule.provider('Session', function() {
	    var _config;

	    return {
	      configure: function(config) {
	        _config = config;
	      },

	      $get: ['$resource', function($resource) {
	        return $resource(_config.API_URL + '/users/:action.json', {}, {
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
	      }]
	    }
	  });
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = function(appModule) {
	  appModule.provider('Organization', function() {
	    var _config;
	    return {
	      configure: function(config) {
	        _config = config;
	      },

	      $get: ['$resource', function($resource) {
	        return $resource(config.API_URL + '/organizations', {}, {
	          lookup: {
	            method: 'GET',
	            url: config.API_URL + '/organizations/key/:key.json'
	          },
	          providers: {
	            method: 'GET',
	            isArray: true,
	            url: config.API_URL + '/organizations/:id/providers.json'
	          }
	        });
	      }]
	    }
	  });
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(appModule) {
	  appModule.factory('authInterceptor', ['$rootScope', '$q', '$window', '$location', 'SessionStore', function ($rootScope, $q, $window, $location, SessionStore) {
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
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

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


/***/ },
/* 6 */
/***/ function(module, exports) {

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


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function(appModule) {
	  appModule.controller('LogoutController', ['Session', 'SessionStore', function(Session, SessionStore) {
	    Session.logout(function() {
	      SessionStore.destroy();
	    })
	  }])
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = function(appModule) {
	  appModule.controller('UnauthorizedController', ['$scope', function($scope) {
	    // Just render a view
	  }])
	}


/***/ }
/******/ ]);