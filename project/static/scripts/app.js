'use strict';

/**
 * @ngdoc overview
 * @name DogFinderApp
 * @description
 * # DogFinderApp
 *
 * Main module of the application.
 */
console.log("app.js caca");

var app = angular
  .module('dogFinderApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'route-segment',
    'view-segment'
  ]);

app.config(['$locationProvider', '$routeSegmentProvider', '$routeProvider', function ($locationProvider, $routeSegmentProvider, $routeProvider) {

  $locationProvider.html5Mode({
    enabled: false,
    requireBase: true,
    rewriteLinks: true
  }).hashPrefix('');

  $routeProvider.otherwise({redirectTo: '/main'});

  $routeSegmentProvider
    .when('/main', 'main')

    .segment('main', {
        //templateUrl: 'templates/views/main.html',
        controller: 'mainCtrl',
        controllerAs: 'main'
    });

}]);
