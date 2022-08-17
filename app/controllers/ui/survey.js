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

    let url = req.protocol + '://' + req.get('host') + '/api/users/' + req.user.id + '/surveys?stype=GDPR';

    await axios.get(url, { 
        headers: {
            "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";"
        } 
    })
    .then(res => { surveys = res.data.surveys })
    .catch(err => { error["status"] = err.response.status; error['error'] = err.response.statusText })

    const categories = 6;

    if(surveys.length > 0){
        let survey = surveys[0]
        let results = parseResults(JSON.parse(survey.data), categories);

        res.render('survey/GDPR_tools', { data: { status: 200, scores: results, lastID: survey._id, date: survey.date }, loggedUser: req.isAuthenticated() });

    } else if(surveys.length == 0){
        res.render('survey/GDPR_tools', { data: { status: 201 }, loggedUser: req.isAuthenticated() });

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

    let url = req.protocol + '://' + req.get('host') + '/api/users/' + req.user.id + '/surveys?stype=SELF_ASSESSMENT';

    await axios.get(url, { 
        headers: {
            "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";"
        } 
    })
    .then(res => { surveys = res.data.surveys })
    .catch(err => { error["status"] = err.response.status; error['error'] = err.response.statusText })

    const categories = 8;

    const sectors = [
        { "value": 0.15, "text": "Governo / Militare / Logistica" },
        { "value": 0.14, "text": "Informazione e Comunicazione" },
        { "value": 0.130, "text": "Target multipli" },
        { "value": 0.131, "text": "Assistenza medica" },
        { "value": 0.09, "text": "Educazione" },
        { "value": 0.07, "text": "Servizi finanziari" },
        { "value": 0.039, "text": "Professionale / Scientifico / Tecnico" },
        { "value": 0.04, "text": "Vendita al dettaglio / all'ingrosso" },
        { "value": 0.041, "text": "Trasporto e Deposito" },
        { "value": 0.042, "text": "Produzione" },
        { "value": 0.029, "text": "News / Multimedia" },
        { "value": 0.030, "text": "Organizzazione" },
        { "value": 0.020, "text": "Energia e Gas" },
        { "value": 0.021, "text": "Arte / Intrattenimento" },
        { "value": 0.031, "text": "Altro" }
    ]

    if(surveys.length > 0){
        let survey = surveys[0]
        let risk = computeRisk(JSON.parse(survey.data), JSON.parse(survey.configuration))
        let sec = JSON.parse(survey.data).p0f0

        for (var i = 0; i < sectors.length; i++)
            if(sectors[i].value == sec){
                sec = sectors[i].text + " (rischio del " + (sectors[i].value * 100) + "%)"
                break;
            }

        let results = parseResults(risk, categories);

        res.render('survey/self_assessment', { data: { status: 200, scores: results, lastID: survey._id, date: survey.date, sector: sec }, loggedUser: req.isAuthenticated() });

    } else if(surveys.length == 0){
        res.render('survey/self_assessment', { data: { status: 201 }, loggedUser: req.isAuthenticated() });  

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

function computeRisk(json, configuration){
    let sectorMultiplier = 1;

    for (const key in json) {
        let info = getFieldInfo(key)

        if(info['page'] == 0 && info['field'] == 0)
            sectorMultiplier = json[key]
        else {
            let category = "category" + (info['page'] + 1)
            let id = json[key]
            let question = info['page'] == 0 ? info['field'].toString() : (info['field'] + 1).toString()
            
            if(configuration[category][question]['probability'] != undefined)
                if(Array.isArray(json[key]))
                    for (var i = 0; i < json[key].length; i++){
                        id = json[key][i]
                        json[key][i] = sectorMultiplier * configuration[category][question]['probability'][id]
                    }
                else{
                    if(category == "category8") //for malwares probabilities
                        json[key] = json[key] * sectorMultiplier * configuration[category][question]['probability']
                    else
                        json[key] = sectorMultiplier * configuration[category][question]['probability'][id]
                }

            if(configuration[category][question]['impact'] != undefined)
                if(Array.isArray(json[key]))
                    for (var i = 0; i < json[key].length; i++){
                        id = configuration[category][question]['impact'].length == 1 ? 0 : json[key][i]
                        json[key][i] = json[key][i] * configuration[category][question]['impact'][id]
                    }
                else{
                    if(category == "category8") //for malwares impacts
                        json[key] = json[key] * sectorMultiplier * configuration[category][question]['probability']
                    else{
                        id = configuration[category][question]['impact'].length == 1 ? 0 : json[key]
                        json[key] = json[key] * configuration[category][question]['impact'][id]
                    }
                }
        }
    }

    return json
}

function getFieldInfo(field){
    let values = field.split("f");
    values[0] = values[0].substring(1);
    return { "page" : parseInt(values[0]), "field": parseInt(values[1]) };
}

module.exports = router