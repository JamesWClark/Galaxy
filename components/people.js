angular.module('hello').component('people', {
  bindings: { people: '<' },
  
  templateUrl: 'templates/people.html'
});