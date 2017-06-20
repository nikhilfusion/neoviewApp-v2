var sqlite3 = require('sqlite3').verbose(),
  fs = require('fs'),
  lodash = require('lodash'),
  _ = require("underscore"),
  dbFile = '../neoview.db',
  keyBy = require('lodash.keyby'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  config = require('../config'),
  bcrypt = require('bcryptjs'),
  salt = bcrypt.genSaltSync(10),
  db = new sqlite3.Database(dbFile),
  randomstring = require('randomstring'),
  dir = 'videos/'
  transporter = nodemailer.createTransport(smtpTransport ({
    service: 'gmail',
    auth: {
      user: config.gmailUser, // Your email id
      pass: config.gmailPswd // Your password
    }
  }));

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
    db.serialize(function() {
      db.all("SELECT * from users  WHERE username = ?", [reqInfo.username], function(err,rows){
        if(!err && rows.length > 0) {
          if(bcrypt.compareSync(reqInfo.password, rows[0].password)) {
            db.run("UPDATE users SET conn_flg = ? WHERE id = ?" , [true, parseInt(rows[0].id)]);
            delete rows[0].password;
            res.send(rows[0]);
          } else {
            res.status(404).send("Invalid username or password");
          }
        } else {
          res.status(404).send("Invalid username or password");
        }
      });
    });  
  };

  this.forgot = function(req, res) {
    var reqInfo = req.body;
    db.serialize(function() {
      db.all("SELECT * from users WHERE email = ?", [reqInfo.email], function(err,rows){
        if(rows.length > 0) {
          var resInfo = rows[0],
            old_pswd = randomstring.generate(8),
            new_password = bcrypt.hashSync(old_pswd, salt);
          resInfo['old_pswd'] = old_pswd;
          db.run("UPDATE users SET password = ? WHERE id = ?" , [new_password, parseInt(resInfo.id)]);
          sendMail(resInfo, "Neoview Reset Password");
          res.send("Email sent successful");
        } else {
          res.status(404).send("Invalid username or password");
        }
      });
    });  
  };
  
  this.logout = function(req, res) {
    var reqDt = req.body;
    db.all("SELECT * from users  WHERE id=?", [parseInt(reqDt.id)], function(err,rows){
      if(rows.length > 0) {
        db.run("UPDATE users SET conn_flg = ? WHERE id = ?" , [false, parseInt(rows[0].id)]);
        res.send("logout successful");
      } else {
        res.send(err);
      }
    });
  };

  this.signup = function(req, res) {
    var reqDt = req.body;
    if(reqDt.username && reqDt.email && (reqDt.role || reqDt.role == 0)) {
      reqDt.old_pswd = randomstring.generate({
        length: 8,
        charset: 'alphanumeric',
        capitalization: 'lowercase'
      });
      reqDt.password = bcrypt.hashSync(reqDt.old_pswd, salt);
      db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT, role INTEGER, camera TEXT, conn_flg Boolean)");
        db.all("SELECT id from users WHERE username=? or email=?", [reqDt.username, reqDt.email], function(err,rows){
          if(!err){
            if(rows.length === 0) {
              var newId = new Date().getTime();
              var stmt = db.prepare("INSERT INTO users VALUES(?,?,?,?,?,?,?)", [newId, reqDt.username, reqDt.password, reqDt.email, reqDt.role, reqDt.camera, false]);
              stmt.run();
              stmt.finalize();
              sendMail(reqDt, "Neoview Credentials");
              res.send(reqDt);
            }  
            else if(rows.length > 0) {
              res.status(403).send("User already exists");
            }
          } else {
            res.send(err);
          }  
        });
      });
    } else {
      res.status(400).send("form is invalid")
    }  
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
    var reqDt = req.body, flg=false;
    db.all("SELECT * from users  WHERE id=?", [parseInt(req.params.id)], function(err, userInfo){
      if(!err && userInfo.length > 0) {
        var newDt = {};
        for (var property in userInfo[0]) {
          if(reqDt.hasOwnProperty(property)) {
            newDt[property] = reqDt[property]
          } else {
            newDt[property] = userInfo[0][property];
          }
        }
        if(userInfo[0].camera !== reqDt.camera) {
          if(userInfo[0].camera) {
            deleteVideos(userInfo[0].camera);
          }
          if(reqDt.camera) {
            deleteVideos(reqDt.camera);
          }
          flg = true;
        }
        db.run("UPDATE users SET username = ?, password = ?, role = ?, camera = ? WHERE id = ?" , [newDt.username, newDt.password, parseInt(newDt.role), newDt.camera, parseInt(newDt.id)]);
        if(flg) {
          delete newDt.password;
          io.sockets.emit('ChangeCamera', newDt);
          flg = false;
        }
        res.send("User updated successful")
      } else {
        res.status(404).send("User not found");
      }
    });
  };

  function deleteVideos(cameraName) {
    if(cameraName) {
      var dir_path = dir + cameraName + '/',
      files = fs.readdirSync(dir_path);
      if(files.length > 0) {
        _.each(files, function(file) {
          fs.unlink(dir_path + file); 
        });
      }
    }
  }

  this.deleteUser = function(req, res) {
    db.all("SELECT * from users  WHERE id=?", [parseInt(req.params.id)], function(err, userInfo){
      if(!err) {
        db.all("DELETE FROM users where id=?", [parseInt(req.params.id)], function(err, userRes) {
          if(!err) {
            io.sockets.emit('dltUser', userInfo[0])
            res.send("User deleted successful");
          } else {
            res.status(404).send("User not found");
          }
        })
      } else{
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
    db.serialize(function() {
      db.all("SELECT password FROM users WHERE id= ?" , [parseInt(reqDt.userId)], function(err, user) {
        if(!err && user.length>0) {
          if(bcrypt.compareSync(reqDt.currPswd, user[0].password)) {
            var hash_pswd = bcrypt.hashSync(reqDt.newPswd, salt);
            db.run("UPDATE users SET password = ? WHERE id = ?" , [hash_pswd, parseInt(reqDt.userId)]);
              res.send("Password reset successful.");
          } else {
            res.status(404).send("User not found!");
          }
        } else {
          res.status(404).send("User not found!");
        }    
      })
    });  
  };

  this.getCamStatus = function(req, res) {
    res.send(newCameraInfo);
  }

  function sendMail(userInfo, subject) {
    var mailOptions = {
      from: 'niktestplancess@gmail.com',
      to: userInfo.email,
      subject: subject,
      html: '<h2>This is Your Neoview Credentials</h2></br>'+
            '<p>Username : ' + userInfo.username + '</p></br>' +
            '<p>Password : ' + userInfo.old_pswd + '</p></br>'     
      };
    transporter.sendMail(mailOptions, function(error, info, res){
      if(error){
        res.send(error);
      }
    });
  };
}  
