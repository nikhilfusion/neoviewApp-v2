var sqlite3 = require('sqlite3').verbose(),
  fs = require('fs'),
  lodash = require('lodash'),
  _ = require("underscore"),
  dbFile = '../neoview.db',
  keyBy = require('lodash.keyby'),
  db = new sqlite3.Database(dbFile);

module.exports = function(ws, io) {
  var newCameraInfo, oldCameraInfo;
  ws.on('message', function (message) {
    oldCameraInfo = newCameraInfo;
    newCameraInfo = JSON.parse(message);
    if(oldCameraInfo) {
      test(newCameraInfo, oldCameraInfo);
    } else {
      for(i=0;i<newCameraInfo.length;i++) {
        io.sockets.emit('ChangeCamStatus', {'camInfo' : newCameraInfo[i]});
      }
    }
  });
  io.on('connection', function(socket){
  });


  function test(arr1, arr2) {
    var merge = _.values(_.extend(keyBy(arr1, 'name'), keyBy(arr2, 'name')))
    //chk for status
    _.each(arr1, function(a1) {
      _.each(arr2, function(a2) {
        if(a1.name === a2.name && a1.status != a2.status) {
          if(a1.status === 2) {
            io.sockets.emit('ChangeCamStatus', {'camInfo' : a1})
            console.log(a1.name + " is on now");
            //its on
          } else {
            io.sockets.emit('ChangeCamStatus', {'camInfo' : a1})
            console.log(a1.name + " is off now");
            //its off
          }
        }
      })
    });
    //chk for deleted camera
    var chkDltArray = diff(arr1, merge);
    if(chkDltArray.length > 0 && chkDltArray[0].name) {
      var deletedCam = chkDltArray[0].name;
      db.all("SELECT * from users  WHERE camera=?", [deletedCam], function(err, userInfo){
        if(!err && userInfo.length > 0) {
          db.run("UPDATE users SET camera = ? WHERE id = ?" , ["", userInfo[0].id]);
          io.sockets.emit("DeleteCamera", {'camera' : deletedCam});
        }
      })
    }
    var chkAddCam = diff(arr2, merge);

    if(chkAddCam.length > 0 && chkAddCam[0].name) {
      console.log("chkAddCam", chkAddCam);
      io.sockets.emit('ChangeCamStatus', {'camInfo' : chkAddCam[0]})
    }
    //chk for added camera
    //console.log("2nd", diff(arr2, merge));
  };
  
  function diff(result1, result2) {
    var props = ['status', 'name'];
    var result = result2.filter(function(o2){
      // filter out (!) items in result2
      return !result1.some(function(o1){
        return o2.name === o1.name; // assumes unique id
      });
    }).map(function(o){
      // use reduce to make objects with only the required properties
      // and map to apply this to the filtered array as a whole
      return props.reduce(function(newo, name){
        if(o[name]) {
          newo[name] = o[name];          
        }
        return newo;
      }, {});
    });
    return result;
  };
  
  this.login = function(req, res) {
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

  this.signup = function(req, res) {
    var reqDt = req.body;
    db.serialize(function() {
      db.all("SELECT * from users  WHERE username=?", [reqDt.username], function(err,rows){
        if(!err && rows.length === 0) {
          db.all("SELECT * FROM users ORDER BY id DESC LIMIT 1", function(err, data) {
            if(!err) {
              if(data.length < 1){ 
                db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role INTEGER, camera TEXT)");
              }
              var newId = data[0].id + 1;
              var stmt = db.prepare("INSERT INTO users VALUES(?,?,?,?,?)", [newId, reqDt.username, reqDt.password, reqDt.role, reqDt.camera]);
              stmt.run();
              stmt.finalize();
              res.send(reqDt);
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
  this.getAllUsers = function(req, res) {
    db.all("SELECT * from users where role=?", [req.query.userType], function(err, users){
      if(!err && users.length > 0) {
        res.send(users);
      } else {
        res.status(404).send("User not found")
      }
    });
  }

  this.getUser = function(req, res) {
    db.all("SELECT * from users  WHERE id=?", [parseInt(req.params.id)], function(err, userInfo){
      if(!err && userInfo.length > 0) {
        res.send(userInfo[0]);
      } else {
        res.status(404).send("User not found")
      }
    });
  };

  this.editUser = function(req, res){
    var reqDt = req.body;
    db.all("SELECT * from users  WHERE id=?", [parseInt(req.params.id)], function(err, userInfo){
      if(!err && userInfo.length > 0) {
        var newDt = {};
        for (var property in userInfo[0]) {
          newDt[property] = req.body[property] || userInfo[0][property];
        }
        db.run("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?" , [newDt.username, newDt.password, parseInt(newDt.role), parseInt(newDt.id)]);
        res.send("User updated successfully")
      } else {
        res.status(404).send("User not found");
      }
    });
  };

  this.deleteUser = function(req, res) {
    db.all("DELETE FROM users where id=?", [parseInt(req.params.id)], function(err, userRes) {
      if(!err) {
        res.send("User deleted successfully");
      } else {
        res.status(404).send("User not found");
      }
    })
  };

  this.getCamera = function(req, res) {
    if(newCameraInfo && newCameraInfo.length > 0){
      var connCameras = newCameraInfo.map(function(cam) {
        return cam.name;
      });
    }  
    db.all("SELECT name FROM sqlite_master WHERE name= ?" , ['users'], function(err, dt) {
      if(!err) {
        if(dt.length === 0) {
          res.send(connCameras);
        } else {
          db.all("SELECT camera from users where camera IS NOT NULL", function(err, cameras) {
            if(!err) {
              var mapCamera = cameras.map(function(cam) {
                return cam.camera;
              })
              var cams = _.difference(connCameras, mapCamera)
              res.send(cams);
            }
          })
        }
      }
    });
  };

  this.resetPswd = function(req, res) {
    var reqDt = req.body;
    db.all("SELECT * FROM users WHERE password = ? and id= ?" , [reqDt.currPswd, parseInt(reqDt.userId)], function(err, user) {
      if(!err) {
        if(user.length>0) {
          db.run("UPDATE users SET password = ? WHERE id = ?" , [reqDt.newPswd, parseInt(reqDt.userId)]);
          res.send("Password reset successfully.");
        } else {
          res.status(404).send("User not found!");
        }
      } else {
        console.log("err", err);
      }  
    })
  };

  this.getCamStatus = function(req, res) {
    res.send(newCameraInfo);
  }
}  
