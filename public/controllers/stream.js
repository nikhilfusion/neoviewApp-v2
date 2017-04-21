angular.module('neoviewApp')
.controller('streamController', ['$scope', 'socket', '$cookieStore', 'localStorageService', '$window', 'Restangular', 'commonService', '$rootScope', '$state', '$timeout', '$rootScope', 
    function($scope, socket, $cookieStore, localStorageService, $window, Restangular, commonService, $rootScope, $state, $timeout, $rootScope) {
    var pushIndex=0, playIndex=0, queueLength = 5, videoQueue = [], playSrc,timerID,
        default_video = "videos/default.mp4",
        openTab = false,
        cookieInfo = $cookieStore.get('users'),
        camLocalStatus,
        $video = $("#video"),
        $canvas = $("#myCanvas"),
        ctx = $canvas[0].getContext("2d"),
        blinkHandler, originalTitle, blinkTitle, blinkLogicState = false, blinking=false;

    function stopTimer() {
        $window.clearInterval(timerID);
    }

    function drawImage(video) {
        //last 2 params are video width and height
        ctx.drawImage(video, 0, 0, 1450, 755);
    }

    // copy the 1st video frame to canvas as soon as it is loaded
    $video.one("loadeddata", function () { drawImage($video[0]); });

    $video.on('error', function(error) {
        console.log("error is ", error);
        playSrc = default_video;
        $video.attr("src", default_video);
        $video[0].play();
    });

    // copy video frame to canvas every 30 milliseconds
    $video.on("play", function () {
        timerID = $window.setInterval(function () { drawImage($video[0]); }, 30);
    });

    $video.on("ended", nextVideo);
    setLocalData(cookieInfo);
    camLocalStatus = localStorageService.get('camStatus');
    socket.emit('cameraConnect', {'camera' : cookieInfo.camera});	
    angular.element(document).ready(function ()  {
        stopTimer();
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
            $video.attr("src", playSrc);
            $video[0].play().catch(function() {
                $video[0].play();
            })
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
        stopTimer();
        camLocalStatus = localStorageService.get('camStatus');
        if(pushIndex-1 == playIndex) {
            $video.attr("src", default_video);
            $video[0].play();
        } else {
            if(videoQueue.length > 0 && camLocalStatus.status === 2 && videoQueue[(playIndex)%queueLength] && videoQueue[(playIndex)%queueLength].status != 'played') {
                console.log("chkVideo 1");
                playSrc= 'videos/' + cookieInfo.camera + '/' + videoQueue[(playIndex)%queueLength].src;
                $video.attr("src", playSrc);
                $video[0].play().catch(function() {
                    $video.attr("src", default_video);
                    $video[0].play();
                })
                chkVideo();
                if(videoQueue[(playIndex+queueLength-1)%queueLength] && videoQueue[(playIndex+queueLength-1)%queueLength].status && videoQueue[(playIndex+queueLength-1)%queueLength].status === 'playing') {
                    videoQueue[(playIndex+queueLength-1)%queueLength].status = 'played'
                }
                //play next index
                videoQueue[playIndex].status = "playing";
                playIndex= (playIndex+1)%queueLength;
            } else {
                if(playSrc === default_video) {
                    openEducationTab();
                }
                playSrc = default_video;
                $video.attr("src", playSrc);
                $video[0].play();
            }
        }    
    };

    socket.on('newFile', function(fileInfo) {
        var filePath = fileInfo.path,
            camInfo = filePath.split("videos/")[1],
            cam = camInfo.split("/")[0],
            fileName = camInfo.split("/")[1];  
        if(cam === cookieInfo.camera && fileName) {
            if(videoQueue.length >0) {
                if(videoQueue[pushIndex] && videoQueue[pushIndex].status) {
                    if(videoQueue[pushIndex].status === "playing" || playSrc === default_video) {
                        camLocalStatus = localStorageService.get('camStatus');
                        if(videoQueue[pushIndex].status === "playing") {
                            videoQueue[(pushIndex+1)%queueLength].src = fileName;
                            videoQueue[(pushIndex+1)%queueLength].status = "Not Played";
                            pushIndex = (pushIndex+1)%queueLength;
                        } else {
                            if(camLocalStatus.status === 2) {
                                playSrc = 'videos/' + cookieInfo.camera + '/' + fileName;                                
                            } else {
                                playSrc = default_video;  
                            }
                            $video.attr("src", playSrc);
                            $video[0].play().catch(function() {
                                $video[0].play();
                            })
                        }
                    } else {
                        videoQueue[pushIndex].src = fileName;
                        videoQueue[pushIndex].status = "Not Played"
                    }
                } else {
                    videoQueue[pushIndex] = {};
                    videoQueue[pushIndex].src = fileName;
                    videoQueue[pushIndex].status = "Not Played";
                    if(camLocalStatus.status === 2) {
                        console.log("chkVideo 2");
                        chkVideo();
                        playSrc = 'videos/' + cookieInfo.camera + '/' + videoQueue[playIndex].src;
                    } else {
                        playSrc = default_video;
                    }
                    $video.attr("src", playSrc);
                    $video[0].play().catch(function(err) {
                        console.log("err is ", err);
                        $video.attr("src", default_video);
                        $video[0].play();
                    })
                }
                pushIndex = (pushIndex+1)%queueLength;
            } else {
                if(fileInfo.files.length > 0) {
                    _.each(fileInfo.files, function(file, index) {
                        videoQueue[pushIndex] = {};
                        videoQueue[pushIndex].src = file;
                        videoQueue[pushIndex].status = "Not Played";
                        pushIndex = (pushIndex+1)%queueLength;
                    })
                }                
            }
        }   
    });

    socket.on('DeleteCamera', function(cameraInfo) {
        if(cameraInfo.camera === cookieInfo.camera) {
            $state.go('login');
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
                    $video.attr("src", playSrc);
                    $video[0].play();
                }    
            } else {
                playSrc = default_video;
                $video.attr("src", playSrc);
                $video[0].play();    
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
            $video.attr("src", default_video);
            $video[0].play();
        }
    })

    function openEducationTab() {
        if(!openTab) {
            openTab = true;
            commonService.openBlog();
        }
    };

    var newTab = $rootScope.$on('newTab', function(){
        $window.open($window.location.origin + '/default', '_blank');
    })
    
    $scope.$on('$destroy', function () {
      newTab();
    });

    function StartBlinking(title) {
        originalTitle = $rootScope.title;
        blinkTitle = title;  
        BlinkIteration();
    };

    function BlinkIteration() {
        if(blinkLogicState == false)
        {
            $rootScope.title = blinkTitle;
        } else {
            $rootScope.title = originalTitle;
        }
        $rootScope.$apply();
        blinkLogicState = !blinkLogicState;  
        blinkHandler = setTimeout(BlinkIteration, 1000);
    };
  
    function StopBlinking() {
        if(blinkHandler) {
            clearTimeout(blinkHandler);
        }
        $rootScope.title = originalTitle;
    };

    $window.onfocus = function() {
        //StopBlinking();
    };

    $window.onblur = function() {
        console.log("onblur", openTab, playSrc, blinking);
        if(openTab && playSrc && playSrc != default_video && !blinking) {
            blinking = true;
            StartBlinking("Video is ready");
        }
    }

    function chkVideo() {
        if(playSrc && playSrc != default_video) {
            if(commonService.chkModal()) {
                commonService.closeModal();
            }
        }    
    }

    setTimeout(function() {
        openEducationTab();
    }, 1000);
    

}]);