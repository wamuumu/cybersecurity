var express = require('express');
var router = express.Router();
const axios = require('axios');
const Survey = require('../../models/survey')
const config = require('../../../config.js');
const formidable = require('formidable');

//Routing for pages

router.get('/GDPR-tools', async function(req, res) {

    if(!req.isAuthenticated()){
        let data = { status: 401, message: "Devi autenticarti prima di usare il servizio" }
        res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
        return;
    }

    var surveys;
    var error = {};

    let url = req.protocol + '://' + req.get('host') + '/api/users/' + req.user.id + '/surveys?stype=GDPR';

    await axios.get(url, { 
        headers: {
            "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";"
        } 
    })
    .then(res => { surveys = res.data.surveys })
    .catch(err => { error["status"] = err.response.status; error['message'] = err.response.statusText })


    if(surveys.length > 0)
        res.render('survey/GDPR_tools', { data: { status: 200, last: surveys[0] }, loggedUser: req.isAuthenticated() });
    else if(surveys.length == 0)
        res.render('survey/GDPR_tools', { data: { status: 201 }, loggedUser: req.isAuthenticated() });
    else {
        console.log(error);
        res.render('survey/GDPR_tools', { data: error, loggedUser: req.isAuthenticated()  });
    }
})

router.post('/GDPR-result', async function(req, res) {

    if(req.isAuthenticated()){
        res.sendFile(config.VIEWS + '/survey/GDPR_result.ejs');
        return;
    }

    let data = { status: 401, message: "Devi autenticarti prima di usare il servizio" }
    res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
})

router.get('/self-assessment', async function(req, res) {

    if(!req.isAuthenticated()){
        let data = { status: 401, message: "Devi autenticarti prima di usare il servizio" }
        res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
        return;
    }

    var surveys;
    var error = {};

    let url = req.protocol + '://' + req.get('host') + '/api/users/' + req.user.id + '/surveys?stype=SELF_ASSESSMENT';

    await axios.get(url, { 
        headers: {
            "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";"
        } 
    })
    .then(res => { surveys = res.data.surveys })
    .catch(err => { error["status"] = err.response.status; error['message'] = err.response.statusText })

    if(surveys.length > 0)
        res.render('survey/self_assessment', { data: { status: 200, last: surveys[0] }, loggedUser: req.isAuthenticated() });
    else if(surveys.length == 0)
        res.render('survey/self_assessment', { data: { status: 201 }, loggedUser: req.isAuthenticated() });  
    else {
        console.log(error);
        res.render('survey/self_assessment', { data: error, loggedUser: req.isAuthenticated()  });
    }
})

router.post('/self-assessment-result', async function(req, res) {

    if(req.isAuthenticated()){
        res.sendFile(config.VIEWS + '/survey/self_assessment_result.ejs');
        return;
    }

    let data = { status: 401, message: "Devi autenticarti prima di usare il servizio" }
    res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
})

module.exports = router