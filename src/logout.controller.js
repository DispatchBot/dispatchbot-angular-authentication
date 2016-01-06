module.exports = function(appModule) {
  appModule.controller('LogoutController', ['Session', 'SessionStore', function(Session, SessionStore) {
    Session.logout(function() {
      SessionStore.destroy();
    })
  }])
}
