define([
  'angular',
  'config',
  'lodash',
  'jquery',
],
function (angular, config, _, $) {
  "use strict";

  var module = angular.module('grafana.controllers');

  module.controller('DeviceListProvider', function($scope, $modal, raintankDevice ) {
    var deviceReq = raintankDevice.query(function() {
      $scope.devices = deviceReq.devices;
    });
  });

 });