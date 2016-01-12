var angular = require('angular');

require('angular-resource');
require('angular-cookies');

if (ON_TEST) {
  require('angular-mocks/angular-mocks');
}

(function() {
  var appModule = angular.module('dispatchbot.authentication', [
    'ngResource',
    'ngCookies'
  ]);

  require('./session-store')(appModule);
  require('./session')(appModule);
  require('./organization')(appModule);
  require('./auth-interceptor')(appModule);
  require('./user-login.directive')(appModule);

  require('./login.controller')(appModule);
  require('./logout.controller')(appModule);
  require('./unauthorized.controller')(appModule);
})();

module.exports = {};
