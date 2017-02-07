angular.module('neoviewApp')
.controller('appController', ['$scope', '$cookieStore', '$state', 'Restangular', 'localStorageService', function ($scope, $cookieStore, $state, Restangular, localStorageService) {
	$scope.curr_state = $state.current.name;
	angular.element(document).ready(function ()  {
		$("#side-menu li").click(function() {
    		$("#side-menu li").removeClass('active-li');
  		});
	});

	var cookieInfo = $cookieStore.get('users');
	$scope.logout = function() {
		var user = {
			"id" : cookieInfo.id
		};
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