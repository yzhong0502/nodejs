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
    if (localStorage.getItem('usertype')!=='Admin') {
        res.redirect('/index');
    } else {
        res.render('admin');
    }
})

router.get('/addUser', (req, res) => {
    //check if admin
    if (localStorage.getItem('usertype')!=='Admin') {
        res.redirect('/index');
    } else {
        res.render('addUser');
    }
})

router.get('/addProduct', (req, res) => {
    //check if admin
    if (localStorage.getItem('usertype')!=='Admin') {
        res.redirect('/index');
    } else {
        res.render('addProduct');
    }
})

 router.get('/logout', (req,res) => {
     localStorage.removeItem('authtoken');
     localStorage.removeItem('usertype');
     res.redirect('/index');
 })


module.exports = router;
