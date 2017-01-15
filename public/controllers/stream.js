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
    }

    socket.on('watch', function(dt) {
        console.log("dt", dt);
    })


    // var length=2,pushIndex=0, playIndex=0;
    // var videoQueue = [],camera;
    // var socket = io();
    // socket.on('cameraConnect', function(cam) {
    //     camera = cam;
    // });
    // angular.element(document).ready(function ()  {
    //     $('#myVideo').bind('contextmenu',function() {
    //     return false;
    //     });
    //     $('#myVideo').bind('ended', function(){
    //     nextVideo();
    //     });
    // });

    // function nextVideo() {
    //     if(videoQueue.length > 0 && videoQueue[playIndex] && videoQueue[playIndex].path) {
    //       videoQueue[playIndex].status = 'played';
    //       if(playIndex >= length-1) {
    //           playIndex = 0;
    //       } else {
    //           playIndex++;
    //       }
    //       var playSrc;
    //       if(videoQueue[playIndex].status === 'To be played') {
    //           playSrc = videoQueue[playIndex].path
    //       } else {
    //           playSrc = 'videos/default.mp4';
    //       }
    //     } else {
    //       playSrc = 'videos/default.mp4';
    //     }
    //     videoPlayer = document.getElementById("myVideo");
    //     //videoPlayer.removeAttribute("controls");
    //     videoPlayer.src = playSrc;
    //     videoPlayer.play();
    // };

    // socket.on('newFile', function(newPath) {
    //     //console.log("newpath", newPath);
    //     videoPlayer = document.getElementById("myVideo");
    //     var playing = videoPlayer.currentSrc;
    //     if(playing == (location.href + 'videos/default.mp4')) {
    //     //videoPlayer.removeAttribute("controls");
    //     videoPlayer.src = newPath;
    //     videoPlayer.play();
    //     } else {
    //     if(pushIndex >= length-1) {
    //         pushIndex = 0;
    //     } else {
    //         pushIndex++;
    //     }
    //     videoQueue[pushIndex] =  {
    //         status : "To be played",
    //         path : newPath
    //     };
    //     }
    //     //console.log("videoQueue", videoQueue);
    // });
}])