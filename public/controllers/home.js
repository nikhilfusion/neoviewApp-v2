angular.module('neoviewApp')
.controller('homeController', ['$scope', 'socket', function ($scope, socket) {
	$scope.name = "Nikhil";
	socket.on('cameraConnect', function(dt) {
		console.log("dt", dt);
	});
}]);