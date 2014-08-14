define([
  'angular',
  'jquery',
  'lodash',
  'services/all',
],
function (angular, jquery, _) {
  "use strict";

  var module = angular.module('grafana.routes');

  module.config(function($routeProvider) {
    $routeProvider
      .when('/dashboard/device/:device', {
        templateUrl: 'app/partials/dashboardDevice.html',
        controller : 'DashFromDeviceProvider',
      }).when('/dashboard/device', {
        templateUrl: 'app/partials/deviceList.html',
        controller : 'DeviceListProvider',
      });
  });

  module.controller('DeviceListProvider', function($scope, raintankDevice ) {
    var deviceReq = raintankDevice.query(function() {
      $scope.devices = deviceReq.devices;
    });
  });

  module.controller('DashFromDeviceProvider', function($scope, $rootScope, $http, $routeParams, alertSrv, $q, raintankDevice, raintankResourceType) {
    console.log('DashFromDeviceProvider');
    var resourceTypeReq = raintankResourceType.query();
    var template = $http({
      url: "app/dashboards/empty.json",
      method: "GET",
    });
    var deviceReq = raintankDevice.get($routeParams, function() {
      //console.log(deviceReq);
      $scope.device = deviceReq.device;
      var panels = [];
      //wait for resourceTypes to be fetched.
      resourceTypeReq.$promise.then(function() {
        var seenTypes = {};
        $scope.resourceTypes = resourceTypeReq.resourceTypes;
        _.forEach($scope.resourceTypes.sort(function(a,b) {return b.name.localeCompare(a.name)}), function(resourceType) {
            console.log("looking for metrics for resource: " + resourceType.name);
            _.forEach($scope.device.metrics, function(metric) {
              if (resourceType._id in seenTypes) return;
              var match = new RegExp(resourceType.match);
              if (match.test(metric.name)) {
                console.log("matched: " + metric.name);
                var panel = _.cloneDeep(resourceType.panel);
                _.each(panel.targets, function(target) {
                  var interval = parseInt(metric.interval);
                  if (target.function == "derivative") {
                    interval = interval * 2;
                  }
                  // we want to only get metrics for this device.
                  var extra = {
                    condition_filter:true,
                    condition_key:"device",
                    condition_op:"=",
                    condition_value:"'"+$routeParams.device+"'",
                    interval: ""+ interval+"s"
                  }
                  target = _.assign(target, extra);

                });
                panel.span=6;
                panels.push(panel);
                seenTypes[resourceType._id] = true;
              }
            });
        });
        console.log(panels);
        console.log(template);
        template.then(function(resp, status) {
          var tmpl = resp.data;
          tmpl.title = $scope.device.name;
          var rowSpans = 0;
          var rowCount = 0;
          tmpl.rows = [{
            "title": "",
            "height": "250px",
            "editable": false,
            "collapse": true,
            "panels": []
          }];
          _.forEach(panels, function(panel) {
            rowSpans += panel.span;
            if (rowSpans > 12) {
              rowSpans -= 12;
              rowCount++;
              tmpl.rows.push({
                "title": "",
                "height": "250px",
                "editable": false,
                "collapse": true,
                "panels": []
              });
            }
            if (rowSpans > panel.span ) {
              tmpl.rows[rowCount].title += " : ";
            }
            tmpl.rows[rowCount].title += panel.title; 
            tmpl.rows[rowCount].panels.push(panel);
          });
          console.log(tmpl);
          $scope.emitAppEvent('setup-dashboard', tmpl);
        }, function(resp) {
          console.log(resp);
          alertSrv.set('Error',"Could not load <i>dashboards/empty.json</i>. Please make sure it exists" ,'error');
        }); 
      });
    });
  });
});
