var app = angular.module('id3king', ['ui.bootstrap']);

const difficoltaValues = {
  T: 0,
  E: 1,
  EE: 2,
  EAI: 3,
}
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
          $scope.difficultyTypes = [];
            $scope.itinerari = response.data.map(function(itinerario) {
                var values = itinerario.Data.split('/');
                var newDate = new Date();
                newDate.setYear(values[2]);
                newDate.setMonth(values[1]);
                newDate.setDate(values[0]);

                itinerario.Data = newDate;

                itinerario.Difficolta = {
                  Difficolta: itinerario.Difficolta,
                  value: difficoltaValues[itinerario.Difficolta]
                }

                if($scope.difficultyTypes.indexOf(itinerario.Difficolta.Difficolta) == -1)
                  $scope.difficultyTypes.push(itinerario.Difficolta.Difficolta);
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
    $scope.deleteFilter = function(filter){
      var index = $scope.filters.indexOf(filter);
      $scope.filters.splice(index, 1);
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
        var hours = Math.floor(minutes / 60);
        return hours + "h " + minutes % 60 + "m";
    };
}]);

app.filter('trackFilter', function($rootScope) {
  return function(items, filters, scope) {
    if(filters.length == 0)
      return items;

      var filteredItems = [];
      items.forEach(function(item) {
        var passed= true;

        //scorri tutti i filtri che l'utente ha inserito..
        for(var i=0; i < filters.length; i++) {
          var filter = filters[i];
          if(filter.type != undefined && filter.type != 'Luogo' && filter.value != undefined) {
            var operator = filter.operator == '=' ? '==' : filter.operator;
            var value = typeof item[filter.type] == 'object' ? item[filter.type].value : item[filter.type];
            passed = $rootScope.$eval(value + ' ' + operator + ' ' + filter.value);
          }
          if(filter.type == 'Luogo' && filter.value != undefined)
              passed = item.NomeLocalita.toLowerCase().search(filter.value.toLowerCase()) != -1;          
          if(!passed)
            break;
        }
        if(passed)
         filteredItems.push(item);
      });
      return filteredItems;
    }
});

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

app.run(function($templateCache) {
  $templateCache.put('choiceFilter.html', `
  <div class="btn-group" uib-dropdown dropdown-append-to-body is-open="true">
      <button id="btn-append-to-body" type="button" class="btn btn-primary" uib-dropdown-toggle>
        <span>{{difficultyValue.value != undefined ? difficultyValue.value : 'Seleziona..'}}</span>
        <span class="caret middleVertical"></span>
      </button>
    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="btn-append-to-body">
      <li ng-repeat="difficulty in difficultyTypes" role="menuitem"><a class="click" ng-click="difficultyValue.value = difficulty">{{difficulty}}</a></li>
    </ul>
  </div>`);
  $templateCache.put('numberFilter.html', `
      <input type="number" class="form-control" ng-model="numberValue.value">
          <span class="measureUnit middleVertical" ng-if="filter.type == 'Dislivello' || filter.type == 'Lunghezza'">
          <span>{{filter.type == 'Dislivello' ? 'm' : 'Km'}}</span></span>
        </input>`);
  $templateCache.put('hoursFilter.html', `
      <div class="relative w20"><div class="hoursPicker" uib-timepicker ng-model="hoursValue.value" hour-step="hours" minute-step="minutes" show-meridian="false">
      </div>
          <span class="hourIndicator">H</span>
      </div>`);
  $templateCache.put('placeFilter.html', `
      <input type="text" class="form-control" ng-model="placeValue.value">
      </input>`);
});

app.directive('filterElement', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        template: `<div class="filterElement relative">
              <span class="deleteElement click" ng-click="deleteFunction(filter)">&times;</span>
              <div class="pull-left">
                  <div class="btn-group" uib-dropdown dropdown-append-to-body is-open="true">
                    <button id="btn-append-to-body" type="button" class="btn btn-primary" uib-dropdown-toggle>
                    <span ng-if="!filter.type">Filtro</span>
                      <span ng-if="filter.type">{{filter.type}}</span>
                      <span class="caret middleVertical"></span>
                    </button>
                    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="btn-append-to-body">
                      <li role="menuitem"><a class="click" ng-click="selectType('ID')">ID</a></li>
                      <li role="menuitem" ng-if="false"><a class="click" ng-click="selectType('Data')">Data</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Durata')">Durata</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Lunghezza')">Lunghezza</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Dislivello')">Dislivello</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Difficolta')">Difficolta</a></li>
                      <li role="menuitem"><a class="click" ng-click="selectType('Luogo')">Luogo</a></li>
                    </ul>
                  </div>
                </div>
              <div class="operatorSelector click pull-left relative preserve" ng-if="filter.type && filter.type != 'Luogo'" ng-click="changeOperator(filter.operator)">
                  <span class="middle">{{filter.operator}}</span>
              </div>
              <div class="inputValue pull-left w25 relative" ng-class="filter.type == 'Durata' ? 'noBorderBottom' : ''" ng-if="filter.type">
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

            scope.selectType = function(category) {
                if(category != scope.filter.type)
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

            scope.getFilterTemplate = function(selectedType){
                switch (selectedType) {
                  case 'ID':
                  case 'Lunghezza':
                  case 'Dislivello':
                    return 'numberFilter.html';
                  case 'Durata':
                    return 'hoursFilter.html';
                  case 'Difficolta':
                    return 'choiceFilter.html';
                  case 'Luogo':
                    return 'placeFilter.html';
                }
            }

            scope.hoursValue = {
              value : new Date(200, 1, 1)
            };
            scope.hours = 1;
            scope.minutes = 10;
            scope.$watch(function() {
                    return scope.hoursValue.value;
                },
                function(value) {
                  scope.filter.value = value.getHours() * 60 + value.getMinutes();
            });

            scope.numberValue = {
              value: undefined
            }
            scope.$watch(function() {
                    return scope.numberValue.value;
                },
                function(value) {
                  if(scope.filter.type == 'Lunghezza')
                    scope.filter.value = value * 1000;
                  else
                    scope.filter.value = value;
            });

            scope.difficultyValue = {
              value : undefined
            };
            scope.$watch(function() {
                    return scope.difficultyValue.value;
                },
                function(value) {
                    scope.filter.value = difficoltaValues[value];
            });

            scope.placeValue = {
              value: undefined
            }
            scope.$watch(function(){
              return scope.placeValue.value
            }, function(value){
               scope.filter.value = value;
            })
        }
    };
}]);
