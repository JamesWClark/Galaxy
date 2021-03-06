var myApp = angular.module('hello', ['ui.router']);

// seems like a hack
// https://stackoverflow.com/questions/19399419/angular-js-and-google-api-client-js-gapi
function init() {
    window.appStart();
}

myApp.controller('hellocon', ['$scope', '$window', function($scope, $window) {
    
    console.log('controlled');
    
    var auth2;
    
    $scope.user = {};
    
    // called from init outside angular scope
    $window.appStart = function() {
        console.log('appStart()');
        gapi.load('auth2', initSigninV2);
    };

    var initSigninV2 = function() {
        console.log('initSigninV2()');
        auth2 = gapi.auth2.getAuthInstance();
        auth2.isSignedIn.listen(signinChanged);
        auth2.currentUser.listen(userChanged);

        if(auth2.isSignedIn.get() == true) {
            auth2.signIn();
        }
    };

    var signinChanged = function(isSignedIn) {
        console.log('signinChanged() = ' + isSignedIn);
        if(isSignedIn) {
            console.log('the user must be signed in to print this');
            var googleUser = auth2.currentUser.get();
            var authResponse = googleUser.getAuthResponse();
            var profile = googleUser.getBasicProfile();
            $scope.user.id          = profile.getId();
            $scope.user.fullName    = profile.getName();
            $scope.user.firstName   = profile.getGivenName();
            $scope.user.lastName    = profile.getFamilyName();
            $scope.user.photo       = profile.getImageUrl();
            $scope.user.email       = profile.getEmail();
            $scope.user.domain      = googleUser.getHostedDomain();
            $scope.user.timestamp   = moment().format('x');
            $scope.user.idToken     = authResponse.id_token;
            $scope.user.expiresAt   = authResponse.expires_at;
            $scope.$digest();
        } else {
            console.log('the user must not be signed in if this is printing');
            $scope.user = {};
            $scope.$digest();
        }
    };

    var userChanged = function(user) {
        console.log('userChanged()');
    };
    
    $scope.signOut = function() {
        console.log('signOut()');
        auth2.signOut().then(function() {
            signinChanged(false);    
        });
        console.log(auth2);
    };
    
    $scope.disconnect = function() {
        console.log('disconnect()');
        auth2.disconnect().then(function() {
            signinChanged(false);
        });
        console.log(auth2);
    };
}]);

myApp.config(function($stateProvider) {
  
  // An array of state definitions
  var states = [
    { name: 'hello', url: '/hello', component: 'hello' },
    { name: 'about', url: '/about', component: 'about' },
    
    { 
      name: 'people', 
      url: '/people', 
      component: 'people',
      resolve: {
        people: function(PeopleService) {
          return PeopleService.getAllPeople();
        }
      }
    },
    
    { 
      name: 'people.person', 
      url: '/{personId}', 
      component: 'person',
      resolve: {
        person: function(people, $stateParams) {
          return people.find(function(person) { 
            return person.id === $stateParams.personId;
          });
        }
      }
    }
  ]
  
  // Loop over the state definitions and register them
  states.forEach(function(state) {
      $stateProvider.state(state);
  });
});

myApp.run(function($http, $uiRouter) {
    $http.get('data/people.json', { cache: true });
});