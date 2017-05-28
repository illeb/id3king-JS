var app = angular.module('id3king');

app.directive('filtersBar', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        template: '<div class="filtersBar"><div class="closebtn glyphicon glyphicon-chevron-right click" ng-click="expand = false;"></div><div ng-transclude></div></div>',
        replace: true,
        scope: {
            expand: '='
        },
        transclude: true,
        link: function(scope, element, attrs) {
            scope.expand = false;
            scope.$watch(function() {
                return scope.expand;
            }, function(expand) {
                $timeout(function() {
                    element.css('margin-left', (expand ? '0' : '300px'));
                });
            });
        }
    };
}]);

app.directive('filterElement', ['$timeout', function($timeout) {
  var difficoltaValues = {
      T: 0,
      E: 1,
      EE: 2,
      EAI: 3,
    }
    return {
        restrict: 'E',
        template: `<div class="filterElement relative">
              <span class="deleteElement click" ng-click="deleteFunction(filter)">&times;</span>
              <div class="btn-group pull-left typeSelector" uib-dropdown is-open="true">
                <button type="button" class="btn btn-primary" uib-dropdown-toggle>
                <span ng-if="!filter.type">Filtro</span>
                  <span ng-if="filter.type">{{filter.type}}</span>
                  <span class="caret middleVertical"></span>
                </button>
                <ul class="dropdown-menu " uib-dropdown-menu role="menu">
                  <li role="menuitem"><a class="click" ng-click="selectType('ID')">ID</a></li>
                  <li role="menuitem" ng-if="false"><a class="click" ng-click="selectType('Data')">Data</a></li>
                  <li role="menuitem"><a class="click" ng-click="selectType('Durata')">Durata</a></li>
                  <li role="menuitem"><a class="click" ng-click="selectType('Lunghezza')">Lunghezza</a></li>
                  <li role="menuitem"><a class="click" ng-click="selectType('Dislivello')">Dislivello</a></li>
                  <li role="menuitem"><a class="click" ng-click="selectType('Difficolta')">Difficolta</a></li>
                  <li role="menuitem"><a class="click" ng-click="selectType('Luogo')">Luogo</a></li>
                  <li role="menuitem"><a class="click" ng-click="selectType('Periodo')">Periodo</a></li>
                </ul>
              </div>
              <div class="operatorSelector click pull-left relative preserve" ng-if="filter.type && filter.type != 'Luogo' && filter.type != 'Periodo'" ng-click="changeOperator(filter.operator)">
                  <span class="middle">{{filter.operator}}</span>
              </div>
              <div class="inputValue pull-left relative" ng-class="filter.type == 'Durata' ? 'noBorderBottom' : ''" ng-if="filter.type">
                <div ng-include="getFilterTemplate(filter.type)"> </div>
              </div>
          </div>`,
        replace: true,
        scope: {
            filter: '=',
            deleteFunction: '=',
            difficultyTypes: '='
        },
        transclude: true,
        link: function(scope, element, attrs) {
            scope.filter.value = undefined;
            scope.filter.operator = '>';
            scope.filter.type = undefined;

            scope.periodValues = [ 'Inverno', 'Primavera', 'Estate', 'Autunno' ];
            scope.selectType = function(category) {
                if (category != scope.filter.type)
                    scope.filter.value = undefined;

                scope.filter.type = category;
            }
            scope.changeOperator = function(currentOperator) {
                var operator = undefined;
                if (currentOperator == '>')
                    operator = '=';
                if (currentOperator == '=')
                    operator = '<';
                if (currentOperator == '<')
                    operator = '>';
                scope.filter.operator = operator;
                return operator;
            }

            scope.getFilterTemplate = function(selectedType) {
                switch (selectedType) {
                    case 'ID':
                    case 'Lunghezza':
                    case 'Dislivello':
                        return 'numberFilter.html';
                    case 'Durata':
                        return 'hoursFilter.html';
                    case 'Difficolta':
                        return 'difficultyFilter.html';
                    case 'Periodo':
                        return 'periodFilter.html';
                    case 'Luogo':
                        return 'placeFilter.html';
                }
            }

            scope.hoursValue = {
                value: new Date(200, 1, 1)
            };
            scope.hours = 1;
            scope.minutes = 10;
            scope.$watch(function() { return scope.hoursValue.value; }, function(value) {
                scope.filter.value = value.getHours() * 60 + value.getMinutes();
            });

            scope.numberValue = {
                value: undefined
            }
            scope.$watch(function() { return scope.numberValue.value; }, function(value) {
                if (scope.filter.type == 'Lunghezza')
                    scope.filter.value = value * 1000;
                else
                    scope.filter.value = value;
            });

            scope.difficultyValue = {
                value: undefined
            };
            scope.$watch(function() {
                return scope.difficultyValue.value;
            }, function(value) {
                scope.filter.value = difficoltaValues[value];
            });

            scope.periodValue = {
                value: undefined
            };
            scope.$watch(function() {
                return scope.periodValue.value;
            }, function(value) {
                scope.filter.value = value;
            });

            scope.placeValue = {
                value: undefined
            }
            scope.$watch(function() {
                return scope.placeValue.value
            }, function(value) {
                scope.filter.value = value;
            })
        }
    };
}]);
