const express = require('express');
const path = require("path");
const app = express();

//Views Path
app.set('views', path.join(require.main.path, './app/views/'));

//Routing
app.use('/antimalware', require('./antimalware'));

app.get('/', function(req, res){
    res.render('home');
})

module.exports = app
