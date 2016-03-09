(function(){
  'use strict';
  var app = angular.module('codecraft');
  app.controller('PersonsListController', ['$scope', '$rootScope', '$modal', 'ContactService', function($scope, $rootScope, $modal, ContactService){
    $scope.search = "";
    $scope.order = "name";
    // $rootScope.selectedPerson = null;
    $scope.contacts = ContactService;
    $scope.loadMore = function(){
      // console.log("Load More!!!");
      $scope.contacts.loadMore();
    };
    // $scope.parentDeleteUser = function(user){
    //   $scope.contacts.removeContact(user);
    // };
    // $scope.showCreateModel = function(){
    //   $scope.contacts.selectedPerson = {};
    //   $scope.createModel = $modal({
    //     scope: $scope,
    //     templateUrl: 'templates/model.create.tpl.html',
    //     show: true
    //   });
    // };
    // $scope.$watch('search', function(newVal, oldVal){
    //   // console.log(newVal);
    //   if((angular.isDefined(newVal)) && (newVal != null)){
    //     $scope.contacts.doSearch(newVal);
    //   }
    // });
    // $scope.$watch('order', function(newVal, oldVal){
    //   if(angular.isDefined(newVal)){
    //     $scope.contacts.doOrder(newVal);
    //   }
    // });
    // $scope.selectPerson = function(person){
    //   // $rootScope.selectedPerson = person;
    //   $scope.selectedPerson = person;
    // };

    // $scope.sensitiveSearch = function(person){
    //   if($scope.search){
    //     return person.name.indexOf($scope.search) == 0 || person.email.indexOf($scope.search) == 0;
    //   }
    //   return true;
    // };
  }]);
  app.controller('PersonsDetailController', ['$scope', '$stateParams', '$state', 'ContactService', function($scope, $stateParams, $state, ContactService){
    $scope.mode = 'Edit';
    $scope.contacts = ContactService;
    $scope.contacts.selectedPerson = $scope.contacts.getPerson($stateParams.email);
    $scope.save = function(){
      $scope.contacts.updateContact($scope.contacts.selectedPerson).then(function(){
        $state.go('list');
      });
    }
    $scope.remove = function(){
      $scope.contacts.removeContact($scope.contacts.selectedPerson).then(function(){
        $state.go('list');
      });
    }
  }]);
  app.controller('PersonsCreateController', ['$scope', '$state', 'ContactService', function($scope, $state, ContactService){
    $scope.mode = 'Create';
    $scope.contacts = ContactService;
    $scope.clearPerson = function(){
      console.log("I', hear");
      $scope.contacts.selectedPerson = {};
    };
    $scope.save = function(){
      // console.log("createContact");
      $scope.contacts.createContact($scope.contacts.selectedPerson).then(function(){
        // $scope.createModel.hide();
        $state.go('list');
      });
    };
  }]);
})();