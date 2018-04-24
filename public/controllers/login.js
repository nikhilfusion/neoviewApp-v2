angular.module('neoviewApp')
.controller('loginController', ['$scope', 'Restangular', '$state', 'commonService', function ($scope, Restangular, $state, commonService) {	
	if($state.current.name === 'login') {
		$scope.loginFlg = true;
		$scope.isOTPCalled = false;
		$scope.userInfo = {};
	} else {
		$scope.loginFlg = false;
	}
	$scope.login = function(user) {
		for(key in user) {
			user[key] = user[key].replace(/ /g,'');
		};
		commonService.clearSession();
		$scope.errMsg = "";
		Restangular.all('login').post(user, {}).then(function(res) {
			$scope.userInfo = res.plain();
			if($scope.userInfo.role === 2) {
				commonService.setSession('users', $scope.userInfo);
				$state.go("app.adminDashboard");
			} else {
				$scope.isOTPCalled = true;
			}
		}, function(err) {
			$scope.errMsg = err.data;
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
	$scope.sendOTP = function(otp) {
		var otpDt = {
			otp: otp,
			userId: $scope.userInfo.id
		};
		Restangular.all('otpVerifie').post(otpDt, {}).then(function(res) {
			$scope.userInfo = res.plain();
			commonService.setSession('users', $scope.userInfo);
			if($scope.userInfo.role === 0) {
				$state.go("app.staffDashboard");
			} else {
				$state.go("app.stream");
			}
		}, function(err) {
			$scope.errMsg = err.data;
		})
	};

	$scope.resendOTP = function() {
		Restangular.all('resendOTP').post({userId: $scope.userInfo.id}, {}).then(function(res) {

		}, function(err) {
			$scope.errMsg = "wrong OTP"
		})
	};

	init();
}]);
