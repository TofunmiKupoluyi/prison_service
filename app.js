// THis could be used when people are getting ready to leave prison, two years or less till the end of their term
// Find the best qualified prisoners

var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport('smtps://'+process.env.EMAIL+'%40gmail.com:'+process.env.EMAIL_PASSWORD+'@smtp.gmail.com');

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
var prisonRouter = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieSession({ secret: 'randomStuff', cookie: { maxAge: 60 * 60 * 1000 } }));
app.use("/", homeRouter);
app.use("/client", clientRouter);
app.use("/admin", adminRouter);
app.use("/prison", prisonRouter);

app.use("/", express.static("./"));
app.use("/", express.static("./node_modules"));
app.use("/", express.static("./views"));
app.use(express.static("public"));
app.set("view engine","ejs");

homeRouter.get("/", function(req, res){
    console.log(req.session);
    if(req.session.prisonerNumber){

        res.render("completeRegistration.ejs", {successful:true, educationLevel: "", institution: "", cvLink: "", skillType:""});
    }
    res.render("index.ejs", {successful:false});
});

clientRouter.get("/logout", function(req, res){
    req.session.prisonerNumber = null;
    req.session.recordId = null;
    res.redirect("/");
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
    var prisonerNumber = req.body.email;
    connection.query("select * from prisoner_info where (email=? and password=?) limit 1 ", [prisonerNumber, password], function(err, res1){
        if(err){
            data.res=err;
            res.render("index.ejs", {successful:false});
        }
        else{
            if(res1.length > 0){
                data.res = "Login successful";
                data.err=0;
                connection.query("select * from qualification where prisoner_id = ?", [res1[0].id], function(err, res2){
                    console.log(res2);
                    if(res2.length>0){
                        req.session.prisonerNumber =1;
                        req.session.recordId = res1[0].id;
                        console.log(res2.length-1);
                        res.render("completeQualifications.ejs", {successful:true, educationLevel: res2[res2.length-1].education_level, institution: res2[res2.length-1].institution, cvLink:res2[res2.length-1].cv_link, skillType: res2[res2.length-1].skill_type});
                    }
                    else{
                        req.session.prisonerNumber =1;
                        req.session.recordId = res1[0].id;
                        res.render("completeQualifications.ejs", {successful:true, educationLevel: "", institution: "", cvLink: "", skillType:""});
                    }
                });

            }

            else{
                data.res= "Error";
                res.render("index.ejs", {successful:false});
            }
        }
    });

});

clientRouter.post("/completeQualifications", function(req, res){
    var data ={
        err:1,
        res:""
    }
    if(req.session.prisonerNumber){
        var recordId = req.session.recordId;
        var educationLevel = req.body.educationLevel;
        var institution = req.body.institution;
        var skillType = req.body.skillType;
        var cvLink = req.body.cvLink;
        console.log(recordId);
        connection.query("SELECT * FROM qualification WHERE prisoner_id=?", [recordId], function(err, res1){
            if(err){
                res.json(err);
            }
            else{
                if(res1.length>0){
                    connection.query("UPDATE qualification SET education_level=?, institution=?, cv_link=?, skill_type=? where prisoner_id=?", [educationLevel, institution, cvLink, skillType, recordId], function(err, res1){
                        if(err){
                            res.json(err);
                        }
                        else{
                            data.err=0;
                            data.res="Successful";
                            res.json(data);
                        }
                    });
                }
                else{
                    connection.query("INSERT INTO qualification SET education_level=?, institution=?, cv_link=?, skill_type=?, prisoner_id=?", [educationLevel, institution, cvLink, skillType, recordId], function(err, res1){
                        if(err){
                            data.res = err;
                            res.json(data);
                        }
                        else{
                            data.err= 0;
                            data.res = "Successfully added qualification";
                            res.json(data);
                        }
                    });
                }


            }
        });

    }

    else{
        data.res = "Not registered";
        res.json(data);
    }
});

