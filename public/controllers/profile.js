angular.module('neoviewApp')
.controller('profileController', ['$scope', 'Restangular', '$cookieStore', '$state', '$uibModal', '$rootScope', '$stateParams', 'localStorageService', '$window', function ($scope, Restangular, $cookieStore, $state, $uibModal, $rootScope, $stateParams, localStorageService, $window) {
	$scope.cancelPswd = function() {
		$state.reload();
	};
	$scope.setPswd = function(pswd) {
		$scope.sucMsg = "";
		$scope.errMsg = "";
		var pswdDt = {
			currPswd: pswd.password,
			newPswd : pswd.new_password,
			userId	: cookieInfo.id
		};	
		Restangular.all('resetPassword').customPUT(pswdDt).then(function(userInfo) {
			$scope.patient = {};
			$scope.sucMsg = "Password reset Succesfully.";
		}, function(err) {
			$scope.errMsg = "Check your password and try again.";
		});			
	};
}]);