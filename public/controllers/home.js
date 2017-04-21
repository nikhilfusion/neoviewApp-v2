angular.module('neoviewApp')
.controller('homeController', ['$scope', '$cookieStore', '$state', '$rootScope', function ($scope, $cookieStore, $state, $rootScope) {
	$rootScope.title = "NeoviewApp";
	function init() {
		var cookieInfo = $cookieStore.get('users');
		if(cookieInfo){
			switch(cookieInfo.role) {
				case 0 : $state.go("app.staffDashboard");
						 break;
				case 1 : $state.go("app.stream");
						 break;
				case 2 : $state.go("app.adminDashboard");
						 break; 
			}
		}
	}
	init();
}]);