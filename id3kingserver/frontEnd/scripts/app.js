var app = angular.module('id3king', []);

app.controller('dataController', ['$scope', '$http', function($scope, $http) {
    $scope.openFiltersMenu = false;
    $scope.orderings = {
        DATA: 'Data'
    }

    !function init() {
        $http({
            method: 'POST',
            url: '/getData'
        }).then(function successCallback(response) {
            $scope.itinerari = response.data.map(function(itinerario){
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

    $scope.setOrderBy = function(ordering) {
        $scope.reverse = ($scope.currentOrdering === ordering) ? !$scope.reverse : false;
        $scope.currentOrdering = ordering;
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
        template: '<div id="mySidenav" class="sidenav"> </div>',
        replace: true,
        scope: {
            expand : '='
        },
        link: function(scope, element, attrs) {
          scope.expand = false;
          scope.$watch ( function() {return scope.expand;},
           function( expand ) {
              $timeout(function() {
                  var width = expand ? element.parent()[0].offsetWidth : 0;
                  element.css('width', width + 'px');
              }, 0);
          });

        }
    };
}]);
