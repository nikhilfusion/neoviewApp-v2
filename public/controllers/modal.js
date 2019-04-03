angular.module('neoviewApp')
.controller('modalController', ['$scope', '$uibModalInstance', 'params', '$rootScope', 'Restangular', '$state', 'commonService', 'growl', function ($scope, $uibModalInstance, params, $rootScope, Restangular, $state, commonService, growl) {
	$scope.modalInfo = params;
	$scope.ok = function(modalInfo) {
		if(modalInfo.notifyType === 'noCamNotify') {
			var sessionInfo = commonService.getSession('users');
			$rootScope.$emit('noCamModal', sessionInfo);
		}
		if(modalInfo.type === 'confirm') {
			$rootScope.$emit('DeleteUser', {'userId' : modalInfo.user.id});
			if(modalInfo.user.role) {
				growl.success('Patient discharged successfully');
			} else {
				growl.success('Staff deleted successfully');
			}
		} else if(modalInfo.type === 'alert') {
			Restangular.all('user').all(modalInfo.user.id).customPUT(modalInfo.formInfo).then(function(userInfo) {
				if(modalInfo.userType === 'admin') {				
					growl.success('Patient Transferred Successfully');
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
