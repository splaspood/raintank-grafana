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
  module.factory('raintankService', ['$resource',
    function($resource) {
      return $resource('/services/:service', {}, {
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
  module.factory('raintankServiceType', ['$resource',
    function($resource) {
      return $resource('/serviceTypes/:serviceType', {}, {
        query: {method:'GET', isArray:false},
        update: {method: 'PUT'},
      });
    }
  ]);
  module.factory('raintankLocations', ['$resource',
    function($resource) {
      return $resource('/locations/:location', {}, {
        query: {method:'GET', isArray:false},
        update: {method: 'PUT'},
      });
    }
  ]);
  module.factory('raintankTag', ['$resource',
    function($resource) {
      return $resource('/tags/:tag', {}, {
        query: {method:'GET', isArray:false},
        update: {method: 'PUT'},
      });
    }
  ]);
  module.factory('raintankServiceEvent', ['$resource',
    function($resource) {
      return $resource('/serviceEvents/:serviceEvent', {}, {
        query: {method:'GET', isArray:false},
        update: {method: 'PUT'},
      });
    }
  ]);
});