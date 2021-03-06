const app = require('./app');
const express = require('express');
const port = 4200;
const bodyParser =  require('body-parser');
//const session = require('express-session');
const Product = require("./models/product");


app.use(express.static(__dirname+'/public'));

//app.use(session({secret: 'edurekaSecert'}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/',(req,res) => {
    res.redirect('/index');
})


// RETURNS ALL THE PRODUCTS IN THE DATABASE
app.get('/index', function (req, res) {
    Product.find({}, function (err, products) {
        if (err) return res.status(500).send("There was a problem finding the products.");
        let isLogin = localStorage.getItem('authtoken')!=null? 'Yes': 'No';
        res.render('index', {products, isLogin:isLogin, usertype:localStorage.getItem('usertype')});
    });
});

app.get('/login',(req,res) => {
    res.render('login');
})

app.get('/register',(req,res) => {
    res.render('register');
})

const server = app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});
