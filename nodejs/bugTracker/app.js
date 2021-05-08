const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 4200;

//db
const mongourl = 'mongodb://127.0.0.1:27017/classpractice';
let db = mongoose.connect(mongourl);
let bugList = require('./models/bug');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/src/public'));

app.set('views','./src/views');
app.set('view engine', 'ejs');

//route to display bugs
app.get('/',(req,res)=>{
    bugList.find((err,data) => {
        if (err) {
            res.send("Couldn't find data!");
        } else {
            res.render('dashboard', {bugs:data, t: Date.now()});
        }
    })
})

//add page
app.get('/add',(req,res)=>{
    res.render('admin');
})

//route to add bug
app.post('/addBug',(req, res)=> {
    let data = {
        title: req.body.title,
        description: req.body.description,
        date: Date.now(),
        assignee: req.body.assignee
    };
    console.log(data);
    bugList.create(data, (err, doc) => {
        if(err) {
            res.status(500).send(err);
        } else {
            res.send('Data inserted successfully!');
        }
    })
})

app.listen(port,(err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("App is running on port " + port);
    }
})
