define([
  'angular',
], function (angular) {
  'use strict';

  var module = angular.module('grafana.services');

  module.factory('raintankDevice', ['$resource',
    function($resource) {
      return $resource('/devices/:device', {}, {
        query: {method:'GET', isArray:false},
        update: {method: 'PUT'},
      });
    }
  ]);
  module.factory('raintankResourceType', ['$resource',
    function($resource) {
      return $resource('/resourceTypes/:resourceType', {}, {
        query: {method:'GET', isArray:false},
        update: {method: 'PUT'},
      });
    }
  ]);
});