clientRouter.post("/register", function(req, res){
    var data = {
        err:1,
        res: ""
    }
    console.log(req.body);
    if(req.body.firstName && req.body.lastName && req.body.password && req.body.prisonerNumber){
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var password = req.body.password;
        var prisonerNumber = req.body.prisonerNumber;

        connection.query("INSERT INTO prisoner_info SET first_name=?, last_name=?, email=?, password=?, prisoner_number=?, registration_status=false", [firstName, lastName, email, password, prisonerNumber], function(err, res1){
            if(err){
                data.res = err;
                res.render("index", {successful:false});
            }
            else{
                data.err= 0;
                data.res = "Successful registration";
                req.session.prisonerNumber = prisonerNumber;
                req.session.recordId = res1.insertId;
                res.render("completeQualifications.ejs", {successful:true, educationLevel: "", institution: "", cvLink: "", skillType: ""})
            }
        });
    }
    else{
        data.res= "Incomplete parameters";
        res.render("index", {successful: false});
    }

});

adminRouter.get("/", function(req, res){
    res.render("adminindex.ejs");
});

prisonRouter.post("/completeRegistration", function(req, res){
    var data = {
        err:1,
        res: ""
    }
    if(req.body.id && req.body.birthDate && req.body.sentenceStartDate && req.body.termSentence && req.body.rating){
        var prisonerId = req.body.id;
        var birthDate = req.body.birthDate;
        var sentenceStartDate = req.body.sentenceStartDate;
        var termSentence = req.body.termSentence;
        var rating = req.body.rating;

        connection.query("UPDATE prisoner_info SET birth_date =?, sentence_start_date = ?, rating = ?, term_sentence= ?, registration_status = true WHERE id=?", [birthDate, sentenceStartDate, rating, termSentence, prisonerId], function(err, res1){
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

adminRouter.get("/category", function(req, res){
    var data={
        err: 1,
        res: ""
    }
    var categoryName = req.query.category;
    connection.query("SELECT prisoner_info.id, prisoner_info.first_name, prisoner_info.last_name, prisoner_info.term_sentence, qualification.institution, qualification.skill_type, qualification.education_level"
    +" FROM prisoner_info"
    +" INNER JOIN qualification ON prisoner_info.id = qualification.prisoner_id"
    +" WHERE (qualification.skill_type = ? and prisoner_info.registration_status=true)", [categoryName], function(err, res1){
        if(err){
            data.res= err;
            res.json(data);
        }
        else{
            data.res = res1;
            data.err = 0;
            res.render("admingetprisoner.ejs",{data: res1}); // PATRICK RENDER YOUR VIEW, USEFUL INFORMATION IS IN data.res

        }
    });
});

adminRouter.post("/hire", function(req, res){
    var data={
        err: 1,
        res: ""
    }
    var prisonerId = req.body.prisonerId;
    connection.query("SELECT email FROM prisoner_info WHERE id = ? LIMIT 1", [prisonerId], function(err, res1){
        if(err){
            data.res = err;
            res.json(data);
        }
        else{
            if(res1.length>0){
                var email = res1[0].email;
                var mailOptions = {
                    from: '"LinkInmates" <admin@linkinmates.com>', // sender address
                    to: email, // list of receivers
                    subject: 'Linkinmate - Congratulations!', // Subject line
                    text: 'It is our pleasure to inform you that you have been accepted for a freelance job through Linkinmate.com. Your employer will get in touch with your prison with more information.', // plaintext body
                    html: 'It is our pleasure to inform you that you have been accepted for a freelance job through Linkinmate.com. Your employer will get in touch with your prison with more information.' // html body
                };
                transporter.sendMail(mailOptions,
                    function(error, info){
                        if(error){

                            data.res = "Error sending mail";
                            res.json(data);
                        }
                        data.err=0;
                        data.res = "Mail sent successfully";
                        res.json(data);
                    }
                );
            }
            else{
                res.json(data);
            }

        }

    })
});


prisonRouter.get("/", function(req, res){
    var data={
        err: 1,
        res: ""
    }
    var categoryName = req.query.category;
    connection.query("SELECT prisoner_info.id, prisoner_info.first_name, prisoner_info.last_name, prisoner_info.term_sentence, qualification.institution, qualification.skill_type, qualification.education_level"
    +" FROM prisoner_info"
    +" INNER JOIN qualification ON prisoner_info.id = qualification.prisoner_id"
    +" WHERE (prisoner_info.registration_status=false)", function(err, res1){
        if(err){
            data.res= err;
            res.json(data);
        }
        else{
            data.res = res1;
            data.err = 0;
            
            res.render("prisonmaster.ejs", {data:res1}); // PATRICK RENDER YOUR VIEW, USEFUL INFORMATION IS IN data.res

        }
    });
});

app.listen(process.env.PORT || 3001, function(req, res){
    console.log("Server Running at 30001");
});
