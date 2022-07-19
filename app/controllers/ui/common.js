var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    res.render('home');
})

router.get('/login', async function(req, res) {
    res.render('login');
})

router.get('/signin', async function(req, res) {
    res.render('signin');
})

router.get('/thesaurus', function(req, res){
    res.render('thesaurus')
})

router.get('/ontology', function(req, res){
    res.render('ontology')
})

module.exports = router
