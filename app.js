// THis could be used when people are getting ready to leave prison, two years or less till the end of their term
// Find the best qualified prisoners

var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var cookieSession = require('cookie-session');

var app = express();

var connection = mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DB || "prison_system",
    charset: "utf8mb4",
});

var homeRouter = express.Router();
var clientRouter = express.Router();
var adminRouter = express.Router();
var recruiterRouter = express.Router();
  
app.use("/", homeRouter);
app.use("/client", clientRouter);
app.use("/admin", adminRouter);
app.use("/recruiter", recruiterRouter);
  
app.use("/", express.static("./"));
app.use("/", express.static("./node_modules"));
app.use("/", express.static("./views"));
app.use(express.static("public"));
app.use(cookieSession({ secret: 'randomStuff', cookie: { maxAge: 60 * 60 * 1000 } }));

homeRouter.get("/", function(req, res){
    res.render("index.ejs");
});

clientRouter.get("/", function(req, res){
    res.sendFile("jokes.html",{ root: __dirname+"/views" });
});

clientRouter.post("/login", function(req, res){
    var data ={
        err:1,
        res:""
    }
    var password = req.body.password;
    var prisonerNumber = req.body.prisonerNumber; 
    connection.query("select * from prisoner_info where (prisoner_number=? and password=?) limit 1 ", [prisonerNumber, password], function(err, res1){
        if(err){
            data.res=err;
            res.json(data);
        }
        else{
            if(res1.length > 0){
                data.res = "Login successful";
                data.err=0;
                res.json(data);
            }

            else{
                data.res= "Error";
                res.json(data);
            }
        }
    });

});

clientRouter.post("/register", function(req, res){
    var data = {
        err:1,
        res: ""
    }
    console.log(req);
    if(req.body.firstName && req.body.lastName && req.body.password && req.body.prisonerNumber){
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var password = req.body.password;
        var prisonerNumber = req.body.prisonerNumber;

        connection.query("INSERT INTO prisoner_info SET first_name=?, last_name=?, email=?, password=?, prisoner_number=?, registration_status=false", [firstName, lastName, email, password, prisonerNumber], function(err, res1){
            if(err){
                data.res = err;
                res.json(data);
            }
            else{
                data.err= 0;
                data.res = "Successful registration";
                res.json(data);
            }
        });
    }
    else{
        data.res= "Incomplete parameters";
        res.json(data);
    }

});

adminRouter.get("/", function(req, res){
    res.render("index.ejs");
});

adminRouter.post("/completeRegistration", function(req, res){
    var data = {
        err:1,
        res: ""
    }
    if(req.body.prisoner && req.body.birthDate && req.body.sentenceStartDate && req.body.rating){
        var prisonerId = req.body.id;
        var birthDate = req.body.birthDate;
        var sentenceStartDate = req.body.sentenceStartDate;
        var rating = req.body.rating;

        connection.query("UPDATE prisoner_info SET birth_date =?, sentence_start_date = ?, rating = ?, registration_status = true WHERE id=?", [birthDate, sentenceStartDate, rating, prisonerId], function(err, res1){
            if(err){
                data.res= err;
                res.json(data);
            }
            else{
                data.err=0;
                data.res= "Successfully updated";
                res.json(data);
            }
        });
    }
    else{
        data.res = "Incomplete parameters";
        res.json(data);
    }

});



app.listen(process.env.PORT || 3001, function(req, res){
    console.log("Server Running at 30001");
});
