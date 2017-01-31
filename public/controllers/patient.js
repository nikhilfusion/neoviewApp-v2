angular.module('neoviewApp')
.controller('patientController', ['$scope', 'Restangular', '$cookieStore', '$state', '$uibModal', '$rootScope', '$stateParams', 'localStorageService', '$window', function ($scope, Restangular, $cookieStore, $state, $uibModal, $rootScope, $stateParams, localStorageService, $window) {
	var cookieInfo = $cookieStore.get('users');
	if(cookieInfo.camera) {
		Restangular.one('getCamStatus').get({},{}).then(function(camStatus) {
			debugger;
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