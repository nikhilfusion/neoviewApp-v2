angular.module('neoviewApp')
.controller('staffController', ['$scope', '$cookieStore', '$state', 'Restangular', '$stateParams', '$uibModal', '$rootScope', function ($scope, $cookieStore, $state, Restangular, $stateParams, $uibModal, $rootScope) {
	switch($state.current.name) {
		case 'app.staffDashboard' : $scope.patient = true;
									$scope.noUser = false;
									$scope.title = "Patient List";
									Restangular.one('users/').get({'userType' : 1}, {}).then(function(users) {
										$scope.users = users.plain();
								  	}, function(err) {
								  		$scope.noUser = true;
								  	})
								  break;
		case 'app.staffUser' :  $scope.newFlg = false;
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
		case "app.staffCreateUser": $scope.newFlg = true;
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
			user.role = 1;
			Restangular.all('user').post(user, {}).then(function(res) {
				$scope.sucMsg="User created successfully";
				$scope.user = {};
				$state.go("app.staffDashboard");
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
				$state.go("app.staffDashboard");
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