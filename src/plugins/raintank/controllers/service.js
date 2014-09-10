define([
  'angular',
  'config',
  'lodash',
  'kbn',
],
function (angular, config, _, kbn) {
  "use strict";

  var module = angular.module('grafana.controllers');

  module.controller('ServiceListProvider', function($scope, $rootScope, $q, $modal, alertSrv, raintankService ) {
    var serviceReq = raintankService.query(function() {
      $scope.services = serviceReq.services;
    });
 
    $scope.editService = function(serviceId) {

      $scope.editServiceId = serviceId;
      // Create modal (returns a promise since it may have to perform an http request)
      $scope.editModal = $modal({template: 'plugins/raintank/partials/serviceEditModal.html', persist: true, show: false, backdrop: 'static', scope: $scope});
      $q.when($scope.editModal).then(function(modalEl) {
        modalEl.modal('show');
      });
    };
  });  
});
