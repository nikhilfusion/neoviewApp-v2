angular.module('neoviewApp')
.controller('loginController', ['$scope', 'Restangular', '$cookieStore', '$state', function ($scope, Restangular, $cookieStore, $state) {	
	$scope.login = function(user) {
		$scope.errorMsg = "";
		Restangular.all('login').post(user, {}).then(function(res) {
			var userInfo = res.plain();
			$cookieStore.put('users', userInfo);
			switch(userInfo.role) {
				case 0 : $state.go("app.staffDashboard");
						 break;
				case 1 : $state.go("app.patient");
						 break;
				case 2 : $state.go("app.adminDashboard");
						 break;
			}
		}, function(err) {
			$scope.errorMsg = err.data;
		});
	};
	function init() {
		var cookieInfo = $cookieStore.get('users');
		if(cookieInfo){
			switch(cookieInfo.role) {
				case 0 : $state.go("app.staffDashboard");
						 break;
				case 1 : $state.go("app.stream");
						 break;
				case 2 : $state.go("app.adminDashboard");
						 break;
			}
		}
	}
	init();
}]);