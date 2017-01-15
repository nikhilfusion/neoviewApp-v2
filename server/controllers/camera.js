var sqlite3 = require('sqlite3').verbose(),
  fs = require('fs'),
  dbFile = '../neoview.db',
  db = new sqlite3.Database(dbFile);
module.exports.getList = function(req, res) {
  db.all("SELECT * FROM items", function(err, data) {
    res.send(data);
  });
};

module.exports.create = function(req, res) {
  var reqDt = req.body;
  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT, email TEXT, dob TEXT, gender TEXT)");
    var stmt = db.prepare("INSERT INTO items VALUES(?,?,?,?,?)", new Date().getTime(), reqDt.name, reqDt.email, reqDt.dob, reqDt.gender);
    stmt.run();
    stmt.finalize();
    db.all("SELECT * FROM items ORDER BY id DESC LIMIT 1", function(err, data) {
      console.log("res", data);
      res.send(data[0]);
    });
  });
  //db.close();
};
