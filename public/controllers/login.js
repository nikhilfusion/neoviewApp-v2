angular.module('neoviewApp')
.controller('loginController', ['$scope', 'Restangular', '$cookieStore', '$state', function ($scope, Restangular, $cookieStore, $state) {	
	$scope.login = function(user) {
		$scope.errorMsg = "";
		Restangular.all('login').post(user, {}).then(function(res) {
			var userInfo = res.plain();
			$cookieStore.put('users', userInfo);
			switch(userInfo.role) {
				case 0 : $state.go("app.nurseDashboard");
						 break;
				case 1 : $state.go("app.patient");
						 break;
				case 2 : $state.go("app.dashboard");
						 break; 
			}
		}, function(err) {
			$scope.errorMsg = err.data;
		});
	};
}]);