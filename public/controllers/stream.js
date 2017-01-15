angular.module('neoviewApp')
.controller('streamController', ['$scope', 'socket', function($scope, socket) {
    var pushIndex=0, playIndex=0, queueLength = 3, videoQueue = [], playSrc;
	var videoPlayer = document.getElementById("myVideo");
    socket.emit('cameraConnect', {'camera' : 'cam1'});
	angular.element(document).ready(function ()  {	
        $('#myVideo').bind('contextmenu',function() {
        	return false;
        });
        
        $('#myVideo').bind('ended', function(){
            nextVideo();
        });
    });

    socket.on('videoSend', function(videoInfo) {
        var videos = videoInfo.videos;
        console.log("videos", videos);
        if(videos.length > 0) {
            _.each(videos, function(video, index) {
                videoQueue[pushIndex] = {};
                videoQueue[pushIndex].src = video;
                videoQueue[pushIndex].status = "Not Played";
                pushIndex = (pushIndex+1)%3;
            })
            playSrc = 'videos/cam1/' + videoQueue[playIndex].src;
            videoQueue[playIndex].status = "playing";
        } else {
            playSrc = 'videos/default.mp4';
        }
        if(playSrc) {
            videoPlayer.src = playSrc;
            videoPlayer.play();
        }
    });

    function nextVideo() {
        if(videoQueue.length > 0) {
            if(videoQueue[(playIndex)%3].status === 'playing') {
                videoQueue[(playIndex)%3].status = 'played'
            }
            //play next index
            playIndex= (playIndex+1)%3;
            if(videoQueue[playIndex].status === 'played') {
                playSrc = 'videos/default.mp4';
            } else {
                playSrc = 'videos/cam1/' + videoQueue[playIndex].src;
                videoQueue[playIndex].status = "playing";
            }
        } else {
            playSrc = 'videos/default.mp4';   
        }
        videoPlayer.src = playSrc;
        videoPlayer.play();
    };

    socket.on('newFile', function(fileInfo) {
        var filePath = fileInfo.path,
            camInfo = filePath.split("videos/")[1],
            cam = camInfo.split("/")[0],
            fileName = camInfo.split("/")[1];    
        if(cam  === 'cam1' && videoQueue.length === 3 && fileName) {
            videoQueue[pushIndex].src = fileName;
            if(videoQueue[pushIndex].status === "playing") {
                videoPlayer.src = 'videos/cam1/' + fileName;
                videoPlayer.play();
            } else {
                videoQueue[pushIndex].status = "Not Played "
            }
            pushIndex = (pushIndex+1)%3;
        }
    });
}]);    