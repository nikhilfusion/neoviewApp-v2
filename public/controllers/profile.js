angular.module('neoviewApp').controller('profileController', [
  '$scope',
  'Restangular',
  'commonService',
  '$state',
  '$uibModal',
  '$rootScope',
  '$stateParams',
  '$window',
  function(
    $scope,
    Restangular,
    commonService,
    $state,
    $uibModal,
    $rootScope,
    $stateParams,
    $window
  ) {
    var sessionInfo = commonService.getSession('users');
    $scope.cancelPswd = function() {
      $state.reload();
    };
    $scope.setPswd = function(pswd) {
      $scope.sucMsg = '';
      $scope.errMsg = '';
      var pswdDt = {
        currPswd: pswd.password,
        newPswd: pswd.new_password,
        userId: sessionInfo.id
      };
      Restangular.all('resetPassword')
        .customPUT(pswdDt)
        .then(
          function(userInfo) {
            $scope.patient = {};
            $scope.sucMsg = 'Password reset successful.';
          },
          function(err) {
            $scope.errMsg = 'Check your password and try again.';
          }
        );
    };
    $scope.back = function() {
      var userInfo = commonService.getSession('users');
      switch (userInfo.role) {
        case 0:
          $state.go('app.staffDashboard');
          break;
        case 1:
          $state.go('app.stream');
          break;
        case 2:
          $state.go('app.adminDashboard');
          break;
      }
    };
  }
]);
