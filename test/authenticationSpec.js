describe('authentication', function() {
  beforeEach(angular.mock.module('dispatchbot.authentication'));
  var sessionStorage = null, user = {user_id: '1', token: 'abc123', login: 'test@abc.com'};
  
  describe('SessionStore service functionality', function() {
    beforeEach(  
      inject(function($injector) {
        sessionStorage = $injector.get('SessionStore'); 
        sessionStorage.store(user);  
      })
    );
     
    it('should get login', function() {
      var login = sessionStorage.getLogin();  
      expect(login).toEqual(user.login);
    });
     
    it('should get token', function() {
      var token = sessionStorage.getToken();  
      expect(token).toEqual(user.token);
    });
     
    it('get patron object', function() {
      var userId = sessionStorage.getUserId();  
      expect(userId).toEqual(user.user_id);
    });
  });
});
