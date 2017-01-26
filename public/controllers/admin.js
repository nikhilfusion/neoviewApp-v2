angular.module('neoviewApp')
.controller('adminController', ['$scope', '$cookieStore', '$state', 'Restangular', function ($scope, $cookieStore, $state, Restangular) {
	$scope.logout = function() {
		$cookieStore.remove('users');
		$state.go('login')
	};
	switch($state.current.name) {
		case 'app.nurseDashboard' : Restangular.one('users').get({'userType' : 1}, {}).then(function(users) {
									$scope.users = users.plain();
								  	}, function(err) {
							 	  	});
								  break;
		case 'app.dashboard' : 	  Restangular.one('users/').get({}, {}).then(function(users) {
									$scope.users = users.plain();
								  })
								  break;
	}
}]);