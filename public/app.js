angular.module('neoviewApp', [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'btford.socket-io',
    'restangular',
    'ngCookies'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider', function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider) {
    
    //RestangularProvider.setBaseUrl('http:127.0.0.1:3000/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'public/views/home.html',
            controller: 'homeController'
        })
        .state('stream', {
            url: '/stream',
            templateUrl: 'public/views/stream.html',
            controller: 'streamController'
        })
        .state('login', {
            url: '/login',
            templateUrl : 'public/views/login.html',
            controller: 'loginController'
        })
        .state('app', {
            templateUrl: 'public/views/admin/admin.html',
            controller: 'adminController',
            resolve: {
                'task' : function($cookieStore, $location) {
                    var cookieData = $cookieStore.get('users');
                    if(!cookieData) {
                        $location.url('/login');
                    }
                }
            }
        })
        .state('app.dashboard',{
            url: '/dashboard',
            templateUrl: 'public/views/admin/dashboard.html'
            //controller: 'adminController'
        })
        .state('app.newUser', {
            url : '/newUser',
            templateUrl : 'public/views/admin/user.html',
            controller : 'userController'
        })
        .state('app.nurseList', {
            url: '/nurses',
            templateUrl: 'public/views/admin/nurseList.html',
            controller: 'userController'
        })
        .state('app.nurse', {
            url : '/nurse/:id',
            templateUrl : 'public/views/admin/user.html',
            controller: 'userController'
        })
        .state('app.nurseDashboard', {
            url: '/nurseDashboard',
            templateUrl : 'public/views/nurse/dashboard.html'
            //controller: 'adminController'
        })
        // .state('admin', {
        //     templateUrl: 'client/views/admin/dashboard.html',
        //     controller: 'homeController',
        //     resolve: {
        //         'task' : function(localStorageService, $location) {
        //             var userInfo = localStorageService.get('userInfo');
        //             // if(!userInfo.userId) {
        //             //   $location.url('/')
        //             // }
        //         }
        //     }
        // })
        // .state('admin.dashboard', {
        //   url : '/admin',
        //   templateUrl: 'client/views/admin/adminDashboard.html',
        //   controller: 'adminController'
        // })
        // .state('admin.addUser', {
        //     url : '/addUser',
        //     templateUrl: 'client/views/admin/addUser.html',
        //     controller: 'adminController'
        // })
        // .state('admin.addCamera', {
        //     url : '/addCamera',
        //     templateUrl: 'client/views/admin/addCamera.html',
        //     controller: 'adminController'
        // })
        // .state('stream',{
        //     url: '/stream',
        //     templateUrl : 'client/views/stream.html',
        //     controller: 'mainController'
        // })

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
    });
}])
.factory('socket', ['socketFactory', function (socketFactory) {
    return socketFactory();
}]);
