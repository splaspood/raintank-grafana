define([
  'angular',
  'jquery',
  'lodash',
  'config',
  'services/all',
],
function (angular, jquery, _, config) {
  "use strict";

  var module = angular.module('grafana.routes');

  module.config(function($routeProvider) {
    $routeProvider
      .when('/dashboard/device/:device', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromDeviceProvider',
      }).when('/dashboard/service/:service', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromServiceProvider',
        reloadOnSearch: false,
      }).when('/dashboard/device', {
        templateUrl: 'plugins/raintank/partials/deviceList.html',
        controller : 'DeviceListProvider',
      }).when('/dashboard/service', {
        templateUrl: 'plugins/raintank/partials/serviceList.html',
        controller : 'ServiceListProvider',
      });
  });

  module.controller('DashFromDeviceProvider', function($scope, $rootScope, $http, $routeParams, alertSrv, $q, raintankDashboard, raintankDevice, raintankService) {
    console.log('DashFromDeviceProvider');
    raintankDashboard.device(function(err, dashboard, device) {
      if (err) {
        alertSrv.set('Error',err.message ,'error');
      } else {
        $scope.emitAppEvent('setup-dashboard', dashboard);
      }
    });
  });
  module.controller('DashFromServiceProvider', function($scope, $rootScope, $http, $routeParams, alertSrv, $q, raintankDashboard, raintankDevice, raintankService) {
    $scope.DashFromService = true;
    $scope.serviceReq = raintankService.get($routeParams)
    console.log('DashFromDeviceProvider');   
    raintankDashboard.populateDash($scope.serviceReq, 'service', function(err, dashboard, service) {
      if (err) {
        alertSrv.set('Error',err.message ,'error');
      } else {
        $scope.emitAppEvent('setup-dashboard', dashboard);
      }
    });
  });
});