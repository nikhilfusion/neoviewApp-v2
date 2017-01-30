angular.module('neoviewApp')
.controller('appController', ['$scope', '$cookieStore', '$state', 'Restangular', function ($scope, $cookieStore, $state, Restangular) {
	$scope.logout = function() {
		$cookieStore.remove('users');
		$state.go('login')
	};
	var cookieInfo = $cookieStore.get('users');
	if(cookieInfo) {
		$scope.user = cookieInfo;
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