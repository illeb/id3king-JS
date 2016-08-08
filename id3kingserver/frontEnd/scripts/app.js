var app = angular.module('id3king', []);

app.controller('dataController', ['$scope', '$http', function($scope, $http) {

  $http({
    method: 'POST',
    url: '/getData'
  }).then(function successCallback(response) {
        $scope.itinerari = response.data;
    });
}]);
