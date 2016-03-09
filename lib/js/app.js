(function() {
  'use strict';
  var app = angular.module('codecraft',[
    'ngResource',
    'infinite-scroll',
    'angularSpinner',
    'jcs-autoValidate',
    'angular-ladda',
    'mgcrea.ngStrap',
    'toastr',
    'ngAnimate',
    'ui.router'
  ]);
  app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
    $stateProvider.state('list',{
      url: '/',
      views: {
        'main':{
          templateUrl: 'templates/list.html',
          controller: 'PersonsListController'
        },
        'search':{
          templateUrl: 'templates/searchform.html',
          controller: 'PersonsListController'
        }
      }
    }).state('edit',{
      url: '/edit/:email',
      views: {
        'main': {
          templateUrl: 'templates/edit.html',
          controller: 'PersonsDetailController'
        }
      }
    }).state('create',{
      url: '/create',
      views: {
        'main': {
          templateUrl: 'templates/edit.html',
          controller: 'PersonsCreateController'
        }
      }
    });
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(false).hashPrefix('!');
  }]);
  app.config(['$httpProvider', '$resourceProvider', 'laddaProvider', '$datepickerProvider', '$modalProvider', function($httpProvider, $resourceProvider, laddaProvider, $datepickerProvider, $modalProvider){
    $httpProvider.defaults.headers.common['Authorization'] = 'Token 93dc31309cd79de9fa0f2e5c0071180ed91f7677';
    $resourceProvider.defaults.stripTrailingSlashes = false;
    laddaProvider.setOption({
      style: 'expand-right'
    });
    angular.extend($datepickerProvider.defaults, {
      dateFormat: 'd/M/yyyy',
      autoclose: true
    });
    angular.extend($modalProvider.defaults, {
      animation: 'am-fade-and-scale',
      placement: 'center'
    });
  }]);
  app.filter('defaultImage', function(){
    return function(input, param){
      // console.log(input);
      // console.log(param);
      if(!input){
        return param;
      }
      return input;
    };
  });
})();