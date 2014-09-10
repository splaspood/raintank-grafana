define([
  'angular',
  'config',
  'lodash',
],
function (angular, config, _) {
  "use strict";

    var module = angular.module('grafana.controllers');

    module.controller('raintankAddTagModalCtrl', function($scope, $q, raintankTag) {
        var assigned_tags = {};
        $scope.unassigned_tags = {};

        $scope.service.tags.forEach(function(tagId) {
            assigned_tags[tagId] = tagId;
        });
        console.log(assigned_tags);
        $scope.tags.forEach(function(tag) {
            // filter out tags that are already assigned.
            if (!( tag._id in assigned_tags)){
                $scope.unassigned_tags[tag._id] = tag;
            }
        });

        $scope.createTag = false;

        $scope.save = function(tagId, tagName, createTag) {
            if (createTag) { 
                var tags_by_name = {};
                angular.forEach($scope.tags, function(value, key) {
                    tags_by_name[value.name] = value;
                });
                if (tagName in tags_by_name){
                    $scope.error = "Tag name already defined.";
                    return;
                }

                raintankTag.save(null, {
                    "tag": {
                        "name": tagName,
                    }
                }, function(resp) {
                    //success
                    $scope.tags.push(resp.tag);
                    $scope.service.tags.push(resp.tag._id);
                    $scope.close();
                }, function(resp) {
                    //error
                    console.log(resp);
                    $scope.error = "Error creating tag";
                });

            } else {
            	$scope.service.tags.push(tagId);
                $scope.close();
            }
        };

        $scope.close = function() {
            console.log('dismiss TagAdd');
            $scope.dismiss();
            $scope.emitAppEvent('addTagModalClosed');
        };
        
    });
});