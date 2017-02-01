angular.module('neoviewApp')
.controller('streamController', ['$scope', 'socket', '$cookieStore', 'localStorageService', '$window', 'Restangular', function($scope, socket, $cookieStore, localStorageService, $window, Restangular) {
    var pushIndex=0, playIndex=0, queueLength = 3, videoQueue = [], playSrc,
	    videoPlayer = document.getElementById("myVideo"),
        cookieInfo = $cookieStore.get('users'),camLocalStatus;
    if(cookieInfo.camera) {
        Restangular.one('getCamStatus').get({},{}).then(function(camStatus) {
            for(var i=0;i<camStatus.length;i++) {
                if(camStatus[i].name === cookieInfo.camera) {
                    camLocalStatus = camStatus[i];
                    localStorageService.set('camStatus', camStatus[i]);            
                }
            }
        });
    }
    camLocalStatus = localStorageService.get('camStatus');
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
            if(camLocalStatus.status === 2) {
                playSrc = 'videos/' + cookieInfo.camera + '/' + videoQueue[playIndex].src;
                videoQueue[playIndex].status = "playing";
            } else {
                playSrc = 'videos/default.mp4';
            }
        } else {
            playSrc = 'videos/default.mp4';
        }
        console.log("playSrc", playSrc, videoPlayer);
        if(playSrc) {
            videoPlayer.src = playSrc;
            videoPlayer.play();
        }
    });

    function nextVideo() {
        camLocalStatus = localStorageService.get('camStatus');
        if(videoQueue.length > 0 && camLocalStatus.status === 2) {
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
            if(playSrc === 'videos/default.mp4') {
                openEducationTab();
                playSrc = 'videos/default.mp4';   
            }
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
                    camLocalStatus = localStorageService.get('camStatus');
                    if(camLocalStatus.status === 2) {
                        videoPlayer.src = 'videos/' + cookieInfo.camera + '/' + fileName;
                    } else {
                        videoPlayer.src = 'videos/default.mp4';  
                    }
                    videoPlayer.play();
                } else {
                videoQueue[pushIndex].status = "Not Played "
                }
            } else {
                videoQueue[pushIndex] = {};
                videoQueue[pushIndex].src = fileName;
                videoQueue[pushIndex].status = "Not Played";
                if(camLocalStatus.status === 2) {
                    videoPlayer.src = 'videos/' + cookieInfo.camera + '/' + videoQueue[playIndex].src;
                } else {
                    videoPlayer.src = 'videos/default.mp4';
                }
                videoPlayer.play();
            }
            pushIndex = (pushIndex+1)%3;
        }
    });

    socket.on('DeleteCamera', function(cameraInfo) {
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
        var camLocalStatus = localStorageService.get('camStatus');
        if(camStatus.camInfo.name === cookieInfo.camera) {
            if(camStatus.camInfo.status === 2 && camLocalStatus.status != 2)
                if(videoQueue[playIndex].status != "playing") {
                    nextVideo();
                } else {
                    playSrc = 'videos/default.mp4';
                    videoPlayer.src = playSrc;
                    videoPlayer.play();
            } else {
                playSrc = 'videos/default.mp4';
                videoPlayer.src = playSrc;
                videoPlayer.play();    
            }
        }
        localStorageService.set('camStatus', camStatus.camInfo);
    });

    function openEducationTab() {
        $window.open($window.location.origin + '/default', '_blank');
    }
}]);           