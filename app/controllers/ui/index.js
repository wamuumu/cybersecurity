const express = require('express');
const path = require("path");
const app = express();

//Views Path
app.set('views', path.join(require.main.path, './app/views/'));

//Routing

app.get('/', function(req, res){
    res.render('home');
})

app.use('/antimalware', require('./antimalware'));

app.use('/dga-detection', require('./dga'));

app.use('/cve-search', require('./cve'));

app.get('/thesaurus', function(req, res){
    res.render('thesaurus')
})

app.get('/ontology', function(req, res){
    res.render('ontology')
})

module.exports = app
