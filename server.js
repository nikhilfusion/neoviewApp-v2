<<<<<<< HEAD
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var express = require('express'),
  app = express(),
  fs = require('fs'),
  privateKey = fs.readFileSync('ssl/key.pem', 'utf8'),
  certificate = fs.readFileSync('ssl/cert.pem', 'utf8'),
  credentials = { key: privateKey, cert: certificate },
  https = require('https').createServer(credentials, app),
  _ = require('underscore'),
  io = require('socket.io')(https),
  bodyParser = require('body-parser'),
  WebSocket = require('ws'),
  config = require('./server/config'),
  apiHost = process.env.isDev ? config.host : config.apiHost,
  apiPort = process.env.isDev ? config.port : config.apiPort,
  ws = new WebSocket('wss://' + apiHost + ':' + apiPort + '/userwebsocket'),
  routes = require('./routes')(app, ws, io),
  port = process.env.PORT || 3000,
  host = process.env.HOST || 'https://127.0.0.1',
  chokidar = require('chokidar'),
  dir = 'videos/',
  watcher = chokidar.watch(dir, { ignored: /^\./, persistent: true }),
  files = [],
  filterTime = '';
process.on('uncaughtException', function(err) {
  console.log(err);
});

app.use('/', express.static(__dirname));

app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(function(req, res, next) {
=======
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var express = require('express'),
    app = express(),
    fs = require('fs'),
    privateKey  = fs.readFileSync('ssl/key.pem', 'utf8'),
    certificate = fs.readFileSync('ssl/cert.pem', 'utf8'),
    credentials = {key: privateKey, cert: certificate},
    https = require('https').createServer(credentials, app),
    _ = require("underscore"),
    io = require('socket.io')(https),
    bodyParser = require('body-parser'),
    WebSocket = require('ws'),
    config = require('./server/config'),
    apiHost = process.env.isDev ? config.host : config.apiHost,
    apiPort = process.env.isDev ? config.port : config.apiPort,
    ws = new WebSocket('wss://' + apiHost + ':' + apiPort + '/userwebsocket'),
    routes = require('./routes')(app, ws, io),
    port = process.env.PORT || 3000,
    host = process.env.HOST || "https://127.0.0.1",
    chokidar = require('chokidar'),
    dir = 'videos/',
    watcher = chokidar.watch(dir, {ignored: /^\./, persistent: true});
process.on('uncaughtException', function (err) {
  console.log(err);
})
app.use('/', express.static(__dirname));
app.get('/*', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.use(function(req, res, next){
>>>>>>> 7ee581a5ab0760c0592cad3bcb22db37f5f1f81c
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
});

<<<<<<< HEAD
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).send('Something went wrong!');
});

io.on('connection', function(socket) {
=======
app.use(function (err, req, res, next) {
  console.error(err)
  res.status(500).send('Something went wrong!')
});

io.on('connection', function(socket){
>>>>>>> 7ee581a5ab0760c0592cad3bcb22db37f5f1f81c
  socket.on('cameraConnect', function(cameraInfo) {
    connected(cameraInfo, socket);
  });
});

https.listen(port, function() {
<<<<<<< HEAD
  console.log('app is running on port ' + port);
});

function connected(cameraInfo, socket) {
  var sliced = [];
  if (cameraInfo.camera) {
    var dir_path = dir + cameraInfo.camera + '/';
    if (!fs.existsSync(dir_path)) {
      fs.mkdirSync(dir_path);
    } else {
      files = fs.readdirSync(dir_path);
      filterTime = new Date(
        new Date().getTime() - config.stream.filterTime * 1000
      ).getTime();
      if (files.length > 0) {
        var after_dlt = _.each(files, function(file) {
          // remove old files
          if (fs.statSync(dir_path + file).ctime.getTime() < filterTime) {
            fs.unlink(dir_path + file);
          }
        });
        if (after_dlt.length >= 3) {
          sliced = after_dlt.slice(after_dlt.length - 3, after_dlt.length);
=======
  console.log("app is running on port " + port);
});

function connected(cameraInfo, socket){
  var sliced = [];
  if(cameraInfo.camera) {
    var dir_path = dir + cameraInfo.camera + '/';
    if (!fs.existsSync(dir_path)){
      fs.mkdirSync(dir_path);
    } else {
      files = fs.readdirSync(dir_path),
      filterTime = new Date(new Date().getTime() - (config.stream.filterTime * 1000)).getTime();
      if(files.length > 0) {
        var after_dlt = _.each(files, function(file) {
          // remove old files
          if(fs.statSync(dir_path + file).ctime.getTime() < filterTime) {
            fs.unlink(dir_path + file);
          }
        });
        if(after_dlt.length >=3) {
          sliced = after_dlt.slice(after_dlt.length-3, after_dlt.length);
>>>>>>> 7ee581a5ab0760c0592cad3bcb22db37f5f1f81c
        }
      }
    }
  }
<<<<<<< HEAD
  socket.emit('videoSend', { videos: sliced });
}

watcher.on('ready', function() {
  watcher.on('add', function(path) {
    var fileName = path.split('/').pop();
    var filePath = path.split(fileName)[0];
    files = fs.readdirSync(filePath);
    filterTime = new Date(
      new Date().getTime() - config.stream.filterTime * 1000
    ).getTime();
    if (files.length > 0) {
      var after_dlt = _.each(files, function(file) {
        if (fs.statSync(filePath + file).ctime.getTime() < filterTime) {
          fs.unlink(filePath + file);
        }
      });
      if (after_dlt.length >= 3) {
        io.sockets.emit('newFile', { path: path, files: after_dlt });
      }
    }
  });
});
=======
  socket.emit('videoSend', {'videos' : sliced});
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
        io.sockets.emit("newFile", { 'path' : path, 'files': after_dlt });
      }
    }  
  });  
});
>>>>>>> 7ee581a5ab0760c0592cad3bcb22db37f5f1f81c
