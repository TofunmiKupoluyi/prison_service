// THis could be used when people are getting ready to leave prison, two years or less till the end of their term
// Find the best qualified prisoners

var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");

var app = express();

var connection = mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DB || "softservices"
});

var clientRouter = express.Router();
var adminRouter = express.Router();

app.use("/client", clientRouter);
app.use("/admin", adminRouter);


