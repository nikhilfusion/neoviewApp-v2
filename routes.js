var userCtrl = require('./server/controllers/user'),
    middleBoxCtrl = require('./server/controllers/middleBox'),
    cameraCtrl = require('./server/controllers/camera'),
    bodyParser = require('body-parser');
module.exports = function(app){
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.post('/signup', userCtrl.signup);
  app.post('/login', userCtrl.login);
  app.post('/middleBox', middleBoxCtrl.create);
  app.get('/middleBox', middleBoxCtrl.getList);
  app.get('/cameras', cameraCtrl.getList);
  app.post('/camera', cameraCtrl.create);
};
