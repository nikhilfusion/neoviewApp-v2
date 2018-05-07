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
  randomString = require('randomstring'),
  dir = 'videos/',
  accountSid = config.accountSId,
  authToken = config.authToken,
  client = require('twilio')(accountSid, authToken),
  transporter = nodemailer.createTransport(smtpTransport ({
    service: 'gmail',
    auth: {
      user: config.gmailUser, // Your email id
      pass: config.gmailPswd // Your password
    }
  }));

module.exports = function(ws, io) {
  var newCameraInfo, oldCameraInfo;

  ws.on('message', function (camInfo) {
    setCamInfo(camInfo, true);
  });

  function getCamInfo() {
    ws.on('message', function (camInfo) {
      setCamInfo(camInfo);
    });
  };

  io.on('connection', function(socket){
  });

  function setCamInfo(camInfo, isEmit) {
    oldCameraInfo = newCameraInfo;
    newCameraInfo = JSON.parse(camInfo);
    if(isEmit) {
      if(oldCameraInfo) {
        test(newCameraInfo, oldCameraInfo);
      } else {
        for(i=0;i<newCameraInfo.length;i++) {
          io.sockets.emit('ChangeCamStatus', {'camInfo' : newCameraInfo[i]});
        }
      }
    }
  };

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
            console.log(a1.name + " is of status " + a1.status);
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
    };
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

  function sendSms(mobileNumber, otp) {
    const msg = 'Use code ' + otp + ' to verify your account on Neoview. Team Neoview!';
    return new Promise(function(resolve, reject) {
      client.messages.create({
        to: mobileNumber,
        from: config.twilioMobileNumber,
        body: msg
      }, function(err, message) {
        if (err) {
            return reject(err);
        } else {
            return resolve(message);
        }
      });
    });
  };
  
  this.login = function(req, res) {
    var reqInfo = req.body;
    db.serialize(function() {
      db.all("SELECT * from users  WHERE email = ?", [reqInfo.email], function(err,rows){
        if(!err && rows.length > 0) {
          var loggedUser = rows[0], otp, oneDay = 24 * 60 * 60 * 1000;
          if(bcrypt.compareSync(reqInfo.password, rows[0].password)) {
            if(loggedUser.otp && loggedUser.otpCreated && ((new Date().getTime() - loggedUser.otpCreated) < oneDay)) {
              otp = loggedUser.otp;
              db.run("UPDATE users SET conn_flg = ? WHERE id = ?" , [true, Number(rows[0].id)]);
            } else {
              otp = Math.floor(1000 + Math.random() * 9000);
              db.run("UPDATE users SET conn_flg = ?, otp = ?, otpCreated = ? WHERE id = ?" , [true, otp, (new Date().getTime()), Number(rows[0].id)]);
            }
            delete loggedUser.password;
            delete loggedUser.otp;
            if(loggedUser.role === 2) {
              res.send(loggedUser);
            } else {
              sendSms(loggedUser.mobile, otp)
              .then(function(smsRes) {
                res.send(loggedUser);
              })
              .catch(function(err) {
                console.log(err);
                res.status(500).send("Something went wrong");
              });
            }
          } else {
            res.status(404).send("Invalid email or password");
          }
        } else {
          res.status(404).send("Invalid email or password");
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
            decry_pswd = random(),
            new_password = bcrypt.hashSync(decry_pswd, salt);
          resInfo['decry_pswd'] = decry_pswd;
          db.run("UPDATE users SET password = ? WHERE id = ?" , [new_password, Number(resInfo.id)]);
          sendMail(resInfo, "Neoview Reset Password");
          res.send("Email sent successful");
        } else {
          res.status(404).send("Invalid email or password");
        }
      });
    });  
  };
  
  this.logout = function(req, res) {
    var reqDt = req.body;
    db.all("SELECT * from users  WHERE id=?", [Number(reqDt.id)], function(err,rows){
      if(rows.length > 0) {
        db.run("UPDATE users SET conn_flg = ? WHERE id = ?" , [false, Number(rows[0].id)]);
        res.send("logout successful");
      } else {
        res.send(err);
      }
    });
  };

  this.signup = function(req, res) {
    var reqDt = req.body;
    if(reqDt.username && reqDt.email && (reqDt.role || reqDt.role == 0)) {
      reqDt.decry_pswd = random();
      reqDt.password = bcrypt.hashSync(reqDt.decry_pswd, salt);
      db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT, role INTEGER, camera TEXT, mobile TEXT, otp INTEGER, otpCreated DATETIME, conn_flg BOOLEAN)");
        db.all("SELECT id from users WHERE  email=?", [reqDt.email], function(err,rows){
          if(!err){
            if(rows.length === 0) {
              var newId = new Date().getTime();
              var stmt = db.prepare("INSERT INTO users VALUES(?,?,?,?,?,?,?,?,?,?)", [newId, reqDt.username, reqDt.password, reqDt.email, reqDt.role, reqDt.camera, reqDt.mobile, '', new Date(), false]);
              stmt.run();
              stmt.finalize();
              sendMail(reqDt, "Neoview Credentials");
              res.send(reqDt);
            }  
            else {
              res.status(403).send("Email already exists");
            }
          } else {
            res.status(500).send(err);
          }  
        });
      });
    } else {
      res.status(400).send("form is invalid")
    }  
  };

  this.getAllUsers = function(req, res) {
    db.all("SELECT * from users where role=? ORDER BY id DESC", [req.query.userType], function(err, users){
      if(!err && users.length > 0) {
        res.send(users);
      } else {
        res.status(404).send("User not found")
      }
    });
  };

  this.getUser = function(req, res) {
    db.all("SELECT * from users  WHERE id=?", [Number(req.params.id)], function(err, userInfo){
      if(!err && userInfo.length > 0) {
        res.send(userInfo[0]);
      } else {
        res.status(404).send("User not found")
      }
    });
  };

  this.editUser = function(req, res){
    var reqDt = req.body, flg=false;
    db.all("SELECT * from users  WHERE id=?", [Number(req.params.id)], function(err, userInfo){
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
        db.run("UPDATE users SET username = ?, password = ?, role = ?, camera = ? WHERE id = ?" , [newDt.username, newDt.password, Number(newDt.role), newDt.camera, Number(newDt.id)]);
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
      var dir_path = dir + cameraName + '/';
      if (fs.existsSync(dir_path)){
        var files = fs.readdirSync(dir_path);
        if(files.length > 0) {
          _.each(files, function(file) {
            fs.unlink(dir_path + file);
          });
        }
      }
    }
  };

  this.deleteUser = function(req, res) {
    db.all("SELECT * from users  WHERE id=?", [Number(req.params.id)], function(err, userInfo){
      if(!err) {
        db.all("DELETE FROM users where id=?", [Number(req.params.id)], function(err, userRes) {
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
      db.all("SELECT password FROM users WHERE id= ?" , [Number(reqDt.userId)], function(err, user) {
        if(!err && user.length>0) {
          if(bcrypt.compareSync(reqDt.currPswd, user[0].password)) {
            var hash_pswd = bcrypt.hashSync(reqDt.newPswd, salt);
            db.run("UPDATE users SET password = ? WHERE id = ?" , [hash_pswd, Number(reqDt.userId)]);
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
    getCamInfo();
    res.send(newCameraInfo);
  };

  this.otpVerifie = function(req, res) {
    var otpDt = req.body;
    db.all("SELECT * from users  WHERE id=?", [Number(otpDt.userId)], function(err, userInfo){
      if(Number(userInfo[0].otp) === Number(otpDt.otp)) {
        res.send(userInfo[0]);
      } else {
        res.status(404).send("Missmatched OTP");
      }
    });
  }

  this.resendOTP = function(req, res) {
    var reqInfo = req.body;
    db.all("SELECT * from users  WHERE id = ?", [reqInfo.userId], function(err,rows){
      var userInfo = rows[0], otp, oneDay = 24 * 60 * 60 * 1000;
      if((new Date().getTime() - userInfo.otpCreated) < oneDay) {
        otp = userInfo.otp;
      } else {
        var otp = Math.floor(1000 + Math.random() * 9000);
        db.run("UPDATE users SET otp = ?, otpCreated = ? WHERE id = ?" , [otp, (new Date().getTime()), reqInfo.userId]);
      }
      sendSms(userInfo.mobile, otp)
      .then(function(smsRes) {
        res.send('OTP Send Successfully');
      }, function(err) {
        res.send(err);
      });
    })

  }

  function sendMail(userInfo, subject) {
    var mailOptions = {
      from: config.gmailUser,
      to: userInfo.email,
      subject: subject,
      html: '<h2>This is Your Neoview Credentials</h2></br>'+
            '<p>Email : ' + userInfo.email + '</p></br>' +
            '<p>Password : ' + userInfo.decry_pswd + '</p></br>'     
      };
    transporter.sendMail(mailOptions, function(error, info, res){
      if(error){
        return false;
      }
    });
  };

  function random(){
    return Math.random().toString(36).slice(-6)
      + randomString.generate({length: 1,charset: 'numeric'})
      + randomString.generate({length: 1,charset: 'alphabetic',capitalization:'uppercase'});
  };
};