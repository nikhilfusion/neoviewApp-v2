angular.module('neoviewApp')
.controller('userController', ['$scope', 'Restangular', function ($scope, Restangular) {
	$scope.users = [
		{
			id : 0,
			name : "Nurse"
		}, {
			id : 1,
			name : "Patient"
		}
	];

	$scope.register = function (user) {
		user.active = true;
		$scope.sucMsg = "";
		$scope.errorMsg = "";
		Restangular.all('user').post(user, {}).then(function(res) {
			$scope.sucMsg="User created successfully";
			$scope.user = {};
			$scope.user.role = 0;
		}, function(err) {
			console.log("err", err);
			$scope.errorMsg = err.data;
		});
	};
}]);	