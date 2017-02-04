angular.module('neoviewApp')
.controller('adminController', ['$scope', '$cookieStore', '$state', 'Restangular', '$stateParams', '$uibModal', '$rootScope', function ($scope, $cookieStore, $state, Restangular, $stateParams, $uibModal, $rootScope) {

	$scope.users = [
		{
			id : 0,
			name : "Nurse"
		}, {
			id : 1,
			name : "Patient"
		}
	];

	switch($state.current.name) {
		case 'app.adminDashboard' : $scope.noUser = false;
									$scope.title = "Nurse List";
									Restangular.one('users').get({'userType' : 0}, {}).then(function(users) {
										$scope.users = users.plain();
								  	}, function(err) {
								  		$scope.noUser = true;
							 	  	});
								  	break;
		case 'app.adminPatientList' : $scope.patient = true;
									  $scope.noUser = false;
									  $scope.title = "Patient List";
									  Restangular.one('users/').get({'userType' : 1}, {}).then(function(users) {
										$scope.users = users.plain();
								  	  }, function(err) {
								  		$scope.noUser = true;
								  	  });
								  	  break;
		case 'app.adminUser' :  $scope.newFlg = false;
								Restangular.one('user', $stateParams.id).get({}, {}).then(function(userInfo) {
								  	$scope.user = userInfo;
								  	Restangular.one('getCamera').get({}, {}).then(function(cameras) {
										$scope.cameras = [];
										$scope.cameras = cameras.plain();
										$scope.cameras.push($scope.user.camera);
									});	
								  },function (err) {
								});
								break;
		case "app.adminCreateUser": $scope.newFlg = true;
									$scope.user = {};
									Restangular.one('getCamera').get({}, {}).then(function(cameras) {
										if(cameras.plain().length > 0) {
											$scope.cameras = cameras.plain();
										}
									});			 
								  	break;
	}


	$scope.register = function (user, newFlg) {
		$scope.sucMsg = "";
		$scope.errorMsg = "";
		if(newFlg) {
			user.password = user.username;
			if(user.role === 0) {
				user.camera = "";
			}
			Restangular.all('user').post(user, {}).then(function(res) {
				$scope.sucMsg="User created successfully";
				$scope.user = {};
				if(res.role === 0) {
					$state.go("app.adminDashboard");
				} else {
					$state.go("app.adminPatientList");
				}
			}, function(err) {
				$scope.errorMsg = err.data;
			});
		} else {
			var userInfo = {};
			userInfo.password = user.password;
			userInfo.email = user.email;
			if(user.camera) {
				userInfo.camera = user.camera;
			}
			Restangular.all('user').all($stateParams.id).customPUT(userInfo).then(function(userInfo) {
				if(user.userType === 0) {
					$state.go("app.adminDashboard");
				} else {
					$state.go("app.adminPatientList");
				}
			});
		}
	};
	$scope.editUser = function(userInfo) {
		$state.go('app.adminUser', { id : userInfo.id });
	};
	$scope.dltUser = function(userInfo) {
		$uibModal.open({
          	templateUrl: 'public/views/modal.html',
          	controller: 'modalController',
          	resolve : {
          		params : function() {
          			return userInfo.id;
          		}
          	}
        });
	};
	$scope.cancel = function() {
		$state.reload();
	};
	var deleteFn = $rootScope.$on('DeleteUser', function(evt, userInfo) {
		Restangular.one('user', userInfo.userId).remove().then(function(res) {
			$state.reload();
		}, function(err) {
			console.log("err", err);
		});
	});

	$scope.$on('$destroy', function () {
      deleteFn();
    });
}]);