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
