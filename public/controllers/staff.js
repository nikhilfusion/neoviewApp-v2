angular.module('neoviewApp')
.controller('staffController', ['$scope', '$state', 'Restangular', '$stateParams', '$uibModal', '$rootScope', 'commonService', 'growl', function ($scope, $state, Restangular, $stateParams, $uibModal, $rootScope, commonService, growl) {
	var userCam = "",
		userInfo = commonService.getSession('users');
	$scope.currentPage = 1;
	$scope.itemsPerPage = 1;
			
	$scope.setPage = function (pageNo) {
		$scope.currentPage = pageNo;
	};
	if(!userInfo || (userInfo && userInfo.role != 0)) {
		$state.go('login');
	}
	switch($state.current.name) {
		case 'app.staffDashboard' : $scope.patient = true;
			$scope.noUser = false;
			Restangular.one('users/').get({'userType' : 1}, {}).then(function(users) {
				$scope.users = users.plain();
				$scope.totalItems = $scope.users.length;
		  	}, function(err) {
		  		$scope.noUser = true;
		  	})
		  break;
		case 'app.staffUser' :  $scope.newFlg = false;
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
		case "app.staffCreateUser": $scope.newFlg = true;
			Restangular.one('getCamera').get({}, {}).then(function(cameras) {
				if(cameras.plain().length > 0) {
					$scope.cameras = cameras.plain();
				} else {
					commonService.changeUserModal();
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
					user.role = 1;
					Restangular.all('user').post(user, {}).then(function(res) {
						$scope.sucMsg="User created successful";
						$scope.user = {};
						growl.success('Patient added successfully');
						$state.go("app.staffDashboard");
					}, function(err) {
						$scope.errorMsg = err.data;
					});
				} else {
					if(user.camera != userCam) {
						var userType = 'staff',
							userInfo = {};
						userInfo.email = user.email;
						userInfo.camera = user.camera;	
						commonService.openNotificationModal(user,userInfo,userType);
					} else {
						Restangular.all('user').all($stateParams.id).customPUT(userInfo).then(function(userInfo) {
							growl.success('Patient updated successfully');
							$state.go("app.staffDashboard");
						});
					}
				}
			}
		}
	};

	$scope.backClick = function() {
		$state.go("app.staffDashboard")
	}

	$scope.editUser = function(userInfo) {
		$state.go('app.staffUser', { id : userInfo.id });
	};

	$scope.changeUser = function(role) {
		if(!$scope.cameras || $scope.cameras.length === 0) {
			commonService.changeUserModal();
		}
	};

	$scope.dltUser = function(userInfo) {
		var modalInfo = {
			user: userInfo,
			type:'confirm',
			heading: 'Confirm Action',
			msg:'Are you sure you want to discharge'
		}
		commonService.dltModal(modalInfo);
	};
	
	$scope.changeCamera = function(flg) {
		if(!flg && $scope.cameras.length === 1) {
			alert("No camera found!");
		} else if(flg && $scope.cameras.length > 0) {
			alert("No camera found!");
		}
	}
	
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