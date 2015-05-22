define([
  'angular',
  'lodash',
],
function (angular, _) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('CollectorSummaryCtrl', function($scope, $http, backendSrv, $location, $routeParams) {
    $scope.init = function() {
      $scope.collectors = [];
      $scope.monitors = {};
      $scope.collector = null;
      var promise = $scope.getCollectors();
      promise.then(function() {
        $scope.getCollector($routeParams.id);
      });
      $scope.$on('refresh', $scope.render);
      $scope.render();
    };

    $scope.getCollectors = function() {
      var promise = backendSrv.get('/api/collectors')
      promise.then(function(collectors) {
        $scope.collectors = collectors;
      });
      return promise;
    };
    $scope.tagsUpdated = function(newVal) {
      backendSrv.post("/api/collectors", $scope.collector);
    }
    $scope.getCollector = function(id) {
      _.forEach($scope.collectors, function(collector) {
        if (collector.id == id) {
          $scope.collector = collector;
          //get monitors for this collector.
          backendSrv.get('/api/monitors?collector_id='+id).then(function(monitors) {
            _.forEach(monitors, function(monitor) {
              $scope.monitors[monitor.monitor_type_id] = monitor;
            });
          });
        }
      });
    };

    $scope.setEnabled = function(newState) {
      $scope.collector.enabled = newState;
      backendSrv.post('/api/collectors', $scope.collector);
    };

    $scope.setCollector = function(id) {
      $location.path('/collectors/summary/'+id);
    };

    $scope.gotoDashboard = function(collector) {
      $location.path("/dashboard/file/statusboard.json").search({"var-collector": collector.slug, "var-endpoint": "All"});
    };

    // Set and populate defaults
    $scope.panel = {
      filter: "collector_id:"+$routeParams.id,
      title: "Events",
      size: 10
    };

    $scope.render = function() {
      if ($scope.panel.filter) {
        $scope.refreshData();
      }
    };

    $scope.refreshData = function() {
      if ($scope.panel.filter.indexOf(":", $scope.panel.filter.length - 1) !== -1) {
        //filter ends with a colon. elasticsearch will send a 500error for this.
        return;
      }
      var end = new Date().getTime();
      var params = {
        query: $scope.panel.filter,
        start: end - 3600000,
        end:  end,
        size: $scope.panel.size,
      }
      backendSrv.get('/api/events', params).then(function(events) {
        $scope.events = events;
        $scope.panel.eventCount = events.length;
      });
    }

    $scope.init();
  });
});
