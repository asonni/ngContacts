(function(){
  'use strict';
  var app = angular.module('codecraft',[
    'ngResource',
    'ngAnimate',
    'infinite-scroll',
    'angularSpinner',
    'jcs-autoValidate',
    'angular-ladda',
    'mgcrea.ngStrap',
    'toastr'
  ]);

  app.config(['$httpProvider', '$resourceProvider', 'laddaProvider', '$datepickerProvider', function($httpProvider, $resourceProvider, laddaProvider, $datepickerProvider){
    $httpProvider.defaults.headers.common['Authorization'] = 'Token 93dc31309cd79de9fa0f2e5c0071180ed91f7677';
    $resourceProvider.defaults.stripTrailingSlashes = false;
    laddaProvider.setOption({
      style: 'expand-right'
    });
    angular.extend($datepickerProvider.defaults, {
      dateFormat: 'd/M/yyyy',
      autoclose: true
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

  app.service('ContactService',['Contact', '$q', 'toastr', function(Contact, $q, toastr){
    var self = {
      'addPerson': function(person){
        this.persons.push(person);
      },
      'page': 1,
      'hasMore': true,
      'isLoading': false,
      'isSaving': false,
      'selectedPerson': null,
      'persons': [],
      'search': null,
      'doSearch': function(search){
        self.hasMore = true;
        self.page = 1;
        self.persons = [];
        self.search = search;
        self.loadContacts();
      },
      'doOrder': function(order){
        self.hasMore = true;
        self.page = 1;
        self.persons = [];
        self.ordering = order;
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
        console.log("Service Called Update");
        self.isSaving = true;
        person.$update().then(function(){
          self.isSaving = false;
          toastr.info('Updated ' + person.name);
        });
      },
      'removeContact': function(person){
        self.isDeleting = true;
        person.$remove().then(function(){
          self.isDeleting = false;
          var index = self.persons.indexOf(person);
          self.persons.splice(index, 1);
          self.selectedPerson = null;
          toastr.warning('Deleted ' + person.name);
        });
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
          d.resolve()
        });
        return d.promise; 
      }
    };
    self.loadContacts();
    return self;
  }]);

  app.controller('PersonsListController', ['$scope', '$rootScope', '$modal', 'ContactService', function($scope, $rootScope, $modal, ContactService){
    $scope.search = "";
    $scope.order = "name";
    // $rootScope.selectedPerson = null;
    $scope.contacts = ContactService;

    $scope.loadMore = function(){
      console.log("Load More!!!");
      $scope.contacts.loadMore();
    };

    $scope.showCreateModel = function(){
      $scope.contacts.selectedPerson = {};
      $scope.createModel = $modal({
        scope: $scope,
        templateUrl: 'templates/model.create.tpl.html',
        show: true
      });
    };

    $scope.createContact = function(){
      console.log("createContact");
      $scope.contacts.createContact($scope.contacts.selectedPerson).then(function(){
        $scope.createModel.hide();
      })
    };

    $scope.$watch('search', function(newVal, oldVal){
      // console.log(newVal);
      if((angular.isDefined(newVal)) && (newVal != null)){
        $scope.contacts.doSearch(newVal);
      }
    })

    $scope.$watch('order', function(newVal, oldVal){
      if(angular.isDefined(newVal)){
        $scope.contacts.doOrder(newVal);
      }
    })
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

  app.controller('PersonsDetailController', ['$scope', 'ContactService', function($scope, ContactService){
    $scope.contacts = ContactService;
    $scope.save = function(){
      $scope.contacts.updateContact($scope.contacts.selectedPerson);
    }
    $scope.remove = function(){
      $scope.contacts.removeContact($scope.contacts.selectedPerson);
    }
  }]);
  
})();