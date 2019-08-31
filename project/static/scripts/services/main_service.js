app.factory('mainService',
  ['mainServiceApi', '$q',
    function (mainServiceApi, $q) {

      var service = {
        standings: '',
        scorers: ''
      };

      /*
      service.getStandings = function () {
        var defered = $q.defer();
        var promise = defered.promise;

        mainServiceApi.retrieveStandings()
          .then(
            function success(response) {
              console.log("RetrieveStandings");
              service.standings = response.data.standings;
              console.log(response.data);
              defered.resolve('retrieve-users-success');
            }
          )
          .catch(
            function () {
              defered.reject('retrieve-users-fail-close-session');
            }
          );
        return promise;
      };

      service.getScorers = function () {
        var defered = $q.defer();
        var promise = defered.promise;

        mainServiceApi.retrieveScorers()
          .then(
            function success(response) {
              console.log("retrieveScorers");
              service.scorers = response.data.scorers;
              console.log(response.data);
              defered.resolve('retrieve-users-success');
            }
          )
          .catch(
            function () {
              defered.reject('retrieve-users-fail-close-session');
            }
          );
        return promise;
      };
      */
      return service;
    }
  ]
);
