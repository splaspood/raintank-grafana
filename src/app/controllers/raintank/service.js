define([
  'angular',
  'config',
  'lodash',
],
function (angular, config, _) {
  "use strict";

  var module = angular.module('grafana.controllers');

  module.controller('ServiceListProvider', function($scope, $q, $modal, alertSrv, raintankService ) {
    var serviceReq = raintankService.query(function() {
      $scope.services = serviceReq.services;
    });
    $scope.modal = {
      title: "test Modal",
    };
    // Create modal (returns a promise since it may have to perform an http request)
    $scope.editModal = $modal({template: 'app/partials/raintank/serviceEditModal.html', persist: true, show: false, backdrop: 'static', scope: $scope});
 
    $scope.editService = function() {
      $q.when($scope.editModal).then(function(modalEl) {
          modalEl.modal('show');
        });
    };

  });
  module.controller('raintankServiceEditCtrl', function($scope, $q ) {
    console.log('raintankServiceEditCtrl');
    $scope.error = null;
    
    $scope.frequency = [
            {label: '10sec', value: 10},
            {label: '30sec', value: 30},
            {label: '1min', value: 60},
            {label: '2min', value: 120},
            {label: '5min', value: 300},
            {label: '10min', value: 600},
            {label: '15min', value: 900},
            {label: '30min', value: 1800},
            {label: '60min', value: 3600}
    ];
    $scope.dismiss_error = function() {
      $scope.error = null;
    };
    $scope.save = function() {
      console.log('save');
      $scope.services.push({name: "test", _id: "123"});
      $scope.dismiss();
    }
  });
});