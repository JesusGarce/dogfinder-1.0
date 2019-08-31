app.service('mainServiceApi', ['$http', function ($http) {

  var api_service = {
    authorization: 'a388d79fbdba4462abccf413b8883486'
  };

  api_service.retrieveStandings = function () {
    return $http({
      method: 'GET',
      headers: {'X-Auth-Token': api_service.authorization},
      url: 'https://api.football-data.org/v2/competitions/PD/standings'
    })
  };

  api_service.retrieveScorers = function() {
    return $http({
      method: 'GET',
      headers: {'X-Auth-Token': api_service.authorization},
      url: 'https://api.football-data.org/v2/competitions/PD/scorers'
    })
  };

  return api_service;
}]);
