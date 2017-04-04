angular.module('neoviewApp')
.controller('streamController', ['$scope', 'socket', '$cookieStore', 'localStorageService', '$window', 'Restangular', 'commonService', '$rootScope', '$state', function($scope, socket, $cookieStore, localStorageService, $window, Restangular, commonService, $rootScope, $state) {
    var pushIndex=0, playIndex=0, queueLength = 5, videoQueue = [], playSrc,
	    videoPlayer = document.getElementById("myVideo"),
        default_video = "videos/default.mp4",
        openTab = true,
        cookieInfo = $cookieStore.get('users'),
        camLocalStatus;
    setLocalData(cookieInfo);
    camLocalStatus = localStorageService.get('camStatus');
    socket.emit('cameraConnect', {'camera' : cookieInfo.camera});	
    angular.element(document).ready(function ()  {
        $('#myVideo').bind('contextmenu',function() {
        	return false;
        });
        
        $('#myVideo').bind('ended', function(){
            nextVideo();
        });
        $('#myVideo')[0].addEventListener('pause', function(){
           $state.reload();
        })
        // if($('#myVideo').get(0).paused) {
        //     console.log("video got paused");
        //     $state.reload();
        // }
    });
    
    socket.on('videoSend', function(videoInfo) {
        var videos = videoInfo.videos;
        if(videos.length > 0) {
            _.each(videos, function(video, index) {
                videoQueue[pushIndex] = {};
                videoQueue[pushIndex].src = video;
                videoQueue[pushIndex].status = "Not Played";
                pushIndex = (pushIndex+1)%queueLength;
            })
            if(camLocalStatus.status === 2) {
                playSrc = 'videos/' + cookieInfo.camera + '/' + videoQueue[playIndex].src;
                videoQueue[playIndex].status = "playing";
            } else {
                playSrc = default_video;
            }
        } else {
            playSrc = default_video;
        }
        if(playSrc) {
            videoPlayer.src = playSrc;
            videoPlayer.play();
        }
    });

    function setLocalData(cookie) {
        if(cookie.camera) {
            Restangular.one('getCamStatus').get({},{}).then(function(camStatus) {
                for(var i=0;i<camStatus.length;i++) {
                    if(camStatus[i].name === cookie.camera) {
                        camLocalStatus = camStatus[i];
                        localStorageService.set('camStatus', camStatus[i]);            
                    }
                }
            });
        }
    }

    function nextVideo() {
        camLocalStatus = localStorageService.get('camStatus');
        if(videoQueue.length > 0 && camLocalStatus.status === 2 && videoQueue[(playIndex+1)%queueLength] && videoQueue[(playIndex+1)%queueLength].status != 'played') {
            playSrc= 'videos/' + cookieInfo.camera + '/' + videoQueue[(playIndex+1)%queueLength].src;
            videoPlayer.src = playSrc;
            videoPlayer.play();
            if(videoQueue[(playIndex)%queueLength].status === 'playing') {
                videoQueue[(playIndex)%queueLength].status = 'played'
            }
            //play next index
            playIndex= (playIndex+1)%queueLength;
            videoQueue[playIndex].status = "playing";
        } else {
            if(playSrc === default_video) {
                openEducationTab();
            }
            playSrc = default_video;
            videoPlayer.src = playSrc;
            videoPlayer.play();
        }
    };

    socket.on('newFile', function(fileInfo) {
        var filePath = fileInfo.path,
            camInfo = filePath.split("videos/")[1],
            cam = camInfo.split("/")[0],
            fileName = camInfo.split("/")[1];  
        if(cam === cookieInfo.camera && fileName) {
            if(videoQueue[pushIndex] && videoQueue[pushIndex].status) {
                videoQueue[pushIndex].src = fileName;
                if(videoQueue[pushIndex].status === "playing" || playSrc === default_video) {
                    camLocalStatus = localStorageService.get('camStatus');
                    if(videoQueue[pushIndex].status === "playing") {
                        videoQueue[(pushIndex+2)%queueLength].src = fileName;
                        videoQueue[(pushIndex+2)%queueLength].status = "Not Played";
                    } else {
                        if(camLocalStatus.status === 2) {
                            videoPlayer.src = 'videos/' + cookieInfo.camera + '/' + fileName;
                        } else {
                            videoPlayer.src = default_video;  
                        }
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
                    videoPlayer.src = default_video;
                }
                videoPlayer.play();
            }
            pushIndex = (pushIndex+1)%queueLength;
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
            if(camStatus.camInfo.status === 2 && camLocalStatus.status != 2) {
                if(videoQueue[playIndex].status != "playing") {
                    nextVideo();
                } else {
                    playSrc = default_video;
                    videoPlayer.src = playSrc;
                    videoPlayer.play();
                }    
            } else {
                playSrc = default_video;
                videoPlayer.src = playSrc;
                videoPlayer.play();    
            }
        }
        localStorageService.set('camStatus', camStatus.camInfo);
    });

    socket.on('ChangeCamera', function(camInfo) {
        if(camInfo.id === cookieInfo.id) {
            $cookieStore.put('users', camInfo);
            cookieInfo = camInfo;
            setLocalData(camInfo);
            pushIndex=0; 
            playIndex=0;
            videoQueue = [];
            playSrc = default_video;
            videoPlayer.src = playSrc;
            videoPlayer.play();
        }
    })

    function openEducationTab() {
        if(openTab) {
            commonService.openBlog();
            openTab = false;
        }
    };

    var newTab = $rootScope.$on('newTab', function(){
        $window.open($window.location.origin + '/default', '_blank');
    })
    $scope.$on('$destroy', function () {
      newTab();
    });
}]);