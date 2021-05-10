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
            if (err) {
                return res.render('message', {message:'Error on the server.', usertype:"Normal"});
            }
            if (user) {
                return res.render('message', {message:"Username already exists! Please input another one.", usertype:"Normal"});
            } else {
                const hashedPassword = bcrypt.hashSync(password, 8);
                const type = "Normal";
                User.create({
                    username:username,
                    password:hashedPassword,
                    type:type
                }, (err, user) => {
                    if (err) {
                        return res.render('message', {message:"There was a problem registering the user.", usertype:"Normal"});
                    } else {
                        // create a token
                        const token = jwt.sign({ id: user._id, type: type}, config.secret, {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        localStorage.setItem('authtoken', token);
                        localStorage.setItem('usertype', type);
                        return res.render('message', {message:"Registered and logged in sucssessfully!", usertype:"Normal"});
                    }
                })
            }
        })
    } else {
        return res.render('message', {message:"Invalid input value!", usertype:"Normal"})
    }
  });

// api/auth/login
router.post('/login', (req, res) => {
    const {username, password} = req.body;
    if (username && password && username!=="" && password!=="") {
        //check if username exists
        User.findOne({username}, (err, user)=>{
            if (err) {
                res.render('message',{message:'Error on the server.', usertype:"Normal"});
                return;
            }
            if (!user) {
                return res.render('message',{message:"Username and password combination is not correct.", usertype:"Normal"});
            } else {
                const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
                if (!passwordIsValid) {
                    return res.render('message',{message:"Username and password combination is not correct.", usertype:"Normal"});
                }
                const token = jwt.sign({ id: user._id, type: user.type}, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                localStorage.setItem('authtoken', token);
                localStorage.setItem('usertype', user.type);
                if (user.type==="Admin") {
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

//add user   api/auth/addUser
router.post('/addUser', (req, res) => {
    //verify token
    const token = localStorage.getItem('authtoken');
    if (!token) return res.render('message',{message: 'No token provided.',usertype:'Normal'});
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.render('message',{message: 'Failed to authenticate token.',usertype:'Normal'});
        //check the type of user
        const usertype = decoded.type;
        if (usertype!=='Admin') {
            return res.render('message',{message: 'No permission to the data.',usertype:usertype});
        } else {
            //check if the username already exists
            User.findOne({username: req.body.username}, (err, user) => {
                if (err) {
                    return res.render('message',{message: 'Error on the server.',usertype:usertype});
                } else {
                    if (user) {
                        return res.render('message',{message: "Username already exists! Please input another one.",usertype:usertype});
                    } else {
                        const hashedPassword = bcrypt.hashSync(req.body.password, 8);
                        User.create({
                            username: req.body.username,
                            password: hashedPassword,
                            type: req.body.type
                        }, (err, user) => {
                            if (err) return res.render('message',{message: "There was a problem registering the user.",usertype:usertype});
                            else return res.render('message',{message: 'User created successfully!',usertype:usertype});
                        });
                    }
                }
            });
        }

    });
})

//list all users   api/auth/users
router.get('/users', (req,res) => {
    //verify token
    const token = localStorage.getItem('authtoken');
    if (!token) return res.render('message',{message: 'No token provided.',usertype:'Normal'});
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.render('message',{message: 'Failed to authenticate token.',usertype:'Normal'});
        //check the type of user
        const usertype = decoded.type;
        if (usertype!=='Admin') {
            res.render('message',{message: 'No permission to the data.',usertype:usertype});
        } else {
            //get user list
            User.find((err, users) => {
                if (err) return res.render('message',{message:"There was a problem finding the users.",usertype:usertype});
                res.render('userList', {users});
            })
        }
    })
});

// api/auth/addProduct
router.post('/addProduct', function (req, res) {
    //verify token
    const token = localStorage.getItem('authtoken');
    if (!token) return res.render('message',{message: 'No token provided.',usertype:'Normal'});
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.render('message',{message: 'Failed to authenticate token.',usertype:'Normal'});
        //check the type of user
        const usertype = decoded.type;
        if (usertype !== 'Admin') {
            return res.render('message',{message: 'No permission to the data.',usertype:usertype});
        } else {
            //add product
            let product = {
                id: req.body.id,
                product: req.body.product,
                data: req.body.data,
                price: req.body.price
            }

            console.log(product);
            //check if the id is used in db
            Product.findOne({id: product.id}, (err, data) => {
                if (err) {
                    return res.render('message',{message: "There was a problem happened in server.",usertype:usertype});
                }
                if (data) {
                    return res.render('message',{message:"The product ID already exists. Please input another ID.", usertype:usertype});
                } else {
                    Product.create(product, (err, data) => {
                        if (err) {
                            return res.render('message',{message:"There was a problem happened in server.", usertype:usertype});
                        } else {
                            return res.render('message',{message:'Product created successfully!', usertype:usertype});
                        }
                    });
                }
            });

        }
    });
});

module.exports = router;
