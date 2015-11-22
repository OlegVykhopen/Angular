var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(function($routeProvider){
    $routeProvider.when('/page1',{
            'templateUrl': 'pages/page1.html',
            'controller': 'controller1'
        }
    );
});

myApp.controller('mainController', ['$scope', '$log', function($scope, $log) {

}]);

myApp.controller('controller1', ['$scope', '$log', '$route', function($scope, $log, $route) {

    $log.info($route);

}]);
