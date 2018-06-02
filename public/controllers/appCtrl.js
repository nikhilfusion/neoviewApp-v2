angular.module('neoviewApp')
.controller('appController', ['$scope', 'commonService', '$state', 'Restangular', 'socket', '$rootScope', '$stateParams', function ($scope, commonService, $state, Restangular, socket, $rootScope, $stateParams) {
	$rootScope.title = "NeoViewApp";
	var userInfo = commonService.getSession('users');
	function logout() {
		commonService.clearSession();
		$state.go('login');
	};

	angular.element(document).ready(function ()  {
		$("#side-menu li").click(function() {
    		$("#side-menu li").removeClass('active-li');
  		});
	});

	$scope.logout = function() {
		var user = {
			id: userInfo.id
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
	$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    	$scope.curr_state = toState.name;
	})
}]);
/*
role 
0 - nurse
1 - patient
2 - admin
*/