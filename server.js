var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    _ = require("underscore"),
    io = require('socket.io')(http),
    bodyParser = require('body-parser'),
    WebSocket = require('ws'),
    config = require('./server/config'),
    ws = new WebSocket('ws://' + config.host + ':' + config.port + '/userwebsocket'),
    routes = require('./routes')(app, ws, io),
    port = process.env.PORT || 3000,
    host = process.env.HOST || "127.0.0.1",
    chokidar = require('chokidar'),
    fs = require('fs'),
    dir = 'videos/',
    watcher = chokidar.watch(dir, {ignored: /^\./, persistent: true});    
app.use('/', express.static(__dirname));
app.get('/*', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
});

io.on('connection', function(socket){
  socket.on('cameraConnect', function(cameraInfo) {
    connected(cameraInfo, socket);
  });
});

http.listen(port, function() {
  console.log("app is running on port " + port);
});

function connected(cameraInfo, socket){
  var dir_path = dir + cameraInfo.camera + '/',
    files = fs.readdirSync(dir_path), 
    sliced = [],
    filterTime = new Date(new Date().getTime() - (config.stream.filterTime * 1000)).getTime();
  if(files.length > 0) {
    var after_dlt = _.each(files, function(file) {
      if(fs.statSync(dir_path + file).ctime.getTime() < filterTime) {
        fs.unlink(dir_path + file);
      } 
    });
    if(after_dlt.length >=3) {
      sliced = after_dlt.slice(after_dlt.length-3, after_dlt.length);
    }
    socket.emit('videoSend', {'videos' : sliced});
  } else {
    socket.emit('videoSend', {'videos' : sliced});
  }  
};

watcher.on('ready', function() {
  watcher.on('add', function(path) {
    var fileName = path.split("/").pop();
      filePath = path.split(fileName)[0],
      files = fs.readdirSync(filePath),
      filterTime = new Date(new Date().getTime() - (config.stream.filterTime * 1000)).getTime();
    if(files.length > 0) {
      var after_dlt = _.each(files, function(file) {
        if(fs.statSync(filePath + file).ctime.getTime() < filterTime) {
          fs.unlink(filePath + file);
        }  
      });
      if(after_dlt.length >=3) {
        io.sockets.emit("newFile", { 'path' : path});
      }
    }  
  });  
});