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
        templateUrl: 'app/partials/dashboard-device.html',
        controller : 'DashFromDeviceProvider',
      });
  });

  module.controller('DashFromDeviceProvider', function($scope, $rootScope, $http, $routeParams, alertSrv, $q, raintankDevice) {
    console.log('DashFromDeviceProvider');
    var deviceReq = raintankDevice.get($routeParams, function() {
      //console.log(deviceReq);
      $scope.device = deviceReq.device;
      var resources = {};
      var rowTemplate = {
        "title": "Name",
        "height": "250px",
        "editable": false,
        "collapse": true,
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
            "y_formats":["short","short"],
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
            "targets":[],
            "aliasColors":{},
            "aliasYAxis":{},
            "title":"Metric"
          }
        ],
        "notice": false
      };

      var data = {
        "title": "Device: " + $scope.device.name,
        "tags": [],
        "style": "dark",
        "timezone": "browser",
        "editable": false,
        "rows": [],
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
      _.forEach($scope.device.metrics, function(metric) {
        if (/cpu\.\d+\.cpu\..*/.test(metric.name)) {
            if (!('cpu' in resources)) {
              resources['cpu'] = jquery.extend(true, {}, rowTemplate);
              resources.cpu.title = "CPU";
              resources.cpu.panels[0].title = "CPU";
              resources.cpu.panels[0].name = "CPU";
              resources.cpu.panels[0].stack = true;
              resources.cpu.panels[0].fill = true;
              resources.cpu.panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources.cpu.panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/cpu\\.\\d+\\.cpu\\..*/",
                "query":"select derivative(value) from \"/cpu\.\d+\.cpu\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$3"
              });
              console.log(resources.cpu);
              data.rows.push(resources['cpu']);
            }
        } else if (/interface.*.if_octets/.test(metric.name)) {
            if (!('interface.if_octets' in resources)) {
              resources['interface.if_octets'] = jquery.extend(true, {}, rowTemplate);
              resources['interface.if_octets'].title = "if_octets";
              resources['interface.if_octets'].panels[0].title = "if_octets";
              resources['interface.if_octets'].panels[0].name = "if_octets";
              resources['interface.if_octets'].panels[0].stack = false;
              resources['interface.if_octets'].panels[0].y_formats = ['bytes', 'short'];
              resources['interface.if_octets'].panels[0].fill = false;
              resources['interface.if_octets'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources['interface.if_octets'].panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/interface\\..*\\.if_octets\\..*/",
                "query":"select derivative(value) from \"/interface\..*\.if_octets\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$1-$3"
              });

              data.rows.push(resources['interface.if_octets']);
            }
        } else if (/interface\..*\.if_packets/.test(metric.name)) {
            if (!('interface.if_packets' in resources)) {
              resources['interface.if_packets'] = jquery.extend(true, {}, rowTemplate);
              resources['interface.if_packets'].title = "if_packets";
              resources['interface.if_packets'].panels[0].title = "if_packets";
              resources['interface.if_packets'].panels[0].name = "if_packets";
              resources['interface.if_packets'].panels[0].stack = false;
              resources['interface.if_packets'].panels[0].y_formats = ['short', 'short'];
              resources['interface.if_packets'].panels[0].fill = false;
              resources['interface.if_packets'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources['interface.if_packets'].panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/interface\\..*\\.if_packets\\..*/",
                "query":"select derivative(value) from \"/interface\..*\.if_packets\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$1-$3"
              });

              data.rows.push(resources['interface.if_packets']);
            }
        } else if (/interface\..*\.if_errors/.test(metric.name)) {
            if (!('interface.if_errors' in resources)) {
              resources['interface.if_errors'] = jquery.extend(true, {}, rowTemplate);
              resources['interface.if_errors'].title = "if_errors";
              resources['interface.if_errors'].panels[0].title = "if_errors";
              resources['interface.if_errors'].panels[0].name = "if_errors";
              resources['interface.if_errors'].panels[0].stack = false;
              resources['interface.if_errors'].panels[0].y_formats = ['short', 'short'];
              resources['interface.if_errors'].panels[0].fill = false;
              resources['interface.if_errors'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources['interface.if_errors'].panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/interface\\..*\\.if_errors\\..*/",
                "query":"select derivative(value) from \"/interface\..*\.if_errors\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$1-$3"
              });

              data.rows.push(resources['interface.if_errors']);
            }
        } else if (/disk\..*\.disk_octets/.test(metric.name)) {
            if (!('disk.disk_octets' in resources)) {
              resources['disk.disk_octets'] = jquery.extend(true, {}, rowTemplate);
              resources['disk.disk_octets'].title = "disk_octets";
              resources['disk.disk_octets'].panels[0].title = "disk_octets";
              resources['disk.disk_octets'].panels[0].name = "disk_octets";
              resources['disk.disk_octets'].panels[0].stack = false;
              resources['disk.disk_octets'].panels[0].y_formats = ['bytes', 'short'];
              resources['disk.disk_octets'].panels[0].fill = false;
              resources['disk.disk_octets'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources['disk.disk_octets'].panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/disk\\..*\\.disk_octets\\..*/",
                "query":"select derivative(value) from \"/disk\..*\.disk_octets\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$1-$3"
              });

              data.rows.push(resources['disk.disk_octets']);
            }
        } else if (/disk\..*\.disk_ops/.test(metric.name)) {
            if (!('disk.disk_ops' in resources)) {
              resources['disk.disk_ops'] = jquery.extend(true, {}, rowTemplate);
              resources['disk.disk_ops'].title = "disk_ops";
              resources['disk.disk_ops'].panels[0].title = "disk_ops";
              resources['disk.disk_ops'].panels[0].name = "disk_ops";
              resources['disk.disk_ops'].panels[0].stack = false;
              resources['disk.disk_ops'].panels[0].y_formats = ['short', 'short'];
              resources['disk.disk_ops'].panels[0].fill = false;
              resources['disk.disk_ops'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources['disk.disk_ops'].panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/disk\\..*\\.disk_ops\\..*/",
                "query":"select derivative(value) from \"/disk\..*\.disk_ops\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$1-$3"
              });

              data.rows.push(resources['disk.disk_ops']);
            }
        } else if (/disk\..*\.disk_time/.test(metric.name)) {
            if (!('disk.disk_time' in resources)) {
              resources['disk.disk_time'] = jquery.extend(true, {}, rowTemplate);
              resources['disk.disk_time'].title = "disk_time";
              resources['disk.disk_time'].panels[0].title = "disk_time";
              resources['disk.disk_time'].panels[0].name = "disk_time";
              resources['disk.disk_time'].panels[0].stack = false;
              resources['disk.disk_time'].panels[0].y_formats = ['ms', 'short'];
              resources['disk.disk_time'].panels[0].fill = false;
              resources['disk.disk_time'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources['disk.disk_time'].panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/disk\\..*\\.disk_time\\..*/",
                "query":"select derivative(value) from \"/disk\..*\.disk_time\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$1-$3"
              });

              data.rows.push(resources['disk.disk_time']);
            }
        } else if (/disk\..*\.disk_merged/.test(metric.name)) {
            if (!('disk.disk_merged' in resources)) {
              resources['disk.disk_merged'] = jquery.extend(true, {}, rowTemplate);
              resources['disk.disk_merged'].title = "disk_merged";
              resources['disk.disk_merged'].panels[0].title = "disk_merged";
              resources['disk.disk_merged'].panels[0].name = "disk_merged";
              resources['disk.disk_merged'].panels[0].stack = false;
              resources['disk.disk_merged'].panels[0].y_formats = ['short', 'short'];
              resources['disk.disk_merged'].panels[0].fill = false;
              resources['disk.disk_merged'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources['disk.disk_merged'].panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/disk\\..*\\.disk_merged\\..*/",
                "query":"select derivative(value) from \"/disk\..*\.disk_merged\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$1-$3"
              });

              data.rows.push(resources['disk.disk_merged']);
            }
        } else if (/memory\.memory/.test(metric.name)) {
            if (!('memory' in resources)) {
              resources['memory'] = jquery.extend(true, {}, rowTemplate);
              resources['memory'].title = "Memory";
              resources['memory'].panels[0].title = "Memory";
              resources['memory'].panels[0].name = "Memory";
              resources['memory'].panels[0].stack = true;
              resources['memory'].panels[0].y_formats = ['bytes', 'short'];
              resources['memory'].panels[0].fill = true;
              resources['memory'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval);
              interval = "" + interval + "s";
              resources['memory'].panels[0].targets.push({
                "function":"mean",
                "column":"value",
                "series":"/memory\\.memory\\..*/",
                "query":"select mean(value) from \"/memory\.memory\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$2"
              });

              data.rows.push(resources['memory']);
            }
        } else if (/swap\.swap\./.test(metric.name)) {
            if (!('swap' in resources)) {
              resources['swap'] = jquery.extend(true, {}, rowTemplate);
              resources['swap'].title = "Swap";
              resources['swap'].panels[0].title = "Swap";
              resources['swap'].panels[0].name = "Swap";
              resources['swap'].panels[0].stack = true;
              resources['swap'].panels[0].y_formats = ['bytes', 'short'];
              resources['swap'].panels[0].fill = true;
              resources['swap'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval);
              interval = "" + interval + "s";
              resources['swap'].panels[0].targets.push({
                "function":"mean",
                "column":"value",
                "series":"/swap\\.swap\\..*/",
                "query":"select mean(value) from \"/swap\.swap\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$2"
              });

              data.rows.push(resources['swap']);
            }
        } else if (/swap\.swap_io\./.test(metric.name)) {
            if (!('swap.swap_io' in resources)) {
              resources['swap.swap_io'] = jquery.extend(true, {}, rowTemplate);
              resources['swap.swap_io'].title = "Swap IO";
              resources['swap.swap_io'].panels[0].title = "Swap IO";
              resources['swap.swap_io'].panels[0].name = "Swap IO";
              resources['swap.swap_io'].panels[0].stack = false;
              resources['swap.swap_io'].panels[0].y_formats = ['short', 'short'];
              resources['swap.swap_io'].panels[0].fill = false;
              resources['swap.swap_io'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources['swap.swap_io'].panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/swap\\.swap_io\\..*/",
                "query":"select derivative(value) from \"/swap\.swap_io\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$2"
              });

              data.rows.push(resources['swap.swap_io']);
            }
        } else if (/load\.load/.test(metric.name)) {
            if (!('load' in resources)) {
              resources['load'] = jquery.extend(true, {}, rowTemplate);
              resources['load'].title = "Load";
              resources['load'].panels[0].title = "Load";
              resources['load'].panels[0].name = "Load";
              resources['load'].panels[0].stack = true;
              resources['load'].panels[0].y_formats = ['short', 'short'];
              resources['load'].panels[0].fill = true;
              resources['load'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval);
              interval = "" + interval + "s";
              resources['load'].panels[0].targets.push({
                "function":"mean",
                "column":"value",
                "series":"/load\\.load\\..*/",
                "query":"select mean(value) from \"/load\.load\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$2"
              });

              data.rows.push(resources['load']);
            }
        } else if (/irq\.irq\./.test(metric.name)) {
            if (!('irq' in resources)) {
              resources['irq'] = jquery.extend(true, {}, rowTemplate);
              resources['irq'].title = "Interupts";
              resources.irq.panels[0].title = "Interupts";
              resources.irq.panels[0].name = "Interupts";
              resources.irq.panels[0].stack = false;
              resources.irq.panels[0].fill = false;
              resources.irq.panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval) * 2;
              interval = "" + interval + "s";
              resources.irq.panels[0].targets.push({
                "function":"derivative",
                "column":"value",
                "series":"/irq\\.irq\\..*/",
                "query":"select derivative(value) from \"/irq\.irq\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$2"
              });
              data.rows.push(resources['irq']);
            }
        } else if (/processes\.ps_state\..*/.test(metric.name)) {
            if (!('ps_state' in resources)) {
              resources['ps_state'] = jquery.extend(true, {}, rowTemplate);
              resources['ps_state'].title = "Process States";
              resources['ps_state'].panels[0].title = "Process States";
              resources['ps_state'].panels[0].name = "Process States";
              resources['ps_state'].panels[0].stack = false;
              resources['ps_state'].panels[0].y_formats = ['short', 'short'];
              resources['ps_state'].panels[0].fill = false;
              resources['ps_state'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval);
              interval = "" + interval + "s";
              resources['ps_state'].panels[0].targets.push({
                "function":"mean",
                "column":"value",
                "series":"/processes\\.ps_state\\..*/",
                "query":"select mean(value) from \"/processes\.ps_state\..*/\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$2"
              });

              data.rows.push(resources['ps_state']);
            }
        } else if (/df\..*.\.df_complex\./.test(metric.name)) {
            if (!('df' in resources)) {
              resources['df'] = jquery.extend(true, {}, rowTemplate);
              resources['df'].title = "Disk Space";
              resources['df'].panels[0].title = "Disk Space";
              resources['df'].panels[0].name = "Disk Space";
              resources['df'].panels[0].stack = false;
              resources['df'].panels[0].y_formats = ['bytes', 'short'];
              resources['df'].panels[0].fill = false;
              resources['df'].panels[0].tooltip.value_type = "individual";
              var interval = parseInt(metric.interval);
              interval = "" + interval + "s";
              resources['df'].panels[0].targets.push({
                "function":"mean",
                "column":"value",
                "series":"/df\\..*\\.df_complex\\..*/",
                "query":"select mean(value) from \"/df\..*\.df_complex\./\" where  time > now() - 1h and device = '"
                    + $routeParams.device+"' group by time("+interval+")  order asc",
                "condition_filter":true,
                "condition_key":"device",
                "condition_op":"=",
                "condition_value":"'"+$routeParams.device+"'",
                "interval": interval,
                "alias":"$1-$3"
              });

              data.rows.push(resources['df']);
            }
        } else {
          //just render the metric.
        }

      });
      console.log(resources);
      
      console.log(data);
      $scope.emitAppEvent('setup-dashboard', data);
    });
  });
});
