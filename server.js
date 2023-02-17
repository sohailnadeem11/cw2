//Import dependencies modules: 
const { ObjectID } = require('bson');
const express = require ('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();const path = require("path");
const fs = require("fs");

//CORS
const cors = require("cors");
app.use(cors());

// Config express js
app.use(express.json())
app.set('port',3000)
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    next();
})

// Connect to mongodb
let db;
MongoClient.connect('mongodb+srv://sohail:sohailnadeem@cluster0.o3egadt.mongodb.net', (err,client) => {
    db = client.db('cw2')
})

//Logger Middleware
let logger = (req,res,next) =>{
    let current_datetime = new Date();
    let formatted_date =
      current_datetime.getFullYear() +
      "-" +
      (current_datetime.getMonth() + 1) +
      "-" +
      current_datetime.getDate() +
      " " +
      current_datetime.getHours() +
      ":" +
      current_datetime.getMinutes() +
      ":" +
      current_datetime.getSeconds();
      let method = req.method;
      let url = req.url;
      let status = res.statusCode;
      let log = `[${formatted_date}] ${method}:${url} ${status}`;
      console.log(log);
      next();
    };
    
app.use(logger);

//Returns Image or error if image does not exist
app.use('/collection/:collectionName', (req, res, next) => {
    var filePath = path.join(__dirname, "static/images" , req.url);
    fs.stat(filePath, function(err, fileInfo){
         if(err){
             res.status(404);
             res.send("Image file not found!");
             return;
         }
         if(fileInfo.isFile()){
             res.sendFile(filePath);
             console.log("GET/" + req.url)
        }
         else next();
      });
 });

// Display message for root path to show tnat Api is Working
app.get('/', (req,res,next) => {
    res.send('Select a collection, e.g., /collection/messages');
})

//Get the collection name
app.param('collectionName', (req,res,next,collectionName) => {
    req.collection = db.collection(collectionName);
    // console.log('collection name:',req.collection)
    return next();
})

// retrieve all objects from a collection
app.get('/collection/:collectionName',(req,res,next)=>{
    req.collection.find({}).toArray((e,results)=>{
        if(e) return next(e)
        res.send(results)
    })
})

//Adding to the collection
app.post('/collection/:collectionName', (req, res, next) => {
       req.collection.insertOne(req.body, (e, results) =>
         {
          if (e) return next(e) 
          res.send(results.ops)
         })
})

//Updating Collection
app.put('/collection/:collectionName/:id', (req,res,next) => {
      req.collection.update(
        {_id: new ObjectID(req.params.id)},
            {$set: req.body},
            {safe:true, multi:false}, (e,results) => {
                if (e) return next(e)
                res.send(results ? {msg:'success'} : {msg:'error'})
         })
 })

// const ObjectID = require('mongodb').ObjectID;
// app.get('/collection/:collectionName/:id', (req, res, next) => {
//     req.collection.findOne({ _id: new ObjectID(req.params.id) },
//      (e, result) => {
//      if (e) return next(e)
//      res.send(result)
//     })
// })

// app.put('/collection/:collectionName/:id', (req, res, next) => {
//     req.collection.update(
//         {_id: new ObjectID(req.params.id)},
//         {$set: req.body},
//         {safe: true, multi: false},
//         (e, result) => {
//           if (e) return next(e)
//           res.send((result = 1) ? {msg: 'success'} : {msg: 'error'})
//         })
// })
// app.get('/lessons', (request,response)=>{
//     db.collection('lessons').find({}).toArray((err,res)=>{
//         if(err) return next(e)
//             response.json(res);
//     })
// })

app.listen(3000, function () {
    console.log("Express.js listening on localhost:3000");
})