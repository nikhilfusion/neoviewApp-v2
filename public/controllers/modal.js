angular.module('neoviewApp')
.controller('modalController', ['$scope', '$uibModalInstance', 'params', '$rootScope', function ($scope, $uibModalInstance, params, $rootScope) {
	
	$scope.ok = function() {
		$rootScope.$emit('DeleteUser', {'userId' : params});
		$uibModalInstance.close();
	};
	$scope.cancel = function() {
		$uibModalInstance.close();	
	};
}]);