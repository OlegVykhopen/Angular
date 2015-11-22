var forecastApp = angular.module('forecastApp', ['ngRoute', 'ngResource']);

forecastApp.config(function($routeProvider){

    $routeProvider.when('/', {
        templateUrl: 'pages/main.html',
        controller: 'mainController'
    }).when('/forecast', {
        templateUrl: 'pages/forecast.html',
        controller: 'forecastController'
    }).when('/forecast/:days', {
        templateUrl: 'pages/forecast.html',
        controller: 'forecastController'
    });;

});

// Services
forecastApp.service('cityService', function(){
    var self = this;
    this.city = "Lviv, Ukraine";
});

//Controllers
forecastApp.controller("mainController", ['$scope','$resource','cityService', function($scope, $resource, cityService){
    $scope.cityInp = cityService.city;
    $scope.$watch('cityInp', function(newV, oldV){
        cityService.city = newV; /* || cityService.city = $scope.cityInp*/
    });
}]);

forecastApp.controller("forecastController", ['$scope','$resource','$routeParams', 'cityService', function($scope, $resource, $routeParams, cityService){

    $scope.city = cityService.city;
    $scope.days = $routeParams.days || '2';

    $scope.weatherAPI = $resource("http://api.openweathermap.org/data/2.5/forecast/daily", { callback: "JSON_CALLBACK" }, { get: { method: "JSONP" }});

    $scope.weatherResult = $scope.weatherAPI.get({ q: $scope.city, cnt: $scope.days, APPID: '0e43d64730a2819e5ade11f26480914d' });

    $scope.convertToDegrees = function(degK){
        return degK - 273;
    };

    $scope.convertToDate = function(timestamp){
        return new Date(timestamp*1000);
    };

}]);

forecastApp.directive("resultPanel", function(){
    return {
        templateUrl: "directives/result_panel.html",
        replace: false,
        transclude: true,
        scope: {
            /*day: "@",
            temp: "@"*/
            weather: "=",
            format: "@",
            toStandartDate: "&",
            toStandartTemp: "&"
        }
    }
});


