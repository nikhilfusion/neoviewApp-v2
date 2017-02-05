angular.module('neoviewApp')
.controller('appController', ['$scope', '$cookieStore', '$state', 'Restangular', 'localStorageService', function ($scope, $cookieStore, $state, Restangular, localStorageService) {
	var cookieInfo = $cookieStore.get('users');
	$scope.logout = function() {
		var user = {
			"id" : cookieInfo.id
		};
		console.log("user", user);
		Restangular.all('logout').post(user, {}).then(function(res) {

		})
		$cookieStore.remove('users');
		localStorageService.remove('camStatus');
		$state.go('login');
	};
	if(cookieInfo) {
		$scope.headerInfo = cookieInfo;
		$scope.userType = cookieInfo.role;
	} else {
		$state.go('login');
	}
}]);
/*
role 
0 - nurse
1 - patient
2 - admin
*/