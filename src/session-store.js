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
