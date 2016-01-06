module.exports = function(appModule) {
  appModule.provider('Organization', function() {
    var _config;
    return {
      configure: function(config) {
        _config = config;
      },

      $get: ['$resource', function($resource) {
        return $resource(config.API_URL + '/organizations', {}, {
          lookup: {
            method: 'GET',
            url: config.API_URL + '/organizations/key/:key.json'
          },
          providers: {
            method: 'GET',
            isArray: true,
            url: config.API_URL + '/organizations/:id/providers.json'
          }
        });
      }]
    }
  });
}
