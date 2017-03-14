angular.module('neoviewApp')
.controller('appController', ['$scope', '$cookieStore', '$state', 'Restangular', 'localStorageService', 'socket', function ($scope, $cookieStore, $state, Restangular, localStorageService, socket) {
	function logout() {
		$cookieStore.remove('users');
		localStorageService.remove('camStatus');
		$state.go('login');
	};

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
			logout();
		})
	};
	if(cookieInfo) {
		$scope.headerInfo = cookieInfo;
		$scope.userType = cookieInfo.role;
	} else {
		$state.go('login');
	}

	socket.on('dltUser', function(userInfo) {
		var cookieInfo = $cookieStore.get('users');
		if(cookieInfo && cookieInfo.id === userInfo.id) {
			logout();
		}
	})
}]);
/*
role 
0 - nurse
1 - patient
2 - admin
*/