var userCtrl = require('./server/controllers/user')
,   bodyParser = require('body-parser');
module.exports = function(app, ws, io){
  var user = new userCtrl(ws, io);
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.post('/user', user.signup);
  app.post('/login', user.login);
  app.get('/users', user.getAllUsers);
  app.get('/user/:id', user.getUser);
  app.put('/user/:id', user.editUser);
  app.delete('/user/:id', user.deleteUser);
  app.get('/getCamera', user.getCamera);
  app.get('/getCamStatus', user.getCamStatus);
  app.put('/resetPassword', user.resetPswd);
};