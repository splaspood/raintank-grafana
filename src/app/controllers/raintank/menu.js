define([
  'angular',
  'config',
  'lodash',
],
function (angular, config, _) {
  "use strict";

  var module = angular.module('grafana.controllers');

  module.controller('raintankMenuCtrl', function($scope, alertSrv, $rootScope, $location, $modal) {
  	$scope.init = function() {
  		console.log("menu init");
  		$scope.loggedIn = true;
  	};
  });
 });