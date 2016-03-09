(function(){
  'use strict';
  var app = angular.module('codecraft');
  app.directive('spinner', function(){
    return {
      'restrict': 'E',
      'templateUrl': 'templates/spinner.html',
      'scope': {
        'isLoading': '=',
        'message': '@'
      }
    }
  });
  app.directive('card', function(){
    return {
      'restrict': 'E',
      'templateUrl': 'templates/card.html',
      'scope': {
        'user': '='
      },
      'controller': ['$scope', 'ContactService',function($scope, ContactService){
        $scope.isDeleting = false;
        $scope.deleteUser = function(){
          $scope.isDeleting = true;
          ContactService.removeContact($scope.user).then(function(){
            $scope.isDeleting = false;
          });
        };
      }]
    }
  });
}());