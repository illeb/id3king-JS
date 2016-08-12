var app = angular.module('id3king', []);

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
        if(index ==  -1)
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
        template: '<div class="filtersBar" ng-transclude></div>',
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
                });        }
    };
}]);
