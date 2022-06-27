const express = require('express');
const path = require("path");
const app = express();

//Routing
//app.use('/users', require('./users'));

app.set('views', path.join(require.main.path, './app/views/'));

app.get('/', function(req, res){
    res.render('home');
})

module.exports = app
