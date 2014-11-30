# DispatchBot Authentication module for AngularJS

This module provides just about everything you need to provide authentication
to the DispatchBot API in your angular application. The only thing you need to
provide are the views/partials.

## Installation

Define it in your `bower.json`

    {
      "name": "dispatchbot-my-app",
      ...
      "dependencies": {
        "angular": "~1.3.0",
        ...
        "dispatchbot-angular-authentication": "DispatchBot/dispatchbot-angular-authentication#master"
      }
    }

## Usage

In your `app.js` you need to define the authentication controllers and interceptor.

    angular.module('dispatchbot.my-app', [
      'ngRoute',
      'dispatchbot.authentication',
      ...
    ]).
    // Define the authentication controllers and routing
    config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginController'
      }).when('/logout', {
        templateUrl: 'partials/logout.html',
        controller: 'LogoutController'
      }).when('/unauthorized', {
        templateUrl: 'partials/unauthorized.html',
        controller: 'UnauthorizedController'
      })
    }).
    // Register the interceptor that handles the authentication.
    config(function ($httpProvider) {
      $httpProvider.interceptors.push('authInterceptor');
    });

Note that the resource paths such as `/login` are currently fixed and cannot be
customized.

You should now be able to start your application. Any HTTP calls that return a 401
will be automatically redirected to have the user login. Any HTTP calls that return
a 403 will redirect the user to /unauthorized.

## `.netrc`

If you are getting an error when installing the bower component, its probably
because bower cannot access the private repo. You can get a summary of the problem
and solution here: https://www.youtube.com/watch?v=ExU_ZcONHxs

In short:

    $ vim ~/.netrc

Paste the contents:

    machine github.com
        username <github username>
        password <github application token>

*Note you must use 4 spaces for indentation in the above file!*

Redirect SSH login to HTTPS login at github:

    $ git config --global url."https://github".insteadOf git://github
