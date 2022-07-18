var express = require('express');
var router = express.Router();
const axios = require('axios');
const Survey = require('../../models/survey')
const config = require('../../../config.js');

//Routing for pages

router.get('/GDPR-tools', async function(req, res) {
    
    var surveys;
    var error = {};

    let url = req.protocol + '://' + req.get('host') + '/api/survey?stype=gdpr';

    await axios.get(url)
    .then(res => { surveys = res.data })
    .catch(err => { error['status'] = err.response.status; error['error'] = err.response.statusText })

    var tmp = [], results = []
    const categories = 6;

    if(surveys){
        for (var i = 0; i < surveys.data.length; i++)
            tmp.push(parseResults(JSON.parse(surveys.data[i].data), categories));

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
        tmp['total'] = surveys.data.length

        res.render('survey/GDPR_tools', { data: tmp });

    } else {
        console.log(error);
        res.render('survey/GDPR_tools', { data: error });
    }
})

router.get('/GDPR-result', async function(req, res) {
    res.sendFile(config.VIEWS + '/survey/gdpr_result.html');
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