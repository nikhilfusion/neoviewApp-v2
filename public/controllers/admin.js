angular.module('neoviewApp')
.controller('adminController', ['$scope', '$state', 'Restangular', '$stateParams', '$rootScope', 'commonService', 'growl', function ($scope, $state, Restangular, $stateParams, $rootScope, commonService, growl) {

	var userInfo = commonService.getSession('users');
	if(!userInfo || (userInfo && userInfo.role != 2)) {
		$state.go('login');
	}

	$scope.roles = [
		{
			id : 1,
			name : "Parent"
		},
		{
			id : 0,
			name : "Staff"
		}
	];
	var userCam = "";

  $scope.currentPage = 1;
	$scope.itemsPerPage = 10;
		
	$scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

	switch($state.current.name) {
		case 'app.adminDashboard' : $scope.noUser = false;
			$scope.staffList = true;
			Restangular.one('users').get({'userType' : 0}, {}).then(function(users) {
				$scope.users = users.plain();
				$scope.totalItems = $scope.users.length;
		  }, function(err) {
		  	$scope.noUser = true;
	 	  });
		break;
		case 'app.adminPatientList' : $scope.patient = true;
		  $scope.noUser = false;
		  Restangular.one('users/').get({'userType' : 1}, {}).then(function(users) {
			$scope.users = users.plain();
			$scope.totalItems = $scope.users.length;
	  	  }, function(err) {
	  		$scope.noUser = true;
	  	  });
	  	  break;
		case 'app.adminUser' :  $scope.newFlg = false;
			Restangular.one('user', $stateParams.id).get({}, {}).then(function(userInfo) {
		  	$scope.user = userInfo.plain();
		  	$scope.user.camera = $scope.user.camera === null ? "" : $scope.user.camera;
		  	userCam = userInfo.camera;
		  	Restangular.one('getCamera').get({}, {}).then(function(cameras) {
					$scope.cameras = [];
					$scope.cameras = cameras.plain();
					if($scope.user.camera) {
						$scope.cameras.push($scope.user.camera);
					}
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
  
	$scope.register = function (user, newFlg, isvalid) {
		$scope.submitted = true
		$scope.sucMsg = "";
		$scope.errorMsg = "";
		var valid = true;
		if(isvalid)  {
			angular.forEach(user, function(value, key) {
				if(typeof(value) != 'number' && $scope['loginForm'][key]) {
  				if(value && value.indexOf(' ') >= 0) {
  					valid = false;
					$scope['loginForm'][key]['$invalid'] = true; 					
  				} else {
  					$scope['loginForm'][key]['$invalid'] = false;
  				}
  			}
			});
			if(valid) {
				if(newFlg) {
					if(user.role === 0) {
						user.camera = "";
					}
					Restangular.all('user').post(user, {}).then(function(res) {
						$scope.sucMsg="User created successful";
						$scope.user = {};
						if(res.role === 0) {
							growl.success('Staff added successfully');
							$state.go("app.adminDashboard");
						} else {
							growl.success('Patient added successfully');
							$state.go("app.adminPatientList");
						}
					}, function(err) {
						$scope.errorMsg = err.data;
					});
				} else {
					if(user.camera != userCam) {
						var userType = 'admin',
							userInfo = {};
						userInfo.email = user.email;
						userInfo.camera = user.camera;
						commonService.openNotificationModal(user,userInfo,userType);
					} else {
						Restangular.all('user').all($stateParams.id).customPUT(userInfo).then(function(userInfo) {
							if(userInfo.role === 0) {
								growl.success('Staff updated successfully');
								$state.go("app.adminDashboard");
							} else {
								growl.success('Patient updated successfully');
								$state.go("app.adminPatientList");
							}
						});
					}
				}
			}
		} 		
	};
	$scope.editUser = function(userInfo) {
		$state.go('app.adminUser', { id : userInfo.id });
	};
	$scope.backClick = function() {
		$state.go("app.adminPatientList")
	}
	$scope.changeUser = function(role) {
		if(role === 1) {
			if(!$scope.cameras || $scope.cameras.length === 0) {
				commonService.changeUserModal();
			}
		}
	}
	$scope.dltUser = function(userInfo, staffFlg) {
		var modalInfo = {
			user: userInfo,
			type:'confirm',
			heading: 'Confirm Action'
		}
		if(staffFlg) {
			modalInfo['msg'] = "Are you sure you want to delete"
		} else {
			modalInfo['msg'] = "Are you sure you want to discharge"
		}
		commonService.dltModal(modalInfo);
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