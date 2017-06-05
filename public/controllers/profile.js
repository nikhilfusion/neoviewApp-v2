angular.module('neoviewApp')
.controller('profileController', ['$scope', 'Restangular', '$sessionStorage', '$state', '$uibModal', '$rootScope', '$stateParams', '$window', function ($scope, Restangular, $sessionStorage, $state, $uibModal, $rootScope, $stateParams, $window) {
	var sessionInfo = $sessionStorage.get('users');
	$scope.cancelPswd = function() {
		$state.reload();
	};
	$scope.setPswd = function(pswd) {
		$scope.sucMsg = "";
		$scope.errMsg = "";
		var pswdDt = {
			currPswd: pswd.password,
			newPswd : pswd.new_password,
			userId	: sessionInfo.id
		};	
		Restangular.all('resetPassword').customPUT(pswdDt).then(function(userInfo) {
			$scope.patient = {};
			$scope.sucMsg = "Password reset Succesfully.";
		}, function(err) {
			$scope.errMsg = "Check your password and try again.";
		});			
	};
}]);