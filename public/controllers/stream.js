angular.module('neoviewApp')
.controller('streamController', ['$scope', 'socket', '$window', 'Restangular', 'commonService', '$rootScope', '$state', '$timeout', '$rootScope', 
    function($scope, socket, $window, Restangular, commonService, $rootScope, $state, $timeout, $rootScope) {
    var pushIndex=0, playIndex=0, queueLength = 5, videoQueue = [], playSrc,timerID,
    default_video = 'videos/default.mp4', playing = false,
    backMsg = false,count=0,
    userInfo = commonService.getSession('users'),
    camLocalStatus,
    $video = $('#video'),
    $canvas = $('#myCanvas'),
    ctx = $canvas[0].getContext('2d'),
    blinkHandler, blinkTitle, blinkLogicState = false,
    originalTitle = $rootScope.title,
    vis = (function(){
        var stateKey, eventKey, keys = {
            hidden: "visibilitychange",
            webkitHidden: "webkitvisibilitychange",
            mozHidden: "mozvisibilitychange",
            msHidden: "msvisibilitychange"
        };
        for (stateKey in keys) {
            if (stateKey in document) {
                eventKey = keys[stateKey];
                break;
            }
        }
        return function(c) {
            if (c) document.addEventListener(eventKey, c);
            return !document[stateKey];
        }
    })();

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
        stopBlinking();
        count++;
        openEducationTab();
        $video.attr('src', default_video);
        playing = false;
        $video[0].play();
    });

    // copy video frame to canvas every 30 milliseconds
    $video.on('play', function () {
        timerID = $window.setInterval(function () { drawImage($video[0]); }, 30);
    });

    $video.on('ended', nextVideo);
    setLocalData(userInfo);
    camLocalStatus = commonService.getSession('camStatus');
    if(!camLocalStatus && userInfo.role != 1) {
        $state.go('login');
    }
     if(userInfo.camera == 'null' || !userInfo.camera) {
        commonService.notification("No camera Selected");
    } else {
        socket.emit('cameraConnect', {'camera' : userInfo.camera});
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
                playSrc = 'videos/' + userInfo.camera + '/' + videoQueue[playIndex].src;
                videoQueue[playIndex].status = 'playing';
                playIndex= (playIndex+1)%queueLength;
                commonService.notification('Video getting ready for streaming. Please with a moment')
            } else {
                playSrc = default_video;
                commonService.notification('Video stream is not ready. Try after some time')
            }
        } else {
            playSrc = default_video;
            commonService.notification('Video stream is not ready. Try after some time')
        }
        setTimeout(function(){
            commonService.closeModal();
            $video.attr('src', playSrc);
            if(playSrc != default_video) {
                $video[0].play().then(function() {
                    count = 0;
                    playing = true;
                }, function(err) {
                    playing = false;
                    count++;
                    openEducationTab();
                    stopBlinking()
                })    
            } else {
                playing = false;
                count++;
                openEducationTab();
                $video[0].play();
                stopBlinking();
            }    
        }, 3000);
            
    });;

    //setting cameraInfo to localstorage

    function setLocalData(cookie) {
        if(cookie && cookie.camera) {
            Restangular.one('getCamStatus').get({},{}).then(function(camStatus) {
                for(var i=0;i<camStatus.length;i++) {
                    if(camStatus[i].name === cookie.camera) {
                        camLocalStatus = camStatus[i];
                        commonService.setSession('camStatus', camStatus[i])
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
        camLocalStatus = commonService.getSession('camStatus')
        //need a test fun
        if(videoQueue.length > 0 && camLocalStatus.status === 2) {
            if(playSrc === default_video){
                if(videoQueue[(playIndex)%queueLength] && videoQueue[(playIndex)%queueLength].src && videoQueue[(playIndex)%queueLength].status != 'played' && checkUpcomingVideo(playIndex)) {
                    playSrc= 'videos/' + userInfo.camera + '/' + videoQueue[playIndex%queueLength].src;
                    backMsg = true;
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
                if(videoQueue[(playIndex)%queueLength] && videoQueue[(playIndex)%queueLength].src && videoQueue[(playIndex)%queueLength].status != 'played') {
                    playSrc= 'videos/' + userInfo.camera + '/' + videoQueue[(playIndex)%queueLength].src;
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
            playSrc = default_video;
        }
        $video.attr('src', playSrc);
        if(playSrc != default_video) {
            $video[0].play().then(function() {
                playing = true;
                count=0;
                if(backMsg) {
                    if(document.hidden) {
                       startBlinking('Video is ready'); 
                    }else {
                        if(commonService.chkModal()) {
                            commonService.closeModal();
                        }
                        commonService.notification("Welcome back");
                        setTimeout(function(){
                            commonService.closeModal(); 
                        }, 6000);
                        backMsg = false;
                    }
                }              
            }, function(err) {
                playing = false;
                stopBlinking();
                count++;
                openEducationTab();
                playing = false;
            })    
        } else {
            playing = false;
            count++;
            openEducationTab();
            $video[0].play();
            stopBlinking();
            playing = false;
        }
    };

    //Only pushIndex updates here

    socket.on('newFile', function(fileInfo) {
        var filePath = fileInfo.path,
            camInfo = filePath.split('videos/')[1],
            cam = camInfo.split('/')[0],
            fileName = camInfo.split('/')[1];  
        if(cam === userInfo.camera && fileName) {
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
        userInfo = commonService.getSession('users')
        if(cameraInfo.camera === userInfo.camera) {
            $state.go('login');
        }
    });

    function stopBlinking() {
        clearTimeout(blinkHandler);
        $rootScope.title = "NeoviewApp";
        $rootScope.$apply();
    };

    //Toggling camera on/off stage
    socket.on('ChangeCamStatus', function(camStatus) {
        userInfo = commonService.getSession('users')
        commonService.closeModal();
        var camLocalStatus = commonService.getSession('camStatus')
        //need a test
        if(camStatus.camInfo.name === userInfo.camera) {
            commonService.setSession('camStatus',camStatus.camInfo)
            if(camStatus.camInfo.status === 2 && camLocalStatus.status != 2) {
                if(videoQueue[playIndex].status != 'playing') {  
                    nextVideo();
                } else {
                    playSrc = default_video;
                    $video.attr('src', playSrc);
                    count++;
                    openEducationTab();
                    $video[0].play();
                    playing = false;
                    stopBlinking();
                }    
            } else {
                playSrc = default_video;
                playing = false;
                stopBlinking();
                $video.attr('src', playSrc);
                count++;
                openEducationTab();
                $video[0].play();    
            }
        }
    });

    //Its for discharge patient. Clear localstorage and setwith a new info
    socket.on('ChangeCamera', function(camInfo) {
        userInfo = commonService.getSession('users')
        if(camInfo.id === userInfo.id && userInfo.role == 1) {
            if(camInfo.camera == 'null' || !camInfo.camera) {
                commonService.notification("Camera is not available. Try after some time");
            }    
            commonService.setSession('users', camInfo)
            userInfo = camInfo;
            setLocalData(camInfo);
            pushIndex=0; 
            playIndex=0;
            videoQueue = [];
            $video.attr('src', default_video);
            playing = false;
            $video[0].play();
            stopBlinking();
        }
    })

    function openEducationTab() {
        let blogOpened = commonService.getSession('blogOpened');
        if(count !=0 && count%2 == 0 && !blogOpened) {
            commonService.openBlog();
            setTimeout(function(){
                commonService.closeModal(); 
            }, 6000);
        }
    };

    var newTab = $rootScope.$on('newTab', function(){
        commonService.setSession('blogOpened', true);
        $window.open($window.location.origin + '/default', '_blank');
    })
    
    $scope.$on('$destroy', function () {
      newTab();
    });

    function BlinkIteration() {
        if(!blinkLogicState)
        {
            $rootScope.title = "Video is ready";
        } else {
            $rootScope.title = "NeoviewApp";
        }
        $rootScope.$apply();
        blinkLogicState = !blinkLogicState;  
        blinkHandler = setTimeout(BlinkIteration, 1000);
    };

    function startBlinking(title) {
        BlinkIteration();
    };


    vis(function(){
        if(vis()) {
            stopBlinking();
            if(backMsg && playing) {
                if(commonService.chkModal()) {
                    commonService.closeModal();
                }
                commonService.notification("Welcome back");
                setTimeout(function(){
                    commonService.closeModal(); 
                }, 6000);
                backMsg = false;
            }
        }
    });
}]);