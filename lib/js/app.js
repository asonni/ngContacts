(function(){
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

  app.factory('Contact', ['$resource' ,function($resource){
    return $resource('https://codecraftpro.com/api/samples/v1/contact/:id/', {id:'@id'},{
      update: {
        method: 'PUT'
      }
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
      'controller': function($scope, ContactService){
        $scope.isDeleting = false;
        $scope.deleteUser = function(){
          $scope.isDeleting = true;
          ContactService.removeContact($scope.user).then(function(){
            $scope.isDeleting = false;
          });
        };
      }
    }
  });

  app.service('ContactService',['Contact', '$q', '$rootScope', 'toastr', function(Contact, $q, $rootScope, toastr){
    var self = {
      'addPerson': function(person){
        this.persons.push(person);
      },
      'getPerson': function(email){
        console.log(email);
        for(var i=0; i<self.persons.length; i++){
          var obj = self.persons[i];
          if(obj.email == email){
            return obj;
          }
        }
      },
      'page': 1,
      'hasMore': true,
      'isLoading': false,
      'isSaving': false,
      'selectedPerson': null,
      'persons': [],
      'search': null,
      'ordering': 'name',
      'doSearch': function(){
        self.hasMore = true;
        self.page = 1;
        self.persons = [];
        self.loadContacts();
      },
      'doOrder': function(){
        self.hasMore = true;
        self.page = 1;
        self.persons = [];
        self.loadContacts();
      },
      'loadContacts': function(){
        if(self.hasMore && !self.isLoading){
          self.isLoading = true;
          var params = {
            'page': self.page,
            'search': self.search,
            'ordering': self.ordering
          };
          Contact.get(params, function (data){
            console.log(data);
            angular.forEach(data.results, function(person){
              self.persons.push(new Contact(person));
            });
            if(!data.next){
              self.hasMore = false;
            }
            self.isLoading = false;
          });
        }
      },
      'loadMore': function(){
        if(self.hasMore && !self.isLoading){
          self.page += 1;
          self.loadContacts();
        }
      },
      'updateContact': function(person){
        var d = $q.defer();
        self.isSaving = true;
        person.$update().then(function(){
          self.isSaving = false;
          toastr.info('Updated ' + person.name);
          d.resolve();
        });
        return d.promise;
      },
      'removeContact': function(person){
        var d = $q.defer();
        self.isDeleting = true;
        person.$remove().then(function(){
          self.isDeleting = false;
          var index = self.persons.indexOf(person);
          self.persons.splice(index, 1);
          self.selectedPerson = null;
          toastr.warning('Deleted ' + person.name);
          d.resolve();
        });
        return d.promise;
      },
      'createContact': function(person){
        var d = $q.defer();
        self.isSaving = true;
        Contact.save(person).$promise.then(function(){
          self.isSaving = false;
          self.selectedPerson = null;
          self.hasMore = true;
          self.page = 1;
          self.persons = [];
          self.loadContacts();
          toastr.success('Created ' + person.name);
          d.resolve();
        });
        return d.promise; 
      },
      'watchFilters': function(){
        $rootScope.$watch(function(){
          return self.search;
        }, function(newVal){
          if(angular.isDefined(newVal)){
            self.doSearch();
          }
        });
        $rootScope.$watch(function(){
          return self.ordering;
        }, function(newVal){
          if(angular.isDefined(newVal)){
            self.doOrder();
          }
        });
      }
    };
    self.loadContacts();
    self.watchFilters();
    return self;
  }]);

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
      console.log("createContact");
      $scope.contacts.createContact($scope.contacts.selectedPerson).then(function(){
        // $scope.createModel.hide();
        $state.go('list');
      });
    };
  }]);
  
})();