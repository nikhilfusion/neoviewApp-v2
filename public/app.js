angular.module('neoviewApp', [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'LocalStorageModule',
    'btford.socket-io',
    'restangular',
    'ngCookies',
    'ngSessionStorage',
    'angular-growl'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider', '$qProvider', function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider, $qProvider) {
    $stateProvider
    .state('home', {
        url: '/',
        templateUrl: 'public/views/home.html',
    })
    .state('app.stream', {
        url: '/stream',
        templateUrl: 'public/views/stream.html',
        controller: 'streamController'
    })
    .state('login', {
        url: '/login',
        templateUrl : 'public/views/login.html',
        controller: 'loginController'
    })
    .state('forgot', {
        url: '/forgot-password',
        templateUrl : 'public/views/login.html',
        controller: 'loginController'
    })
    .state('app', {
        templateUrl: 'public/views/app.html',
        controller: 'appController'
    })
    .state('app.adminDashboard', {
        url : '/adminDashboard',
        templateUrl : 'public/views/userList.html',
        controller : 'adminController'
    })
    .state('app.adminPatientList', {
        url: '/adminPatientList',
        templateUrl : 'public/views/userList.html',
        controller : 'adminController'
    })
    .state('app.adminCreateUser', {
        url: '/adminCreateUser',
        templateUrl: 'public/views/user.html',
        controller: 'adminController'
    })
    .state('app.adminUser', {
        url: '/adminUser/:id',
        templateUrl: 'public/views/user.html',
        controller: 'adminController'
    })
    .state('app.staffDashboard', {
        url: '/staffDashboard',
        templateUrl : 'public/views/userList.html',
        controller : 'staffController'
    })
    .state('app.staffCreateUser', {
        url: '/staffCreateUser',
        templateUrl: 'public/views/user.html',
        controller: 'staffController'
    })
    .state('app.staffUser', {
        url: '/staffUser/:id',
        templateUrl: 'public/views/user.html',
        controller: 'staffController'
    })
    .state('app.profile', {
        url: '/profile',
        templateUrl: 'public/views/profile.html',
        controller: 'profileController'
    })
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
    });
    $qProvider.errorOnUnhandledRejections(false);
}])
.factory('socket', ['socketFactory', function (socketFactory) {
    return socketFactory();
}])
.filter("emptyToEnd", function () {
    return function (array, key) {
        if(array && array.length>0) {
            var present = array.filter(function (item) {
                return item[key];
            }),
            empty = array.filter(function (item) {
                return !item[key];
            });
            return present.concat(empty);
        }
    };
});