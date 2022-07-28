var express = require('express');
var router = express.Router();
const axios = require('axios');
const Survey = require('../../models/survey')
const config = require('../../../config.js');
const formidable = require('formidable');

//Routing for pages

router.get('/GDPR-tools', async function(req, res) {

    if(!req.isAuthenticated()){
        let data = { status: 401, message: "You need to login to access this service" }
        res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
        return;
    }

    var surveys;
    var error = {};

    let url = req.protocol + '://' + req.get('host') + '/api/survey?stype=GDPR';

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

    let data = { status: 401, message: "You need to login to access this service" }
    res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
})

router.get('/self-assessment', async function(req, res) {

    if(!req.isAuthenticated()){
        let data = { status: 401, message: "You need to login to access this service" }
        res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
        return;
    }

    var surveys;
    var error = {};

    let url = req.protocol + '://' + req.get('host') + '/api/survey?stype=SELF_ASSESSMENT';

    await axios.get(url, { 
        headers: {
            "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";"
        } 
    })
    .then(res => { surveys = res.data.data })
    .catch(err => { error["status"] = err.response.status; error['error'] = err.response.statusText })


    var tmp = [], results = []
    const categories = 8;

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

        res.render('survey/self_assessment', { data: tmp, loggedUser: req.isAuthenticated() });

    } else {
        console.log(error);
        res.render('survey/self_assessment', { data: error, loggedUser: req.isAuthenticated()  });
    }
})

router.post('/self-assessment-result', async function(req, res) {

    if(req.isAuthenticated()){
        res.sendFile(config.VIEWS + '/survey/self_assessment_result.ejs');
        return;
    }

    let data = { status: 401, message: "You need to login to access this service" }
    res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
})

function parseResults(json, categories){
    var parseArr = [], count = [], sum = []

    for (var i = 0; i < categories; i++){
        parseArr[i] = 0;
        count[i] = 0;
        sum[i] = 0;
    } 

    for (const field in json) {
        var info = getFieldInfo(field);
        if(Array.isArray(json[field])){
            count[info['page']] += json[field].length
            for (var i = 0; i < json[field].length; i++){
                if(json[field][i] == "none" && info['page'] == 4 && (info['field'] == 0 || info['field'] == 3)) 
                    json[field][i] = 1;
                else if(json[field][i] == "none" && info['page'] == 4 && info['field'] == 0)
                    json[field][i] = 0;
                sum[info['page']] += parseFloat(json[field][i])
            }

            if((info['page'] == 4 && (info['field'] == 0 || info['field'] == 2 || info['field'] == 3)) || (info['page'] == 6 && info['field'] == 1))
                sum[info['page']] = Math.abs(sum[info['page']] - 1);
        }
        else if(json[field] != -1){
            count[info['page']] += 1
            sum[info['page']] += json[field]
        }
    }

    for (var i = 0; i < categories; i++) {
        let perc = (sum[i] / count[i]) > 1 ? 1 : (sum[i] / count[i]);
        parseArr[i] = (perc * 100).toFixed(2)
    }

    return parseArr;
}

function getFieldInfo(field){
    let values = field.split("f");
    values[0] = values[0].substring(1);
    return { "page" : parseInt(values[0]), "field": parseInt(values[1]) };
}

module.exports = router