(function() {
  var appModule = angular.module('dispatchbot.authentication', [
    'ngResource',
    'angular-cache'
  ]);

  require('./session-store')(appModule);
  require('./session')(appModule);
  require('./organization')(appModule);
  require('./auth-interceptor')(appModule);
  require('./user-login.directive')(appModule);

  /**
   * ON_TEST is set by webpack (see the config for how). This approach allows us to
   * pass the appModule into the test module so that everything is encapsulated nicely.
   */
  if (ON_TEST) {
    require('./session-store.test')(appModule);
  }
})();

module.exports = {};
