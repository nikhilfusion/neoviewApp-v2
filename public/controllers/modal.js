angular.module('neoviewApp')
.controller('modalController', ['$scope', '$uibModalInstance', 'params', '$rootScope', 'Restangular', '$state', 'commonService', function ($scope, $uibModalInstance, params, $rootScope, Restangular, $state, commonService) {
	$scope.modalInfo = params;
	$scope.ok = function(modalInfo) {
		if(modalInfo.notifyType === 'noCamNotify') {
			var sessionInfo = commonService.getSession('users');
			$rootScope.$emit('noCamModal', sessionInfo);
		}
		if(modalInfo.type === 'confirm') {
			$rootScope.$emit('DeleteUser', {'userId' : modalInfo.user.id});
		} else if(modalInfo.type === 'alert') {
			Restangular.all('user').all(modalInfo.user.id).customPUT(modalInfo.formInfo).then(function(userInfo) {
				if(modalInfo.userType === 'admin') {
					if(modalInfo.user.role === 0) {
						$state.go("app.adminDashboard");
					} else {
						$state.go("app.adminPatientList");
					}
				} else {
					$state.go("app.staffDashboard");
				}	
			});
		} else if(modalInfo.type === 'newTab') {
			$rootScope.$emit('newTab');
		}
		$uibModalInstance.close();
	};
	$scope.cancel = function() {
		$uibModalInstance.close();	
	};
}]);