var express = require('express');
var router = express.Router();
const axios = require('axios');
const Survey = require('../../models/survey')
const config = require('../../../config.js');
const formidable = require('formidable');

//Routing for pages

router.get('/GDPR-tools', async function(req, res) {

    if(!req.isAuthenticated()){
        res.render('common/error', { status:  401, message: "You need to login to access this service", loggedUser: req.isAuthenticated() });
        return;
    }

    var surveys;
    var error = {};

    let url = req.protocol + '://' + req.get('host') + '/api/survey?stype=gdpr';

    await axios.get(url, { 
        headers: {
            "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";"
        } 
    })
    .then(res => { surveys = res.data.data })
    .catch(err => { error["status"] = err.response.status; error['error'] = err.response.statusText })


    var tmp = [], results = []
    const categories = 6;

    if(surveys){
        for (var i = 0; i < surveys.length; i++)
            tmp.push(parseResults(JSON.parse(surveys[i].data), categories));

        for (var i = 0; i < categories; i++) {
            let x = 0;
            for (var j = 0; j < tmp.length; j++) {
                x += parseFloat(tmp[j][i])
            }
            results.push((x / tmp.length).toFixed(2));
        }

        tmp = {}
        tmp['status'] = 200
        tmp['scores'] = results
        tmp['total'] = surveys.length

        res.render('survey/GDPR_tools', { data: tmp, loggedUser: req.isAuthenticated() });

    } else {
        console.log(error);
        res.render('survey/GDPR_tools', { data: error, loggedUser: req.isAuthenticated()  });
    }
})

router.post('/GDPR-result', async function(req, res) {

    if(req.isAuthenticated()){
        res.sendFile(config.VIEWS + '/survey/GDPR_result.ejs');
        return;
    }

    res.render('common/error', { status:  401, message: "You need to login to access this service", loggedUser: req.isAuthenticated() });
})

function parseResults(json, categories){
    var parseArr = [], count = [], isPositive = []

    for (var i = 0; i < categories; i++){
        parseArr[i] = 0;
        count[i] = 0;
        isPositive[i] = 0;
    } 

    for (const field in json) {
        var info = getFieldInfo(field);
        count[info['page']] += 1
        if(json[field] == 1)
            isPositive[info['page']] += 1
    }

    for (var i = 0; i < categories; i++) {
        parseArr[i] = ((isPositive[i] / count[i]) * 100).toFixed(2)
    }

    return parseArr;
}

function getFieldInfo(field){
    let values = field.split("f");
    values[0] = values[0].substring(1);
    return { "page" : parseInt(values[0]), "field": parseInt(values[1]) };
}

module.exports = router