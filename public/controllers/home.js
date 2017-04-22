angular.module('neoviewApp')
.controller('homeController', ['$scope', '$cookieStore', '$state', '$rootScope', function ($scope, $cookieStore, $state, $rootScope) {
	$rootScope.title = "NeoviewApp";
	function init() {
		var cookieInfo = $cookieStore.get('users');
		if(cookieInfo){
			switch(cookieInfo.role) {
				case 0 : $state.transitionTo("app.staffDashboard");
						 break;
				case 1 : $state.transitionTo("app.stream");
						 break;
				case 2 : $state.transitionTo("app.adminDashboard");
						 break; 
			}
		}
	}
	init();
}]);