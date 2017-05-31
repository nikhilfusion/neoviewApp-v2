angular.module('neoviewApp')
.controller('streamController', ['$scope', 'socket', '$cookieStore', 'localStorageService', '$window', 'Restangular', 'commonService', '$rootScope', '$state', '$timeout', '$rootScope', 
    function($scope, socket, $cookieStore, localStorageService, $window, Restangular, commonService, $rootScope, $state, $timeout, $rootScope) {
    var pushIndex=0, playIndex=0, queueLength = 5, videoQueue = [], playSrc,timerID,count=0,
    default_video = 'videos/default.mp4',
    openTab = false,backMsg = false,
    cookieInfo = $cookieStore.get('users'),
    camLocalStatus,
    $video = $('#video'),
    $canvas = $('#myCanvas'),
    ctx = $canvas[0].getContext('2d'),
    blinkHandler, blinkTitle, blinkLogicState = false,
    originalTitle = $rootScope.title;

    function stopTimer() {
        $window.clearInterval(timerID);
    }

    function drawImage(video) {
        //last 2 params are video width and height
        ctx.drawImage(video, 0, 0, 1450, 755);
    }

    // copy the 1st video frame to canvas as soon as it is loaded
    $video.one('loadeddata', function () { drawImage($video[0]); });

    $video.on('error', function(error) {
        playSrc = default_video;
        $video.attr('src', default_video);
        $video[0].play();
    });

    // copy video frame to canvas every 30 milliseconds
    $video.on('play', function () {
        timerID = $window.setInterval(function () { drawImage($video[0]); }, 30);
    });

    $video.on('ended', nextVideo);
    setLocalData(cookieInfo);
    camLocalStatus = localStorageService.get('camStatus');
     if(cookieInfo.camera == 'null' || !cookieInfo.camera) {
        commonService.notification("No camera Selected");
    } else {
        socket.emit('cameraConnect', {'camera' : cookieInfo.camera});
    }  
    angular.element(document).ready(function ()  {
        stopTimer();
    });
    
    //when the page load 3 videos will load in to queue
    socket.on('videoSend', function(videoInfo) {
        var videos = videoInfo.videos;
        if(videos.length > 0) {
            _.each(videos, function(video, index) {
                videoQueue[pushIndex] = {};
                videoQueue[pushIndex].src = video;
                videoQueue[pushIndex].status = 'Not Played';
                pushIndex = (pushIndex+1)%queueLength;
            })
            if(camLocalStatus.status === 2) {
                playSrc = 'videos/' + cookieInfo.camera + '/' + videoQueue[playIndex].src;
                videoQueue[playIndex].status = 'playing';
                playIndex= (playIndex+1)%queueLength;
            } else {
                playSrc = default_video;
            }
        } else {
            playSrc = default_video;
        }
        if(playSrc) {
            $video.attr('src', playSrc);
            $video[0].play().catch(function() {
                $video[0].play();
            })
        }
    });

    //setting cameraInfo to localstorage

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

    //check the upcoming 3 files are ready or not
    function checkUpcomingVideo() {
        var i=0;
        while(i<3) {
            if(!videoQueue[(playIndex+i+queueLength)%queueLength] || !videoQueue[(playIndex+i+queueLength)%queueLength].src || videoQueue[(playIndex+i+queueLength)%queueLength].status === 'played') {
                return false
            }
            i++;
        }
        return true
    }

    //playIndex updates only here

    function nextVideo() {
        stopTimer();
        camLocalStatus = localStorageService.get('camStatus');
        if(videoQueue.length > 0 && camLocalStatus.status === 2) {
            if(playSrc === default_video){
                if(videoQueue[(playIndex)%queueLength].src && videoQueue[(playIndex)%queueLength].status != 'played' && checkUpcomingVideo(playIndex)) {
                    chkVideo();
                    playSrc= 'videos/' + cookieInfo.camera + '/' + videoQueue[playIndex%queueLength].src;
                    if(videoQueue[(playIndex+queueLength-1)%queueLength] && videoQueue[(playIndex+queueLength-1)%queueLength].status && videoQueue[(playIndex+queueLength-1)%queueLength].status === 'playing') {
                        videoQueue[(playIndex+queueLength-1)%queueLength].status = 'played'
                    }
                    //play next index
                    videoQueue[playIndex].status = 'playing';
                    playIndex= (playIndex+1)%queueLength;
                } else{
                    playSrc = default_video;
                }
                
            } else {
                if(videoQueue[(playIndex)%queueLength].src && videoQueue[(playIndex)%queueLength].status != 'played') {
                    playSrc= 'videos/' + cookieInfo.camera + '/' + videoQueue[(playIndex)%queueLength].src;
                    if(videoQueue[(playIndex+queueLength-1)%queueLength] && videoQueue[(playIndex+queueLength-1)%queueLength].status && videoQueue[(playIndex+queueLength-1)%queueLength].status === 'playing') {
                        videoQueue[(playIndex+queueLength-1)%queueLength].status = 'played'
                    }
                    //play next index
                    videoQueue[playIndex].status = 'playing';
                    playIndex= (playIndex+1)%queueLength;
                } else {
                    playSrc = default_video;
                }
            }
        } else {
            if(playSrc === default_video) {
                openEducationTab();
            }
            playSrc = default_video;
            count++;
        }
        $video.attr('src', playSrc);
        $video[0].play().catch(function() {
            $video.attr('src', default_video);
            $video[0].play();
        })
    };

    //Only pushIndex updates here

    socket.on('newFile', function(fileInfo) {
        var filePath = fileInfo.path,
            camInfo = filePath.split('videos/')[1],
            cam = camInfo.split('/')[0],
            fileName = camInfo.split('/')[1];  
        if(cam === cookieInfo.camera && fileName) {
            if(videoQueue.length >0) {
                if(videoQueue[pushIndex] && videoQueue[pushIndex].status) {
                    if(videoQueue[pushIndex].status === 'playing') {
                        videoQueue[(pushIndex+1)%queueLength].src = fileName;
                        videoQueue[(pushIndex+1)%queueLength].status = 'Not Played';
                    } else {
                        videoQueue[(pushIndex)%queueLength].src = fileName;
                        videoQueue[(pushIndex)%queueLength].status = 'Not Played';
                    }
                } else {
                    videoQueue[pushIndex] = {};
                    videoQueue[pushIndex].src = fileName;
                    videoQueue[pushIndex].status = 'Not Played';
                }
                pushIndex = (pushIndex+1)%queueLength;
            } else {
                if(fileInfo.files.length > 0) {
                    _.each(fileInfo.files, function(file, index) {
                        videoQueue[pushIndex] = {};
                        videoQueue[pushIndex].src = file;
                        videoQueue[pushIndex].status = 'Not Played';
                        pushIndex = (pushIndex+1)%queueLength;
                    })
                }                
            }
        }   
    });

    //If we discharge the patient this code will execute
    socket.on('DeleteCamera', function(cameraInfo) {
        if(cameraInfo.camera === cookieInfo.camera) {
            $state.go('login');
        }
    });

    //Toggling camera on/off stage
    socket.on('ChangeCamStatus', function(camStatus) {
        var camLocalStatus = localStorageService.get('camStatus');
        if(camStatus.camInfo.name === cookieInfo.camera) {
            if(camStatus.camInfo.status === 2 && camLocalStatus.status != 2) {
                if(videoQueue[playIndex].status != 'playing') {  
                    commonService.notification('Video getting ready for streaming. Please with a moment')
                    nextVideo();
                } else {
                    playSrc = default_video;
                    $video.attr('src', playSrc);
                    $video[0].play();
                }    
            } else {
                playSrc = default_video;
                $video.attr('src', playSrc);
                $video[0].play();    
            }
        }
        localStorageService.set('camStatus', camStatus.camInfo);
    });

    //Its for discharge patient. Clear localstorage and setwith a new info
    socket.on('ChangeCamera', function(camInfo) {
        if(camInfo.id === cookieInfo.id) {
            $cookieStore.put('users', camInfo);
            cookieInfo = camInfo;
            setLocalData(camInfo);
            pushIndex=0; 
            playIndex=0;
            videoQueue = [];
            $video.attr('src', default_video);
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
        if(playSrc != default_video && openTab && !backMsg) {
            commonService.notification('Welcome back')
            backMsg = true;
        }
    };

    $window.onfocus = function() {
        StopBlinking();
    };

    function chkVideo() {
        if(document.hidden) {
            StartBlinking('Video is ready');
        }    
        if(commonService.chkModal()) {
            commonService.closeModal();
        }    
    };    
    
}]);