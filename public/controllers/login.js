angular.module('neoviewApp')
.controller('loginController', ['$scope', 'Restangular', function ($scope, Restangular) {	
	$scope.login = function(user) {
		$scope.errorMsg = "";
		Restangular.all('login').post(user, {}).then(function(res) {
			console.log("res is", res);
		}, function(err) {
			console.log("err", err);
			$scope.errorMsg = err.data;
		});
	};
}]);