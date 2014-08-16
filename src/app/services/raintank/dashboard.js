define([
  'angular',
  'services/raintank/all'
], function (angular) {
  'use strict';

  var module = angular.module('grafana.services');

  module.service('raintankDashboard', function($http, $routeParams, raintankDevice, raintankResourceType) {
      var self = this;

      this.device = function(cb) {
        var deviceReq = raintankDevice.get($routeParams)
        return populateDash(deviceReq, 'device', cb);
      }
      this.service = function(cb) {
        var serviceReq = raintankService.get($routeParams)
        return populateDash(serviceReq, 'service', cb);
      }

      function populateDash(request, type, cb) {
        var resourceTypeReq = raintankResourceType.query();
        var template = $http({
          url: "app/dashboards/empty.json",
          method: "GET",
        });

        request.$promise.then(function() {
          var obj = request[type];  //our device or service object.
          var panels = [];
          //wait for resourceTypes to be fetched.
          resourceTypeReq.$promise.then(function() {
            var seenTypes = {};
            var resourceTypes = resourceTypeReq.resourceTypes;
            _.forEach(resourceTypes.sort(function(a,b) {return b.name.localeCompare(a.name)}), function(resourceType) {
                console.log("looking for metrics for resource: " + resourceType.name);
                _.forEach(obj.metrics, function(metric) {
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
                        condition_key:type,
                        condition_op:"=",
                        condition_value:"'"+$routeParams[type]+"'",
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
              tmpl.title = obj.name;
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
              return cb(null, tmpl);
            }, function(resp) {
              console.log(resp);
              return cb(new Error('Could not load dashboards/empty.json'));
            }); 
          });
        });
      };
  });
});