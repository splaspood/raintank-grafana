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
    
 
    $scope.editService = function(serviceId) {

      $scope.editServiceId = serviceId;
      // Create modal (returns a promise since it may have to perform an http request)
      $scope.editModal = $modal({template: 'app/partials/raintank/serviceEditModal.html', persist: true, show: false, backdrop: 'static', scope: $scope});
      $q.when($scope.editModal).then(function(modalEl) {
        modalEl.modal('show');
      });
    };

  });
  module.controller('raintankServiceEditCtrl', function($scope, $q, $modal, raintankService, raintankServiceType, raintankLocations, raintankTag ) {
    console.log('raintankServiceEditCtrl');
    $scope.error = null;
    $scope.settings = {};
    $scope.serviceTypeSetting = [];

    var serviceTypeReq = raintankServiceType.query(function() {
      $scope.serviceTypes = serviceTypeReq.serviceTypes;
    });

    var locationsReq = raintankLocations.query(function() {
      $scope.locations = locationsReq.locations;
    });
    var serviceReq;
    if ($scope.editServiceId) {
      console.log($scope.editServiceId);
      serviceReq = raintankService.get({service: $scope.editServiceId}, function() {
        $scope.service = serviceReq.service;
        $scope.changeType();
      });
    } else {
      $scope.service = {enabled: true, locations: [], tags: [], settings: []};
    }

    var tagsReq = raintankTag.query();
    tagsReq.$promise.then(function() {
      $scope.tags = tagsReq.tags;
      $scope.buildTagsMap();
    });
    $scope.buildTagsMap = function() {
      $scope.tagsMap = {};
      if (_.isArray($scope.tags)) {
        console.log('updating tagsMap');
        $scope.tags.forEach(function(tag) {
          $scope.tagsMap[tag._id] = tag; 
        });
        console.log($scope.tagsMap);
      }
    };

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

    $scope.changeType = function() {
        var settings = [];
        for (var i=0; i<$scope.serviceTypes.length; i++) {
            if ($scope.serviceTypes[i]._id == $scope.service.serviceType) {
                settings = $scope.serviceTypes[i].settings;
                var currentSettings = {};
                _.forEach($scope.service.settings, function(setting) {
                  currentSettings[setting.name] = setting.value;
                });

                _.forEach(settings, function(setting) {
                  if (setting.name in currentSettings) {
                    setting.value = currentSettings[setting.name];
                  }

                });
                break;
            }
        }
        $scope.serviceTypeSetting = settings;
    }
    $scope.dismiss_error = function() {
      $scope.error = null;
    };

    $scope.reset = function() {
      $scope.service = {enabled: true, locations: [], tags: []};
    };

    $scope.save = function() {
      console.log('save');
      $scope.services.push($scope.service);
      $scope.dismiss();
    }
    $scope.save = function() {
      $scope.service.settings = [];
      _.forEach($scope.serviceTypeSetting, function(setting) {
          $scope.service.settings.push({
              name: setting.name,
              value: $scope.settings[setting.name]
          });
      });
      if ('_id' in $scope.service) {
          raintankService.update({service: $scope.service._id}, {service: $scope.service}, 
              function(resp, headers) {
                  for (var i=0; i < $scope.services.length; i++) {
                    var svc = $scope.services[i];
                    if (svc._id == $scope.service._id) {
                      $scope.services[i] = resp.service;
                      break;
                    }
                  }
                  $scope.dismiss();
                  $scope.reset();
              },
              function(resp) {
                  //error
                  console.log(resp);
                  $scope.error = "failed to update service.";
              }
          );
      } else {
        raintankService.save({}, {service: $scope.service},
            function(resp, headers) {
                $scope.services.push(resp.service);
                $scope.dismiss();
                $scope.reset();
            },
            function(resp) {
                //error
                console.log(resp);
                $scope.error = "failed to save new service.";
            }
        );
      }
    };

    $scope.addTag = function() {
      $scope.tagModal = $modal({template: 'app/partials/raintank/addTagModal.html', persist: true, show: false, backdrop: 'static', scope: $scope});
      $q.when($scope.editModal).then(function(modalEl) {
        modalEl.modal('hide');
      });
      $q.when($scope.tagModal).then(function(modalEl) {
        modalEl.modal('show');
      });
    };
    $scope.removeTag = function(index) {
      $scope.service.tags.splice( index, 1 );
    }

    $scope.dismiss = function() {
      console.log('dismiss ServiceEdit');
      $q.when($scope.editModal).then(function(modalEl) {
        modalEl.modal('hide');
      });
    }

    //when the addTagModal closes, we need to show this modal again
    // and also reset the dismiss() function.
    $scope.onAppEvent('addTagModalClosed', function() {
      console.log('addTagModalClosed event received.');
      $scope.buildTagsMap();
      $q.when($scope.editModal).then(function(modalEl) {
        modalEl.modal('show');
      });
      $scope.dismiss = function() {
        console.log('dismiss ServiceEdit');
        $q.when($scope.editModal).then(function(modalEl) {
          modalEl.modal('hide');
        });
      };
    });

  });


  
});