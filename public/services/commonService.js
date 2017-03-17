angular.module('neoviewApp')
.service('commonService', ['$uibModal', function($uibModal) {
	return {
		isEmpty: function(obj) {
	    	for (var prop in obj) {
	        	if (obj.hasOwnProperty(prop)) {
	          		return false;
	        	}
	      	}
	      	return true;
	    },
	    openNotificationModal: function(user, userInfo, userType) {
	    	var modalInfo = {
				type: 'alert',
				msg: "It seems like you have changed patients camera. Are you sure want to continue",
				heading: 'Notification',
				user: user,
				formInfo: userInfo,
				userType: userType
			};
			return $uibModal.open({
	          	templateUrl: 'public/views/modal.html',
	          	controller: 'modalController',
	          	resolve : {
	          		params : function() {
	          			return modalInfo;
	          		}
	          	},
	          	backdrop: true 
	        });
	    },
	    dltModal: function(modalInfo) {
	    	return $uibModal.open({
	          	templateUrl: 'public/views/modal.html',
	          	controller: 'modalController',
	          	resolve : {
	          		params : function() {
	          			return modalInfo;
	          		}
	          	},
	          	backdrop: 'static'
	        });
	    },
	    changeUserModal: function() {
	    	var modalInfo = {
				type: 'notification',
				msg: "No camera found.Please add cameras",
				heading: 'Notification'
			};
	    	return $uibModal.open({
	          	templateUrl: 'public/views/modal.html',
	          	controller: 'modalController',
	          	resolve : {
	          		params : function() {
	          			return modalInfo;
	          		}
	          	},
	          	backdrop: true 
	        });
	    }
	}
}]);