var app = angular.module('id3king', ['ui.bootstrap']);

app.run(function($templateCache) {
    $templateCache.put('difficultyFilter.html', `
  <div class="btn-group" uib-dropdown is-open="true">
      <button type="button" class="btn btn-primary" uib-dropdown-toggle>
        <span>{{difficultyValue.value != undefined ? difficultyValue.value : 'Seleziona..'}}</span>
        <span class="caret middleVertical"></span>
      </button>
    <ul class="dropdown-menu" uib-dropdown-menu role="menu">
      <li ng-repeat="difficulty in difficultyTypes" role="menuitem"><a class="click" ng-click="difficultyValue.value = difficulty">{{difficulty}}</a></li>
    </ul>
  </div>`);
    $templateCache.put('periodFilter.html', `
  <div class="btn-group" uib-dropdown is-open="true">
      <button type="button" class="btn btn-primary" uib-dropdown-toggle>
        <span>{{periodValue.value != undefined ? periodValue.value : 'Seleziona..'}}</span>
        <span class="caret middleVertical"></span>
      </button>
    <ul class="dropdown-menu" uib-dropdown-menu role="menu">
      <li ng-repeat="period in periodValues" role="menuitem"><a class="click" ng-click="periodValue.value = period;">{{period}}</a></li>
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

app.controller('dataController', ['$scope', '$http', function($scope, $http) {
    $scope.openFiltersMenu = false;
    $scope.orderings = { DATA: 'Data' };

    var difficoltaValues = {
        T: 0,
        E: 1,
        EE: 2,
        EAI: 3,
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

              if ($scope.difficultyTypes.indexOf(itinerario.Difficolta.Difficolta) == -1)
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
    $scope.deleteFilter = function(filter) {
        var index = $scope.filters.indexOf(filter);
        $scope.filters.splice(index, 1);
    }
}]);
