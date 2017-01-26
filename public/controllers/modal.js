angular.module('neoviewApp')
.controller('modalController', ['$scope', '$uibModalInstance', 'params', '$rootScope', function ($scope, $uibModalInstance, params, $rootScope) {
	
	$scope.ok = function() {
		$rootScope.$emit('DeleteNurse', {'userId' : params});
		$uibModalInstance.close();
	};

	$scope.cancel = function() {
		$uibModalInstance.close();	
	};

}]);