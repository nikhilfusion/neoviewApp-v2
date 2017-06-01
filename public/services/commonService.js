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
	    	if(modalInstance) {
	    		modalInstance.close();
	    	}
	    	var modalInfo = {
				type: 'alert',
				msg: "Do you wish to change the camera assigned to this parent’s account?",
				heading: 'Notification',
				user: user,
				formInfo: userInfo,
				userType: userType
			};
			modalInstance = $uibModal.open({
	          	templateUrl: 'public/views/modal.html',
	          	controller: 'modalController',
	          	resolve : {
	          		params : function() {
	          			return modalInfo;
	          		}
	          	},
	          	backdrop: true 
	        });
	        return modalInstance;
	    },
	    dltModal: function(modalInfo) {
	    	if(modalInstance) {
	    		modalInstance.close();
	    	}
	    	modalInstance = $uibModal.open({
	          	templateUrl: 'public/views/modal.html',
	          	controller: 'modalController',
	          	resolve : {
	          		params : function() {
	          			return modalInfo;
	          		}
	          	},
	          	backdrop: 'static'
	        });
	        return modalInstance
	    },
	    changeUserModal: function() {
	    	if(modalInstance) {
	    		modalInstance.close();
	    	}
	    	var modalInfo = {
				type: 'notification',
				msg: "All cameras have been assigned",
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
	          	backdrop: true 
	        });
	        return modalInstance;
	    },
	    openBlog: function() {
	    	if(modalInstance) {
	    		modalInstance.close();
	    	}
	    	var modalInfo = {
				type: 'newTab',
				msg: "Camera is unavailable. Meanwhile, would you like to visit our education resource?",
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
	    notification: function(msg) {
	    	if(modalInstance) {
	    		modalInstance.close();
	    	}
	    	var modalInfo = {
				type: 'notification',
				msg: msg,
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
	    	if(modalInstance) {
	    		return modalInstance.close();
	    	}
	    },
	    chkModal: function() {
	    	return modalInstance ? true : false;
	    }
	}
}]);