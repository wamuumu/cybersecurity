var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    let loggedUser = req.user != null ? true : false;
    res.render('home', { loggedUser: loggedUser });
})

router.get('/login', async function(req, res) {
    let loggedUser = req.user != null ? true : false;
    if(!loggedUser)
        res.render('login', { loggedUser: loggedUser });
    else
        res.redirect('/');
})

router.get('/signin', async function(req, res) {
    let loggedUser = req.user != null ? true : false;
    if(!loggedUser)
        res.render('signin', { loggedUser: loggedUser });
    else
        res.redirect('/');
})

router.get('/thesaurus', function(req, res){
    let loggedUser = req.user != null ? true : false;
    res.render('thesaurus', { loggedUser: loggedUser })
})

router.get('/ontology', function(req, res){
    let loggedUser = req.user != null ? true : false;
    res.render('ontology', { loggedUser: loggedUser })
})

module.exports = router
