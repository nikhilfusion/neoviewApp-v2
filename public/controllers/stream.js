angular.module('neoviewApp')
.controller('streamController', ['$scope', 'socket', '$cookieStore', 'localStorageService', function($scope, socket, $cookieStore, localStorageService) {
    var pushIndex=0, playIndex=0, queueLength = 3, videoQueue = [], playSrc,
	   videoPlayer = document.getElementById("myVideo"),
       cookieInfo = $cookieStore.get('users');
    socket.emit('cameraConnect', {'camera' : cookieInfo.camera});
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
        if(videos.length > 0) {
            _.each(videos, function(video, index) {
                videoQueue[pushIndex] = {};
                videoQueue[pushIndex].src = video;
                videoQueue[pushIndex].status = "Not Played";
                pushIndex = (pushIndex+1)%3;
            })
            playSrc = 'videos/' + cookieInfo.camera + '/' + videoQueue[playIndex].src;
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
                playSrc = 'videos/' + cookieInfo.camera + '/' + videoQueue[playIndex].src;
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
        if(cam === cookieInfo.camera && fileName) {
            if(videoQueue[pushIndex] && videoQueue[pushIndex].status) {
                videoQueue[pushIndex].src = fileName;
                if(videoQueue[pushIndex].status === "playing" || playSrc === "videos/default.mp4") {
                    videoPlayer.src = 'videos/' + cookieInfo.camera + '/' + fileName;
                    videoPlayer.play();
                } else {
                videoQueue[pushIndex].status = "Not Played "
                }
            } else {
                videoQueue[pushIndex] = {};
                videoQueue[pushIndex].src = fileName;
                videoQueue[pushIndex].status = "Not Played";
                videoPlayer.src = 'videos/' + cookieInfo.camera + '/' + videoQueue[playIndex].src;
                videoPlayer.play();
            }
            pushIndex = (pushIndex+1)%3;
        }
    });

    socket.on('DeleteCamera', function(cameraInfo) {
        console.log("DeleteCamera", cameraInfo);
        if(cameraInfo.camera === cookieInfo.camera) {
            $state.go('login');
            // playSrc = 'videos/default.mp4';
            // videoPlayer.src = playSrc;
            // videoPlayer.play();
            // delete cookieInfo.camera;
            // $cookieStore.put('users', cookieInfo);
        }
    });

    socket.on('ChangeCamStatus', function(camStatus) {
        console.log("camStatus", camStatus);
        var prevStatus = localStorageService.get('camStatus')
        debugger;
        if(camStatus.camInfo.name === cookieInfo.camera) {
            if(camStatus.camInfo.status === 2 )
                if(videoQueue[playIndex].status != "playing") {
                    console.log("not playing");
                    nextVideo();
            } else {
                if(prevStatus.status === 2 || videoQueue[playIndex].status != "playing") {
                    console.log("else part");
                    playSrc = 'videos/default.mp4';
                    videoPlayer.src = playSrc;
                    videoPlayer.play();
                }
            }
        }
        localStorageService.set('camStatus', camStatus.camInfo);            
    })
}]);

/*
if(videoPlayer.attr('src') === "videos/default.mp4") {

            } else {
                if(videoQueue[pushIndex].status === "playing") {
                    videoPlayer.src = 'videos/cam1/' + fileName;
                    videoPlayer.play();
                } else {
                    videoQueue[pushIndex].status = "Not Played "
                }
            }

*/            