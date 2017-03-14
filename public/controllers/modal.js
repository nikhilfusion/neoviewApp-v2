angular.module('neoviewApp')
.controller('modalController', ['$scope', '$uibModalInstance', 'params', '$rootScope', 'Restangular', '$state', function ($scope, $uibModalInstance, params, $rootScope, Restangular, $state) {
	$scope.modalInfo = params;
	$scope.ok = function(modalInfo) {
		if(modalInfo.type === 'confirm') {
			$rootScope.$emit('DeleteUser', {'userId' : modalInfo.user.id});
		} else if(modalInfo.type === 'alert') {
			Restangular.all('user').all(modalInfo.user.id).customPUT(modalInfo.formInfo).then(function(userInfo) {
				if(modalInfo.user.role === 0) {
					$state.go("app.adminDashboard");
				} else {
					$state.go("app.adminPatientList");
				}
			});
		}
		$uibModalInstance.close();
	};
	$scope.cancel = function() {
		$uibModalInstance.close();	
	};
}]);