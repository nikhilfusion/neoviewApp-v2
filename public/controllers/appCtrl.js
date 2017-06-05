angular.module('neoviewApp')
.controller('appController', ['$scope', 'commonService', '$state', 'Restangular', 'socket', '$rootScope', function ($scope, commonService, $state, Restangular, socket, $rootScope) {
	$rootScope.title = "NeoviewApp";
	var userInfo = commonService.getSession('users');
	function logout() {
		commonService.clearSession();
		$state.go('login');
	};

	$scope.curr_state = $state.current.name;
	angular.element(document).ready(function ()  {
		$("#side-menu li").click(function() {
    		$("#side-menu li").removeClass('active-li');
  		});
	});

	$scope.logout = function() {
		var user = {
			"id" : userInfo.id
		};
		Restangular.all('logout').post(user, {}).then(function(res) {
			logout();
		})
	};
	if(userInfo) {
		$scope.headerInfo = userInfo;
		$scope.userType = userInfo.role;
	} else {
		$state.go('login');
	}

	socket.on('dltUser', function(userDtls) {
		userInfo = commonService.getSession('users');
		if(userInfo && userInfo.id === userDtls.id) {
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