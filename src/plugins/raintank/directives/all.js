define([
  'angular',
  'lodash'
], function (angular, _) {
  var module = angular.module('grafana.directives');

  module.directive('raintankSetting', function ($compile) {
    return {
        transclude: true,
        restrict: 'E',
        scope: {
            definition: '=',
            setting: '='
        },
        template: '<div></div>',
        replace: true,
        link: function(scope,element, attrs) {
            console.log(scope);
            var tmpl;
            if (scope.setting == null) {
                scope.setting = scope.definition.value;
            }
            switch (scope.definition.type) {
                case 'String':
                    tmpl = '<input type="text" placeholder="String" ng-required="definition.required" ng-model="setting" class="form-control">';
                    break;
                case 'Text':
                    tmpl = '<textarea placeholder="Multiline Text" ng-required="definition.required" ng-model="setting" class="form-control">';
                    break;
                case 'Number':
                    scope.setting = parseFloat(scope.setting);
                    tmpl = '<input type="number" placeholder="Number" ng-required="definition.required" ng-model="setting" class="form-control">';
                    break;
                case 'Boolean':
                    tmpl = '<input type="checkbox" ng-true-value="true" ng-false-value="false" ng-model="setting" class="form-control">'
                    break;
                case 'Enum':
                    tmpl = '<select ng-model="setting" class="form-control" ng-options="e for e in definition.conditions.values" ng-required="definition.required">'
                    break;  
                default:
                    tmpl = '<input type="text" placeholder="definition.type" ng-required="definition.required" ng-model="setting" class="form-control">';

            }
            element.html(tmpl);
            $compile(element.contents())(scope);
        }
    };
  });
});