angular.module('neoviewApp')
.controller('userController', ['$scope', 'Restangular', '$cookieStore', '$state', '$uibModal', '$rootScope', '$stateParams', function ($scope, Restangular, $cookieStore, $state, $uibModal, $rootScope, $stateParams) {
	$scope.users = [
		{
			id : 0,
			name : "Nurse"
		}, {
			id : 1,
			name : "Patient"
		}
	];

	$scope.register = function (user, newFlg) {
		$scope.sucMsg = "";
		$scope.errorMsg = "";
		if(newFlg) {
			user.active = true;	
			Restangular.all('user').post(user, {}).then(function(res) {
				$scope.sucMsg="User created successfully";
				$scope.user = {};
				$scope.user.role = 0;
			}, function(err) {
				$scope.errorMsg = err.data;
			});
		} else {
			var userInfo = {};
			userInfo.password = user.password;
			Restangular.all('user').all($stateParams.id).customPUT(userInfo).then(function(userInfo) {
				$state.go("admin.nurseList");
			});
		}
	};

	switch($state.current.name) {
		case "admin.nurseList" 	: Restangular.one('users').get({'userType' : 0}, {}).then(function(nurses) {
									$scope.nurses = nurses;
								  }, function(err) {
							 	  });
								  break;
		case "admin.nurse"  	: $scope.newFlg = false;
								  Restangular.one('user', $stateParams.id).get({}, {}).then(function(nurse) {
								  	$scope.user = nurse;
								  },function (err) {
								  });	
								  break;
		case "admin.newUser"	: $scope.newFlg = true;
								  break;							  
	}
	
	$scope.dltNurse = function(uid) {
		$uibModal.open({
          	templateUrl: 'public/views/admin/modal.html',
          	controller: 'modalController',
          	resolve : {
          		params : function() {
          			return uid;
          		}
          	}
        }); 
	};

	$rootScope.$on('DeleteNurse', function(evt, userInfo) {
		Restangular.one('user', userInfo.userId).remove().then(function(res) {
			$state.reload();
		}, function(err) {
			console.log("err", err);
		});
	});
}]);
/*
role 
0 - nurse
1 - patient
2 - admin
*/