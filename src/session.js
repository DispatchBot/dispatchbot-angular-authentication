module.exports = function(appModule) {

  appModule.provider('Session', function() {
    var _config;

    return {
      configure: function(config) {
        _config = config;
      },

      $get: ['$resource', function($resource) {
        return $resource(_config.API_URL + '/users/:action.json', {}, {
          login: {
            method: 'POST',
            params: {
              action: 'sign_in'
            },
            // Do not pass auth headers with this route.
            headers: {
              'X-User-Email': undefined,
              'X-User-Token': undefined
            }
          },
          logout: {
            method: 'DELETE',
            params: {
              action: 'sign_out'
            }
          }
        });
      }]
    }
  });
}
