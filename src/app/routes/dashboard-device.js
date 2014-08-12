define([
  'angular',
  'services/all',
],
function (angular) {
  "use strict";

  var module = angular.module('grafana.routes');

  module.config(function($routeProvider) {
    $routeProvider
      .when('/dashboard/device/:device', {
        templateUrl: 'app/partials/dashboard-device.html',
        controller : 'DashFromDeviceProvider',
      });
  });

  module.controller('DashFromDeviceProvider', function($scope, $rootScope, $http, $routeParams, alertSrv, $q, raintankDevice) {
    console.log('DashFromDeviceProvider');
    var deviceReq = raintankDevice.get($routeParams, function() {
      console.log(deviceReq);
      $scope.device = deviceReq.device;

      var data = {
        "title": "Device: " + $scope.device.name,
        "tags": [],
        "style": "dark",
        "timezone": "browser",
        "editable": false,
        "rows": [
          {
            "title": "Memory",
            "height": "250px",
            "editable": false,
            "collapse": false,
            "collapsable": true,
            "panels": [
              {
                "span":12,
                "editable":false,
                "type":"graph",
                "loadingEditor":false,
                "datasource":null,
                "renderer":"flot",
                "x-axis":true,
                "y-axis":true,
                "scale":1,
                "y_formats":["bytes","short"],
                "grid":{
                  "leftMax":null,
                  "rightMax":null,
                  "leftMin":null,
                  "rightMin":null,
                  "threshold1":null,
                  "threshold2":null,
                  "threshold1Color":"rgba(216, 200, 27, 0.27)",
                  "threshold2Color":"rgba(234, 112, 112, 0.22)"
                },
                "annotate":{"enable":false},
                "resolution":100,
                "lines":true,
                "fill":0,
                "linewidth":1,
                "points":false,
                "pointradius":5,
                "bars":false,
                "stack":false,
                "legend":{
                  "show":true,
                  "values":false,
                  "min":false,
                  "max":false,
                  "current":false,
                  "total":false,
                  "avg":false
                },
                "percentage":false,
                "zerofill":true,
                "nullPointMode":"connected",
                "steppedLine":false,
                "tooltip":{
                  "value_type":"cumulative",
                  "query_as_alias":true
                },
                "targets":[
                  {
                    "function":"mean",
                    "column":"value",
                    "series":"/memory.memory.*/",
                    "query":"select  mean(value) from \"/memory.memory.*/\" where  time > now() - 1h and device = '"
                        + $routeParams.device+"' group by time(10s)  order asc",
                    "condition_filter":true,
                    "condition_key":"device",
                    "condition_op":"=",
                    "condition_value":"'"+$routeParams.device+"'",
                    "interval":"10s",
                    "alias":"$2"
                  }
                ],
                "aliasColors":{},
                "aliasYAxis":{},
                "title":"Memory"
              }
            ],
            "notice": false
          }
        ],
        "pulldowns": [
          {
            "type": "filtering",
            "collapse": false,
            "notice": false,
            "enable": false
          },
          {
            "type": "annotations",
            "enable": false
          }
        ],
        "nav": [
          {
            "type": "timepicker",
            "collapse": false,
            "notice": false,
            "enable": true,
            "status": "Stable",
            "time_options": [
              "5m",
              "15m",
              "1h",
              "6h",
              "12h",
              "24h",
              "2d",
              "7d",
              "30d"
            ],
            "refresh_intervals": [
              "5s",
              "10s",
              "30s",
              "1m",
              "5m",
              "15m",
              "30m",
              "1h",
              "2h",
              "1d"
            ],
            "now": true
          }
        ],
        "time": {
          "from": "now-1h",
          "to": "now"
        },
        "templating": {
          "list": []
        },
        "version": 2
      };
      console.log(data);
      $scope.emitAppEvent('setup-dashboard', data);
    });
  });
});
