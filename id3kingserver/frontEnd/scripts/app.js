var app = angular.module('id3king', []);

app.controller('dataController', ['$scope', '$http', function($scope, $http) {

    $scope.orderings = {
        DATA: 'Data'
    }

    ! function init() {
        $http({
            method: 'POST',
            url: '/getData'
        }).then(function successCallback(response) {
            $scope.itinerari = response.data;
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
        var hours = ( minutes / 60).toFixed();
        return hours + "h " + minutes % 60 +"m";
    };
}])
