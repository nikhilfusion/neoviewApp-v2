var sqlite3 = require('sqlite3').verbose(),
  fs = require('fs'),
  dbFile = '../neoview.db',
  db = new sqlite3.Database(dbFile);

exports.login = function(req, res) {
  var reqInfo = req.body;
  db.serialize(function () {
    db.all("SELECT * from users  WHERE username=? and password=?", [reqInfo.username,reqInfo.password], function(err,rows){
      if(rows.length > 0) {
        res.send(rows[0]);
      } else {
        res.status(404).send("Invid username or password");
      }
    });
  });  
};

exports.signup = function(req, res) {
  var reqDt = req.body;
  db.serialize(function() {
    db.all("SELECT * from users  WHERE username=?", [reqDt.username], function(err,rows){
      if(!err && rows.length === 0) {
        db.all("SELECT * FROM users ORDER BY id DESC LIMIT 1", function(err, data) {
          if(!err) {
            if(data.length < 1){ 
              db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role INTEGER, active BOOLEAN)");
            }
            var newId = data[0].id + 1;
            var stmt = db.prepare("INSERT INTO users VALUES(?,?,?,?,?)", [newId, reqDt.username, reqDt.password, reqDt.role, reqDt.active]);
            stmt.run();
            stmt.finalize();
            db.all("SELECT * FROM users ORDER BY id DESC LIMIT 1", function(err, data) {
              res.send(data[0]);
            });
          } else {
            res.send(err);
          }
        })   
      } else {
        res.status(403).send("user already exist");
      }
    });  
  });
  //db.close();
};
exports.getAllUsers = function(req, res) {
  db.all("SELECT * from users  WHERE role=?", [parseInt(req.query.userType)], function(err, users){
    if(!err && users.length > 0) {
      res.send(users[0]);
    } else {
      res.status(404).send("User not found")
    }
  });
}

exports.getUser = function(req, res) {
  db.all("SELECT * from users  WHERE id=?", [parseInt(req.params.id)], function(err, userInfo){
    if(!err && userInfo.length > 0) {
      res.send(userInfo[0]);
    } else {
      res.status(404).send("User not found")
    }
  });
};

exports.editUser = function(req, res){
  var reqDt = req.body;
  db.all("SELECT * from users  WHERE id=?", [parseInt(req.params.id)], function(err, userInfo){
    if(!err && userInfo.length > 0) {
      var newDt = {};
      for (var property in userInfo[0]) {
        newDt[property] = req.body[property] || userInfo[0][property];
      }
      var query = db.run("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?" , [newDt.username, newDt.password, parseInt(newDt.role), parseInt(newDt.id)]);
      db.all("SELECT * from users  WHERE id=?", [parseInt(req.params.id)], function(err, user){
        if(!err && user.length > 0) {
          res.send(user[0]);
        } else {
          res.status(404).send("User not found")
        }
      });
    } else {
      res.status(404).send("User not found")
    }
  });
};
