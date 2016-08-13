var app = angular.module('id3king', ['ui.bootstrap']);

app.run(function($templateCache) {
  $templateCache.put('numberFilter.html', `
      <input type="number" class="form-control">
      <span class="measureUnit middleVertical" ng-if="selectedType == 'Dislivello' || selectedType == 'Lunghezza'">
          <span>{{selectedType == 'Dislivello' ? 'm' : 'Km'}}</span>
      </span>`);
  $templateCache.put('hoursFilter.html', `<div class="relative w18"><div class="hoursPicker" uib-timepicker min="0" ng-model="startingHours" hour-step="hours" minute-step="minutes" show-meridian="false">
      </div>
      <span class="hourIndicator">H</span>
      </div>`);
});

app.controller('dataController', ['$scope', '$http', function($scope, $http) {
    $scope.openFiltersMenu = false;
    $scope.orderings = {
        DATA: 'Data'
    }

    ! function init() {
        $http({
            method: 'POST',
            url: '/getData'
        }).then(function successCallback(response) {
            $scope.itinerari = response.data.map(function(itinerario) {
                var values = itinerario.Data.split('/');
                var newDate = new Date();
                newDate.setYear(values[2]);
                newDate.setMonth(values[1]);
                newDate.setDate(values[0]);

                itinerario.Data = newDate;
                return itinerario;
            });
        });
    }()

    $scope.orderings = [];
    $scope.setOrderBy = function(ordering) {
        //remove descedent or ascendant selector..
        var index = $scope.orderings.indexOf('+' + ordering);
        if (index == -1)
            index = $scope.orderings.indexOf('-' + ordering);

        if (index != -1)
            $scope.orderings.splice(index, 1);
        else
            $scope.orderings.push('+' + ordering);
    }
    $scope.reverseOrdering = function(ordering, $event) {

        if ($scope.orderings.indexOf('+' + ordering) != -1) {
            var index = $scope.orderings.indexOf('+' + ordering);
            if (index != -1)
                $scope.orderings[index] = $scope.orderings[index].replace('+', '-');
        } else {
            var index = $scope.orderings.indexOf('-' + ordering);
            if (index != -1)
                $scope.orderings[index] = $scope.orderings[index].replace('-', '+');
        }

        $event.stopPropagation(); //prevents subsequent calling to setOrderBy
    }
    $scope.isOrderedBy = function(ordering) {
        //if we have a ordering by that category..
        if ($scope.orderings.indexOf('+' + ordering) != -1)
            return 'glyphicon-chevron-down';

        if ($scope.orderings.indexOf('-' + ordering) != -1)
            return 'glyphicon-chevron-up';

        return undefined;
    }

    $scope.filters = [];
    $scope.addFilter = function() {
        $scope.filters.push({});
    }
}]);

//thanks http://stackoverflow.com/a/17648547
app.filter('numberFixedLen', function() {
    return function(n, len) {
        var num = parseInt(n, 10);
        len = parseInt(len, 10);
        if (isNaN(num) || isNaN(len)) {
            return n;
        }
        num = '' + num;
        while (num.length < len) {
            num = '0' + num;
        }
        return num;
    };
});

app.filter('time', ['$filter', function($filter) {
    return function(minutes) {
        var hours = (minutes / 60).toFixed();
        return hours + "h " + minutes % 60 + "m";
    };
}]);

app.directive('filtersBar', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        template: '<div class="filtersBar"><div class="closebtn glyphicon glyphicon-chevron-right click" ng-click="close()"></div><div ng-transclude></div></div>',
        replace: true,
        scope: {
            expand: '='
        },
        transclude: true,
        link: function(scope, element, attrs) {
            scope.expand = false;
            scope.$watch(function() {
                    return scope.expand;
                },
                function(expand) {
                    $timeout(function() {
                        var width = expand ? element.parent()[0].offsetWidth : 0;
                        element.css('width', width + 'px');
                    }, 0);
                });
            scope.close = function(){
              scope.expand = false;
            }
        }
    };
}]);

app.directive('filterElement', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        template: `<div class="filterElement">
              <div class="pull-left">
                  <div class="btn-group" uib-dropdown dropdown-append-to-body is-open="true">
                    <button id="btn-append-to-body" type="button" class="btn btn-primary" uib-dropdown-toggle>
                    <span ng-if="!selectedType">Filtro</span>
                      <span ng-if="selectedType">{{selectedType}}</span>
                      <span class="caret middleVertical"></span>
                    </button>
                    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="btn-append-to-body">
                      <li role="menuitem"><a class="click" ng-click="selectType('ID')">ID</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Data')">Data</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Durata')">Durata</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Lunghezza')">Lunghezza</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Dislivello')">Dislivello</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Difficolta')">Difficolta</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Luogo')">Luogo</a></li>
                    </ul>
                  </div>
                </div>
              <div class="operatorSelector click pull-left relative preserve" ng-if="selectedType" ng-click="changeOperator(currentOperator)">
                  <span class="middle">{{currentOperator}}</span>
              </div>
              <div class="inputValue pull-left w25 relative" ng-class="selectedType == 'Durata' ? 'noBorderBottom' : ''" ng-if="selectedType">
                <div ng-include="getFilterTemplate(selectedType)"> </div>
              </div>
          </div>`,
        replace: true,
        scope: {
            type: '='
        },
        transclude: true,
        link: function(scope, element, attrs) {
            scope.isopen = false;
            scope.selectedType = undefined;
            scope.currentOperator = '>';

            scope.selectType = function(category) {
                scope.selectedType = category;
            }
            scope.changeOperator = function(currentOperator) {
                var operator = undefined;
                if (currentOperator == '>')
                    operator = '=';
                if (currentOperator == '=')
                    operator = '<';
                if (currentOperator == '<')
                    operator = '>';
                scope.currentOperator = operator;
                return operator;
            }

            scope.getFilterTemplate = function(selectedType){
                switch (selectedType) {
                  case 'ID':
                  case 'Lunghezza':
                  case 'Dislivello':
                    return 'numberFilter.html';
                  case 'Durata':
                    return 'hoursFilter.html';
                }
            }

            scope.startingHours = new Date(2000, 1, 1);
            scope.hours = 1;
            scope.minutes = 10;
        }
    };
}]);
