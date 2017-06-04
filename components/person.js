angular.module('hello').component('person', {
  bindings: { person: '<' },
  templateUrl: 'templates/person.html' 
});