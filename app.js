// THis could be used when people are getting ready to leave prison, two years or less till the end of their term
// Find the best qualified prisoners

var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
  
var app = express();
  
var connection = mysql.createConnection({
    database: process.env.MYSQL_DB || "softservices"
});
  
var homeRouter = express.Router();
var clientRouter = express.Router();
var adminRouter = express.Router();
  
app.use("/", homeRouter);
app.use("/client", clientRouter);
app.use("/admin", adminRouter);
  
app.use("/", express.static("./"));
app.use("/", express.static("./node_modules"));
app.use("/", express.static("./views"));
app.use(cookieSession({ secret: 'randomStuff', cookie: { maxAge: 60 * 60 * 1000 } }));
  
app.get("/", function(req, res){
    res.sendFile("jokes.html",{ root: __dirname+"/views" });
});
 
app.get("/client", function(req, res){
    res.sendFile("jokes.html",{ root: __dirname+"/views" });
});
 
app.listen(process.env.PORT || 3001, function(req, res){
    console.log("Server Running at 30001");
});
