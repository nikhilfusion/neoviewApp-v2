angular.module('neoviewApp')
.controller('homeController', ['$scope', '$cookieStore', '$state', function ($scope, $cookieStore, $state) {
	function init() {
		var cookieInfo = $cookieStore.get('users');
		if(cookieInfo){
			switch(cookieInfo.role) {
				case 0 : $state.go("app.staffDashboard");
						 break;
				case 1 : $state.go("app.patient");
						 break;
				case 2 : $state.go("app.adminDashboard");
						 break; 
			}
		}
	}
	init();
}]);