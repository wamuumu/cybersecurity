var express = require('express');
var router = express.Router();
const axios = require('axios');
const Survey = require('../../models/survey')

//Routing for pages

router.get('/GDPR-tools', async function(req, res) {
    let surveyID = await getSurveyID("gdpr");
    res.render('survey/GDPR_tools', {surveyID: surveyID});
})

async function getSurveyID(stype){

    var surveyID = -1;

    try{
        var new_survey = new Survey({
            type: stype,
            data: ""
        });

        let survey = await new_survey.save()
        surveyID = survey._id.toString();
    }catch (err) {
        console.log('err' + err);
    }

    return surveyID;
}

module.exports = router