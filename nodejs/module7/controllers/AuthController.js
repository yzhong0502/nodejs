const express = require('express');
const router = express.Router();
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
// For parsing form
const bodyParser = require('body-parser');
// For generating Token
const jwt = require('jsonwebtoken');
// For encrypting Password
const bcrypt = require('bcryptjs');
// For Secert Token
const config = require('../config');
// For User Schema
const User = require('../models/user');
const Product = require('../models/product');
const session = require('express-session');


router.use(session({secret: 'edurekaSecert1', resave: false, saveUninitialized: true}));

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// api/auth/register
router.post('/register', (req, res)=>{
    const {username, password} = req.body;
    if (username && password && username!=="" && password!=="") {
        //check if username exists
        User.findOne({username}, (err, user)=>{
            if (err) return res.status(500).send('Error on the server.');
            if (user) {
                res.status(401).json({message:"Username already exists! Please input another one."})
            } else {
                const hashedPassword = bcrypt.hashSync(password, 8);
                const type = "Normal";
                User.create({
                    username:username,
                    password:hashedPassword,
                    type:type
                }, (err, user) => {
                    if (err) return res.status(500).send("There was a problem registering the user.")
                    // create a token
                    const token = jwt.sign({ id: user._id}, config.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    localStorage.setItem('authtoken', token);
                    localStorage.setItem('usertype', type);
                    const string = encodeURIComponent('Success Fully Register and Login');
                    res.redirect('/?msg=' + string);
                })
            }
        })
    } else {
        res.status(401).json({message:"Please provide missing values."})
    }
  });

// api/auth/login
router.post('/login', (req, res) => {
    const {username, password} = req.body;
    if (username && password && username!=="" && password!=="") {
        //check if username exists
        User.findOne({username}, (err, user)=>{
            if (err) return res.status(500).send('Error on the server.');
            if (!user) {
                res.status(401).json({message:"Username and password combination is not correct."})
            } else {
                const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
                if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
                const token = jwt.sign({ id: user._id}, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                localStorage.setItem('authtoken', token);
                localStorage.setItem('usertype', user.type);
                if (usertype==="Admin") {
                    res.redirect('/admin');
                } else {
                    res.redirect('/index');
                }

            }
        })
    } else {
        res.status(401).json({message:"Please provide missing values."})
    }
});

//add user
router.post('/addUser', (req, res) => {
    //verify token
    const token = localStorage.getItem('authtoken');
    if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
        //check the type of user
        User.findById(decoded.id, {password: 0}, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");
            if (user.type !== 'Admin') {
                return res.status(500).send({auth: false, message: 'No permission.'});
            }

            //check if the username already exists
            User.findOne({username: req.body.username}, (err, user) => {
                if (err) return res.status(500).send('Error on the server.');
                if (user) {
                    const string = encodeURIComponent('Username already exists! Please input another username!');
                    res.redirect('/?valid=' + string);
                } else {
                    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
                    User.create({
                            username: req.body.username,
                            password: hashedPassword,
                            type: req.body.type
                        }, (err, user)=> {
                            if (err) return res.status(500).send("There was a problem registering the user.")
                            const string = encodeURIComponent('Success Fully Added User');
                            res.redirect('/?msg=' + string);
                        });
                }
            });
        });
    });
})

router.get('/users', (req,res) => {
    //verify token
    const token = localStorage.getItem('authtoken');
    if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
        //check the type of user
        User.findById(decoded.id, { password: 0 }, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");
            if (user.type!=='Admin') {
                return res.status(500).send({auth: false, message: 'No permission to the data.'});
            }
            //get user list
            User.find((err, users) => {
                if (err) return res.status(500).send("There was a problem finding the users.");
                res.render('userList', {users});
            })
        });
    })
});

// CREATE A PRODUCT IN THE DATABASE
router.post('/addProduct', function (req, res) {
    //verify token
    const token = localStorage.getItem('authtoken');
    if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
        //check the type of user
        User.findById(decoded.id, {password: 0}, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");
            if (user.type !== 'Admin') {
                return res.status(500).send({auth: false, message: 'No permission to the data.'});
            }
            //add product
            let product = {
                id: req.body.id,
                product: req.body.product,
                data: req.body.data,
                price: req.body.price
            }
            console.log(product);
            //check if the id is used in db
            Product.find({id: product.id}, (err, data) => {
                if (err) {
                    res.send("Error happened.")
                }
                if (data) {
                    res.send("The ID already exists. Please input another ID.")
                } else {
                    Product.create(product, (err, data) => {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.send('Product inserted successfully!');
                        }
                    });
                }
                res.redirect('/admin');
            });
        });
    });
});

module.exports = router;
