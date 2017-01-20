var userCtrl = require('./server/controllers/user')
,   bodyParser = require('body-parser');
module.exports = function(app){
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.post('/user', userCtrl.signup);
  app.post('/login', userCtrl.login);
  app.get('/users', userCtrl.getAllUsers);
  app.get('/user/:id', userCtrl.getUser);
  app.put('/user/:id', userCtrl.editUser);
};
