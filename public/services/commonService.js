angular.module('neoviewApp')
.service('commonService', function() {
	return {
		isEmpty: function(obj) {
	    	for (var prop in obj) {
	        	if (obj.hasOwnProperty(prop)) {
	          		return false;
	        	}
	      	}
	      	return true;
	    },
	}
});