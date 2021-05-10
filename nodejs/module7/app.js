const express = require('express');
const app = express();
const db = require('./db');

//app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');
app.set('views', './views');

const UserController = require('./controllers/UserController');
app.use('/', UserController);

const AuthController = require('./controllers/AuthController');
app.use('/api/auth', AuthController);

module.exports = app;
