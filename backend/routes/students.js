const express = require("express");
const router = express.Router();
const db = require("../database.js");
const dbName = "CSE416";
const collectionName = "Students";
const studentModel = require("../models/studentModel.js"); 
const jwt = require("jsonwebtoken");
const keys = require("../keys.js");
const axios = require("axios")
const bcrypt = require("bcryptjs")
mongoose = require("mongoose")

var sha = require("sha1")
const cookieParser = require("cookie-parser");
router.use(cookieParser())
db.initialize(dbName, collectionName, function (dbCollection) { // successCallback

    router.post("/login", (req, res) => {
        const idField = req.body.sbu_id;
        const providedPassword1 = (req.body.password );

        //if user doesnt exist
        if(  dbCollection.findOne({ sbu_id:idField,password:providedPassword1}) == null){
          res.cookie("token", false ,{ maxage:300, httpOnly: true , withCredentials: true,path:"/" });
          res.cookie("studentLoggedIn",0,{ maxage:300, httpOnly: false ,path:"/" });
          res.cookie("gpdLoggedIn",0,{ maxage:300, httpOnly: false ,path:"/" });

          res.send(); 
          return
        }
 
          // Check if user exists
          // Check password    
          dbCollection.findOne({ sbu_id:idField,password:providedPassword1}).then(user => {
          if(user == null){
            res.statusCode=400
            res.cookie("token",  false ,{ maxage:300, httpOnly: true , withCredentials: true,path:"/" });
            res.cookie("studentLoggedIn",0,{ maxage:300, httpOnly: false ,path:"/" });
            res.cookie("gpdLoggedIn",0,{ maxage:300, httpOnly: false ,path:"/" });

            res.send();
          }

              // User matched
              // Create JWT Payload
              const payload = {
                sbu_id: idField,
                typeOf: "student"

              };// Sign token

              jwt.sign(
                payload,
                keys.secretOrKeyStudents,
                {
                  expiresIn: 3000 // 50  min in seconds
                },
                (err, token) => {
                    if(!err)
                    {
                        res.cookie("firstName",  user.first_name)
                        res.cookie("lastName" , user.last_name)
                        res.cookie("token",  token ,{ maxage:1000*1000,sameSite:"none", httpOnly: true , withCredentials: true,path:"/" });
                        res.cookie("studentLoggedIn",1,{ maxage:1000*1000, httpOnly: false ,path:"/" });
                        res.cookie("gpdLoggedIn",0,{ maxage:300, httpOnly: false ,path:"/" });
                        res.send();
                      
                    }
                    
                }
              );
           });




 
      });
      

    router.get("/allStudents", (request, response) => { // get ALL
        var token  = (request.cookies.token)
        console.log(token)
        try {
            console.log( jwt.verify(token,keys.secretOrKeyAdvisors))
            dbCollection.find().toArray((error, result) => {
                if (error) throw error;
                response.json(result);
            });
        } catch (error) {
            response.statusCode=400;
            response.end()
        }

      
    });

    router.post("/addStudent", (request, response) => {
        var token  = (request.cookies["token"])

        console.log( jwt.verify(token,keys.secretOrKeyAdvisors))
     
        var newStudent = new studentModel({
            first_name : request.body.first_name,
            last_name : request.body.last_name,
            username : request.body.username,
            password : request.body.password,
            sbu_id : request.body.sbu_id,
            email: request.body.email,
            department:  request.body.department,
            track: request.body.track,
            entrySemester: request.body.entrySemester,
            entryYear: request.body.entryYear,
            graduationSemester: request.body.graduationSemester,
            graduationYear: request.body.graduationYear,

            coursePlan: null
        })

        newStudent.save(function(err, doc) {
            if (err) return console.error(err);
            dbCollection.find().toArray((_error, _result) => { // callback of find
                if (_error) throw _error;
                response.json(_result);
            });    });

     
    });

    router.delete("/deleteStudent", (request, response) => {

        var token  = (request.cookies.token)

        console.log( jwt.verify(token,keys.secretOrKeyAdvisors))

        const itemId = request.body.sbu_id;
        dbCollection.deleteOne({ sbu_id: itemId }, function(error, result) {
            if (error) throw error;
            // send back entire updated list after successful request
            dbCollection.find().toArray(function(_error, _result) {
                if (_error) throw _error;
                response.json(_result);
            });


        });
    });


    router.delete("/deleteAllStudent/", (request, response) => {
        var token  = (request.cookies.token)
        console.log( token)

        console.log( jwt.verify(token,keys.secretOrKeyAdvisors))

        dbCollection.deleteMany(function(error, result) {
            if (error) throw error;
            // send back entire updated list after successful request
            dbCollection.find().toArray(function(_error, _result) {
                if (_error) throw _error;
                response.json(_result);
            });
        });
    });

    router.get("/getOneStudent", (request, response) => {
        var token  = (request.cookies.token)
        var itemID = request.query.user

        try {
            var decoded =  jwt.verify(token,keys.secretOrKeyStudents)
             itemId = decoded.sbu_id;
        } 
        catch (error) {
            try {
                var decoded =  jwt.verify(token,keys.secretOrKeyAdvisors)      
                 itemId = request.query.user
            } catch (error) {
                response.json({notAllowed:"notAllowed"});
                response.send()
            }
        }            console.log(itemId)


        dbCollection.findOne({ sbu_id: itemId}, (error, result) => {
            if (error) throw error;
            // return item
            response.json(result);
        });
    });

    router.put("/updateStudent", (request, response) => {
        var token  = (request.cookies.token)
        try {
            var decoded =  jwt.verify(token,keys.secretOrKeyStudents)
             var itemId = decoded.sbu_id;

        } 
        catch (error) {
            try {
                var decoded =  jwt.verify(token,keys.secretOrKeyAdvisors)      
                var itemId  =  request.query.user
            
            } catch (error) {
                response.json({notAllowed:"notAllowed"});
                response.send()
            } 
        }


        const item = request.body;

        console.log("Editing item: ", itemId, " to be ", item);
        dbCollection.updateOne({ sbu_id: itemId }, { $set: item }, (error, result) => {
            if (error) throw error;
            // send back entire updated list, to make sure frontend data is up-to-date
            dbCollection.find().toArray(function(_error, _result) {
                if (_error) throw _error;
                response.json(_result);
            });
        });
        
    });

    router.put("/updateStudentCoursePlan", (request, response) => {
  


        const newPlan = request.body.coursePlan

        dbCollection.updateOne({ sbu_id: newPlan.sbu_id }, { $set: {coursePlan: newPlan} }, (error, result) => {
       
        });
        
    });
    router.get("/", (request, response) => {
    
        
    });
   
}, function(err) { // failureCallback
    throw (err);
});

module.exports = router