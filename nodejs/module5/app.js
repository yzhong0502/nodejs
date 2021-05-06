const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 4200;

//db
const mongourl = 'mongodb://127.0.0.1:27017/classpractice';
const col_name = 'orderList';
let db = mongoose.connect(mongourl);
let orderModel = require('./models/ordersModel');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/src/styles'));

app.set('views','./src/views');
app.set('view engine', 'ejs');

const items = [{
    name: 'Apple 2 LB',
    price: 3.49
},{
    name: 'Orange 2 LB',
    price: 3.99
},{
    name: 'Blueberry 1 Box',
    price: 1.99
}]

function calculateStatus(docs) {
    let curtime = Date.now();
    let status = [];
    for (let i=0;i<docs.length;i++) {
        let passed = (curtime - docs[i].date)/(1000*60*60*24);
        if (passed <= 1) {
            status.push('Order Placed');
        } else if (passed <= 2) {
            status.push('In Progress');
        } else {
            status.push('Delivered');
        }
    }
    return status;
}

app.get('/',(req, res) =>{
    res.send('Serve on port '+port);
});

//route to input info
app.get('/order',(req, res) =>{
    res.render('main',{items});
});

app.get('/error',(req, res) => {
    res.render('error');
})

app.get('/success',(req, res) => {
    res.render('success');
})

//route to add order
app.post('/getUserInput',(req,res,next)=>{
    let orders = req.body.item;
    console.log(orders);
    if (!orders) {
        res.send("You didn't order anything!");
    } else {
        let data = {
            name: req.body.name,
            address : req.body.address,
            email: req.body.email,
            orders: orders,
        };
        console.log(data);
        orderModel.create(data, (err, doc) => {
            if(err) {
                res.status(500).send(err);
            } else {
                res.send('Data inserted');
            }
        })
    }
})

//route to list orders (admin dashboard)
app.get('/admin',(req, res) => {
    orderModel.find((err, docs) => {
        if(err) {
            res.status(500).send(err);
        } else {
            let status = calculateStatus(docs);
            res.render('dashboard',{docs,status});
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
