var express = require('express');
var router = express.Router();
const axios = require('axios');
const config = require('../../../config.js');


router.get('/', function(req, res){
    //console.log(req.user);
    res.render('home', { loggedUser: req.isAuthenticated() });
})

router.get('/login', async function(req, res) {

    if(!req.isAuthenticated())
        res.render('login', { loggedUser: req.isAuthenticated(), site_key: config.SITE_KEY });
    else
        res.redirect('/');
})

router.get('/signin', async function(req, res) {
    if(!req.isAuthenticated())
        res.render('signin', { loggedUser: req.isAuthenticated(), site_key: config.SITE_KEY });
    else
        res.redirect('/');
})

router.get('/profile', async function(req, res) {

    if(!req.isAuthenticated()){
        let data = { status: 401, message: "You need to login to see your profile" }
        res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
    }
    else{

        var data = {};
        let url = req.protocol + '://' + req.get('host') + '/api/users/' + req.user._id + '/surveys';

        await axios.get(url, {
            headers: {
                "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";"
            }
        })
        .then(res => data = res.data.surveys)
        .catch(err => { data['status'] = err.response.status; data['error'] = err.response.statusText })

        res.render('profile', { loggedUser: req.isAuthenticated(), user: req.user, surveys: data });
    }
})

router.get('/thesaurus', function(req, res){
    res.render('thesaurus', { loggedUser: req.isAuthenticated() })
})

router.get('/ontology', function(req, res){
    res.render('ontology', { loggedUser: req.isAuthenticated() })
})

module.exports = router
