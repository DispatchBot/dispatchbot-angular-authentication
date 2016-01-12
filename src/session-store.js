module.exports = function(appModule) {

  appModule.factory('SessionStore', ['$cookies', SessionStore]);

  if (ON_TEST) {
    require('./session-store.test')(appModule);
  }

  function SessionStore($cookies) {
    var SessionStore = {};
    SessionStore.getUserId = function() {
      return $cookies.get('user_id');
    };

    SessionStore.getToken = function() {
      return $cookies.get('token');
    };

    SessionStore.getLogin = function() {
      return $cookies.get('login');
    };

    SessionStore.store = function(data) {
      options = {};
      $cookies.put('token', data.token, options);
      $cookies.put('login', data.login, options);
      $cookies.put('user_id', data.user_id, options);
    };

    SessionStore.destroy = function() {
      delete $cookies.remove('user_id');
      delete $cookies.remove('token');
      delete $cookies.remove('login');
    };

    SessionStore.isLoggedIn = function() {
      return !!$cookies.get('token');
    };

    return SessionStore;
  };
}
