const express = require('express');
const path = require("path");
const app = express();

//Views Path
app.set('views', path.join(require.main.path, './app/views/'));

//Routing

app.get('/', function(req, res){
    res.render('home');
})

app.get('/antimalware', function(req, res){
    res.render('antimalware')
})

app.get('/dga-detection', function(req, res){
    res.render('dga')
})

app.get('/thesaurus', function(req, res){
    res.render('thesaurus')
})

app.get('/ontology', function(req, res){
    res.render('ontology')
})

module.exports = app
