define([
  'angular',
  'services/raintank/all'
], function (angular) {
  'use strict';

  var module = angular.module('grafana.services');

  module.service('raintankDashboard', function($http, $routeParams, raintankDevice, raintankService, raintankResourceType) {
      var self = this;

      this.device = function(cb) {
        var deviceReq = raintankDevice.get($routeParams)
        return self.populateDash(deviceReq, 'device', cb);
      }
      this.service = function(cb) {
        var serviceReq = raintankService.get($routeParams)
        return self.populateDash(serviceReq, 'service', cb);
      }

      this.populateDash = function(request, type, cb) {
        var resourceTypeReq = raintankResourceType.query();
        var dashTemplate = $http({
          url: "app/dashboards/empty.json",
          method: "GET",
        });

        request.$promise.then(function() {
          var obj = request[type];  //our device or service object.
          var panels = [];
          var matchedTemplates = {};
          //wait for resourceTypes to be fetched.
          resourceTypeReq.$promise.then(function() {
            var resourceTypes = resourceTypeReq.resourceTypes;
            _.forEach(obj.metrics, function(metric) {
              _.forEach(resourceTypes.sort(function(a,b){return b.name.localeCompare(a.name)}), function(template) {
                var match = new RegExp(template.match);
                //console.log('checking if metric metric matches resourceType: ' + template.match +  " " + metric.name);
                if (match.test(metric.name)) {
                  if (template._id in matchedTemplates) {
                    matchedTemplates[template._id].metrics.push(metric.name);
                    matchedTemplates[template._id].interval = metric.interval;
                  } else {
                    matchedTemplates[template._id] = {
                      template: template,
                      metrics: [metric.name],
                    }
                  }
                }
              });
            });
            var groupRegex = new RegExp('^\$(\d+)^');
            for (var templateId in matchedTemplates) {
              var template = matchedTemplates[templateId];
              var tmpPanels = [];
              if ('groupBy' in template.template && template.template.groupBy) {
                var groups = {};
                var matches = template.template.groupBy.match(/^\$(\d+)$/);
                if (matches) {
                  var position = matches[1];
                  _.forEach(template.metrics, function(metric) {
                    var parts = metric.split('\.');
                    if (!(parts[position] in groups)) {
                      groups[parts[position]] = true;
                    }
                  });
                }
                var t = JSON.stringify(template.template.panel);
                //iterate through the template and search for "%group%";
                for (var group in groups) {
                  var tmpl = t;
                  tmpl = tmpl.replace(/\%group\%/ig, group);
                  tmpl = tmpl.replace(/\%name\%/ig, obj.name.replace(/[^\w]/, '_'));
                  tmpPanels.push(JSON.parse(tmpl));
                };
              } else {
                var tmpl = JSON.stringify(template.template.panel);
                tmpl = tmpl.replace(/\%group\%/ig, group);
                tmpl = tmpl.replace(/\%name\%/ig, obj.name.replace(/[^\w]/, '_'));
                tmpPanels.push(JSON.parse(tmpl));
              }
              _.forEach(tmpPanels, function(panel) {
                panel.span=6;
                panels.push(panel);
              });
            }
            dashTemplate.then(function(resp, status) {
              var tmpl = resp.data;
              tmpl.title = obj.name;
              var rowSpans = 12;
              var rowCount = 0;
              tmpl.rows = [{
                "title": "Service Details",
                "height": "250px",
                "editable": true,
                "collapse": false,
                "panels": [{
                  "title": "Service Details",
                  "type": "raintankServiceDescription",
                  "span": 12,
                  "editable": false,
                }]
              }];
              tmpl.rows[0].panels[0][type] = obj;
              _.forEach(panels, function(panel) {
                rowSpans += panel.span;
                if (rowSpans > 12) {
                  rowSpans -= 12;
                  rowCount++;
                  tmpl.rows.push({
                    "title": "",
                    "height": "250px",
                    "editable": true,
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
              return cb(null, tmpl, obj);
            }, function(resp) {
              console.log(resp);
              return cb(new Error('Could not load dashboards/empty.json'));
            });
          });
        });
      };
  });
});

