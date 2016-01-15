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


  /**
   * ON_TEST is set by webpack (see the config for how). This approach allows us to
   * pass the appModule into the test module so that everything is encapsulated nicely.
   */
  if (ON_TEST) {
    require('./session-store.test')(appModule);
  }
})();

module.exports = {};
