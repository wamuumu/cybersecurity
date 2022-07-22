var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    console.log(req.user);
    res.render('home', { loggedUser: req.isAuthenticated() });
})

router.get('/login', async function(req, res) {
    if(!req.isAuthenticated())
        res.render('login', { loggedUser: req.isAuthenticated() });
    else
        res.redirect('/');
})

router.get('/signin', async function(req, res) {
    if(!req.isAuthenticated())
        res.render('signin', { loggedUser: req.isAuthenticated() });
    else
        res.redirect('/');
})

router.get('/thesaurus', function(req, res){
    res.render('thesaurus', { loggedUser: req.isAuthenticated() })
})

router.get('/ontology', function(req, res){
    res.render('ontology', { loggedUser: req.isAuthenticated() })
})

module.exports = router
