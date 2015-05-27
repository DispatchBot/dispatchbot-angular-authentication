describe('authentication', function() {
  beforeEach(angular.mock.module('dispatchbot.authentication'));
  
  describe('SessionStore service functionality', function() {
    var sessionStorage = null, user = {user_id: '1', token: 'abc123', login: 'test@abc.com'};
  
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
     
    it('should get user id', function() {
      var userId = sessionStorage.getUserId();  
      expect(userId).toEqual(user.user_id);
    });

    it('Delete session storage', function() {
      sessionStorage.destroy();
      expect(sessionStorage.getLogin()).toBeUndefined();
      expect(sessionStorage.getToken()).toBeUndefined();
      expect(sessionStorage.getUserId()).toBeUndefined();
    });
  });
  
  describe('Organization service functionality', function() {
    var Organization, DispatchBotConfig, $httpBackend ;
    
    beforeEach(  
      inject(function($injector, _$httpBackend_) {
        $httpBackend = $injector.get('$httpBackend');
        Organization = $injector.get('Organization'); 
        DispatchBotConfig = $injector.get('DispatchBotConfig'); 
      })
    );
     
    it('should call lookup', function() {
      $httpBackend.expect('GET', DispatchBotConfig.api_host + '/organizations/key/abc.json').respond({ id: 1, name: 'abc' });
      
      expect(typeof Organization.lookup).toBe('function');
      
      Organization.lookup({key: 'abc'}, function(result) {
        expect(result.id).toEqual(1)
        expect(result.name).toEqual('abc')
      });
       
      $httpBackend.flush(); 
    });
     
    it('should call providers', function() {
      $httpBackend.expect('GET', DispatchBotConfig.api_host + '/organizations/1/providers.json').respond([{ id: 2, name: 'xyz' }]);
      
      expect(typeof Organization.providers).toBe('function');
     
      Organization.providers({id: 1}, function(result) {
        expect(result.length).toEqual(1)
      });
       
      $httpBackend.flush(); 
    });
  });

  
  describe('Session service functionality', function() {
    var Session, DispatchBotConfig, $httpBackend ;
    
    beforeEach(  
      inject(function($injector) {
        $httpBackend = $injector.get('$httpBackend');
        Session = $injector.get('Session'); 
        DispatchBotConfig = $injector.get('DispatchBotConfig'); 
      })
    );
    
    it('should call login', function() {
      $httpBackend.expect('POST', DispatchBotConfig.api_host+'/users/sign_in.json').respond({token: 'rprXx57TspJahN', email: 'abc@gmail.com'});
     
      expect(typeof Session.login).toBe('function');
     
      Session.login(function (result) {
        expect(result.token).toBe('rprXx57TspJahN');
        expect(result.email).toBe('abc@gmail.com');
      });
     
      $httpBackend.flush();
    });
     
    it('should call logout', function() {
      $httpBackend.expect('DELETE', DispatchBotConfig.api_host+'/users/sign_out.json').respond({status: 200});
     
      expect(typeof Session.logout).toBe('function');
     
      Session.logout(function (result) {
        expect(result.status).toBe(200);
      });
     
      $httpBackend.flush();
    });
  });
  
  describe('testing LoginController', function() {
    var scope, $location, loginCtrl;
    
    beforeEach(
      inject(function($rootScope, $controller, _$location_) {
        scope = $rootScope.$new();
        scope.$parent = $rootScope.$new();
        $location = _$location_;
        loginCtrl = $controller('LoginController', {
            $scope: scope
        });
        spyOn($location, 'path');
      })
    );

    it("Should call $on", function() {
      scope.$broadcast('dispatchbot.authentication.failure', {});
      expect(scope.message).toBeDefined();
      expect(scope.message).toBe('Error: Invalid user or password');
    });
    
    it("Should redirect to root page", function() {
      scope.$broadcast('dispatchbot.authentication.success', {});
      expect($location.path).toHaveBeenCalledWith('/');
    });
    
  });

  describe('testing LogoutController', function() {
    var scope, $location, SessionStore, $httpBackend;
    
    beforeEach(
      inject(function($injector) {
        scope = $injector.get('$rootScope');
        $controller = $injector.get('$controller'); 
        $httpBackend = $injector.get('$httpBackend'); 
        SessionStore = $injector.get('SessionStore'); 
        DispatchBotConfig = $injector.get('DispatchBotConfig'); 
        
        logoutCtrl = $controller('LogoutController', {
            $scope: scope
        });
        
        $httpBackend.expect('DELETE', DispatchBotConfig.api_host+'/users/sign_out.json').respond({status: 200});
        spyOn(SessionStore, 'destroy');
      })
    );

    it("Should delete session", function() {
      $httpBackend.flush();
      expect(SessionStore.destroy).toHaveBeenCalled();
    });
  });

  describe('authInterceptor service functionality', function() {
    var authInterceptor, SessionStore, $rootScope, response = {};
    
    beforeEach(
      inject(function($injector) {
        authInterceptor = $injector.get('authInterceptor'); 
        SessionStore = $injector.get('SessionStore'); 
        $rootScope = $injector.get('$rootScope'); 
        
        spyOn(SessionStore, 'destroy');
        spyOn($rootScope, '$broadcast');
      })
    );

    it("Should handle 401 error", function() {
      response.status = 401;
      authInterceptor.responseError(response);
      expect(SessionStore.destroy).toHaveBeenCalled();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('dispatchbot:authentication:unauthenticated', response);
    });

    it("Should handle 403 error", function() {
      response.status = 403;
      authInterceptor.responseError(response);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('dispatchbot:authorization:failure');
    });
  });
  
  describe('testing directive dbUserLogin', function() {
    var  scope, $httpBackend, Seesion;
     
    var html = '<db-user-login db-template-url="login.html"></db-user-login>';
    
    beforeEach(
      inject(function($rootScope, $compile, $injector) {
        scope = $rootScope;
        $httpBackend = $injector.get('$httpBackend');
        Session = $injector.get('Session'); 
        $httpBackend.when('GET', 'login.html').respond('')
        // create the element and compile it
        element = angular.element(html);
        $compile(element)(scope);
            
        spyOn(Session, 'login');
      })
    );
    
    it("should call login", function() {
      $httpBackend.flush();
      scope = element.isolateScope()
     
      expect(scope.user).toBeDefined();
      expect(typeof scope.submit).toBe('function');
     
      scope.submit();
      expect(Session.login).toHaveBeenCalled();
    });
  });  
});
