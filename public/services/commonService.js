angular.module('neoviewApp')
.service('commonService', ['$uibModal', function($uibModal) {
	var modalInstance;
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
				msg: "Do you wish to change the camera assigned to this parent’s account?  Continue?",
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
	    },
	    openBlog: function() {
	    	var modalInfo = {
				type: 'newTab',
				msg: "Video streaming take some time mean while you can check our blog",
				heading: 'Notification'
			};
	    	modalInstance = $uibModal.open({
	          	templateUrl: 'public/views/modal.html',
	          	controller: 'modalController',
	          	resolve : {
	          		params : function() {
	          			return modalInfo;
	          		}
	          	},
	          	backdrop: false 
	        });
	        return modalInstance;
	    },
	    closeModal: function() {
	    	return modalInstance.close();
	    },
	    chkModal: function() {
	    	return modalInstance ? true : false;
	    }
	}
}]);