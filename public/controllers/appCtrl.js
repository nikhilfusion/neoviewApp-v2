angular.module('neoviewApp')
.controller('appController', ['$scope', '$cookieStore', '$state', 'Restangular', 'localStorageService', function ($scope, $cookieStore, $state, Restangular, localStorageService) {
	$scope.logout = function() {
		$cookieStore.remove('users');
		localStorageService.remove('camStatus');
		$state.go('login')
	};
	var cookieInfo = $cookieStore.get('users');
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