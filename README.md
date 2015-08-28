# DispatchBot Authentication module for AngularJS

This module provides just about everything you need to provide authentication
to the DispatchBot API in your angular application. The only thing you need to
provide is the login partial.

## Installation

Define it in your `bower.json`

    {
      "name": "my-dispatchbot-app",
      ...
      "dependencies": {
        "angular": "~1.3.0",
        ...
        "dispatchbot-angular-authentication": "DispatchBot/dispatchbot-angular-authentication#master"
      }
    }

## Usage

In your `app.js` you need to define the authentication config and interceptor.

    angular.module('dispatchbot.my-app', [
      'ngRoute',
      'dispatchbot.authentication',
      ...
    ]).
    // Configure where the API lives. Needed by our session service.
    .constant('DispatchBotConfig', { 'api_host': 'http://localhost:3000' }).
    // Register the interceptor that handles the authentication.
    config(function ($httpProvider) {
      $httpProvider.interceptors.push('authInterceptor');
    });

### Controllers

To create a login controller:

    // Define the authentication controllers and routing
    app.config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginController'
      }).when('/logout', {
        templateUrl: 'partials/logout.html',
        controller: 'LogoutController'
      })
    })

Note that the resource paths such as `/login` are currently fixed and cannot be
customized.

You should now be able to start your application. Any HTTP calls that return a 401
will be automatically redirected to have the user login.

### Directive

You can also have the user login form be controlled by a directive:

    <db-user-login db-template-url="..."></db-user-login>

## Organization ID discovery

Many of the client applications will need to know the ID of the organization on
which the user is performing operations on. If the organization key is known (often
through the subdomain), then the ID can be found by using this modules Organization
Service:

    Organization.lookup({ key: 'organization_key' }, function(...) { ... })

## Events

This module will broadcast a number of login events on the `$scope`.

* dispatchbot.authentication.success - On successful login
* dispatchbot.authentication.failure - When authentication is attempted but results in a failure. Typically incorrect user/pass.
* dispatchbot:authorization:failure - When the user attempts to perform an action they cannot.
