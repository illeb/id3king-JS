var app = angular.module('id3king');

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

app.filter('trackFilter', ['seasonsService', '$rootScope', function(seasonsService, $rootScope) {
    return function(items, filters, scope) {
        if (filters.length == 0)
            return items;

        var seasons = [{}];
        var filteredItems = [];
        items.forEach(function(item) {
            var passed = true;

            //scorri tutti i filtri che l'utente ha inserito..
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                if(filter.value != null) {
                    if (filter.type == 'Luogo')
                        passed = item.NomeLocalita.toLowerCase().search(filter.value.toLowerCase()) != -1;
                    else if (filter.type == 'Periodo') {
                        passed = seasonsService.getSeason(item.Data) == filter.value;
                    }
                    else {
                        var operator = filter.operator == '=' ? '==' : filter.operator;
                        var value = typeof item[filter.type] == 'object' ? item[filter.type].value : item[filter.type];
                        passed = $rootScope.$eval(value + ' ' + operator + ' ' + filter.value);
                    }
                }
                if (!passed)
                    break;
            }
            if (passed)
                filteredItems.push(item);
        });
        return filteredItems;
    }
}]);
