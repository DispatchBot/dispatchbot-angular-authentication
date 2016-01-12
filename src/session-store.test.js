var angular = require('angular');

module.exports = function(appModule) {
  describe('SessionStore', function() {

    var SessionStore, user;

    beforeEach(function() {
      return window.module(appModule.name);
    });

    beforeEach(inject(['SessionStore', function(_SessionStore) {
      user = { user_id: '1', token: 'abc123', login: 'test@abc.com' };
      SessionStore = _SessionStore;
      SessionStore.store(user);
    }]));

    it('should get login', function() {
      var login = SessionStore.getLogin();
      expect(login).to.eql(user.login);
    });

    it('should get token', function() {
      var token = SessionStore.getToken();
      expect(token).to.eql(user.token);
    });

    it('get patron object', function() {
      var userId = SessionStore.getUserId();
      expect(userId).to.eql(user.user_id);
    });
  });
}
