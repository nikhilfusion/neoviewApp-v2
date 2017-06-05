angular.module('neoviewApp')
.controller('loginController', ['$scope', 'Restangular', '$state', 'commonService', function ($scope, Restangular, $state, commonService) {	
	if($state.current.name === 'login') {
		$scope.loginFlg = true;
	} else {
		$scope.loginFlg = false;
	}
	$scope.login = function(user) {
		for(key in user) {
			user[key] = user[key].replace(/ /g,'');
		};
		commonService.clearSession();
		$scope.errorMsg = "";
		Restangular.all('login').post(user, {}).then(function(res) {
			var userInfo = res.plain();
			commonService.setSession('users', userInfo)
			switch(userInfo.role) {
				case 0 : $state.go("app.staffDashboard");
						 break;
				case 1 : $state.go("app.stream");
						 break;
				case 2 : $state.go("app.adminDashboard");
						 break;
			}
		}, function(err) {
			$scope.errorMsg = err.data;
		});
	};
	function init() {
		commonService.clearSession();
	};
	$scope.forgot = function(user){
		if(user.email) {
			$scope.errMsg = false;
			$scope.SucMsg = false;
			Restangular.all('forgot').post(user, {}).then(function(res) {
				$scope.SucMsg = "Password sent to your mail id.Please login again.";
			}, function(err) {
				$scope.errMsg = "Wrong email id."
			})
		}	
	};
	init();
}]);