const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const LocalStorage = require('node-localstorage').LocalStorage;
const config = require('../config.js');
const jwt = require('jsonwebtoken');
localStorage = new LocalStorage('./scratch');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const User = require('../models/user');

router.get('/admin', (req, res) => {
    //check if admin
    console.log(localStorage.getItem('usertype')!=='Admin');
    if (localStorage.getItem('usertype')!=='Admin') {
        res.redirect('/index');
    } else {
        res.render('admin');
    }
})

router.get('/login',(req,res) => {
    res.render('login');
})

router.get('/register',(req,res) => {
    res.render('register');
})

router.get('/addUser', (req, res) => {
    //check if admin
    if (localStorage.getItem('usertype')!=='Admin') {
        res.redirect('/index');
    } else {
        res.render('addUser');
    }
})


 router.get('/logout', (req,res) => {
     localStorage.removeItem('authtoken');
     localStorage.removeItem('usertype');
     res.redirect('/index');
 })


module.exports = router;
