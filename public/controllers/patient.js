angular.module('neoviewApp')
.controller('patientController', ['$scope', 'Restangular', '$cookieStore', '$state', '$uibModal', '$rootScope', '$stateParams', function ($scope, Restangular, $cookieStore, $state, $uibModal, $rootScope, $stateParams) {
	var cookieInfo = $cookieStore.get('users');
	if(cookieInfo.camera) {
		Restangular.one('getCamStatus').get({},{}).then(function(camStatus) {
			console.log("status", camStatus);
			for(var i=0;i<camStatus.length;i++) {
				if(camStatus[i].name === cookieInfo.camera) {
        			localStorageService.set('camStatus', camStatus[i]);            
				}
			}
		});
	}
	$scope.cancelPswd = function() {
		$state.reload();
	};
	$scope.setPswd = function(pswd) {
		$scope.sucMsg = "";
		$scope.errMsg = "";
		console.log("pswd is", pswd);
		var pswdDt = {
			currPswd: pswd.password,
			newPswd : pswd.new_password,
			userId	: cookieInfo.id
		};	
		Restangular.all('resetPassword').customPUT(pswdDt).then(function(userInfo) {
			console.log("userInfo", userInfo);
			$scope.patient = {};
			$scope.sucMsg = "Password reset Succesfully.";
			//$scope.$apply();
		}, function(err) {
			$scope.errMsg = "Check your password and try again.";
		});			
	};
}]);