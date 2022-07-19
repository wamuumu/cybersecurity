//CONTROLLER PER LA GESTIONE DEI DATI DEI QUESTIONARI

const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const Survey = require("../../models/survey")

router.get('/', async function(req, res){

	let typeFilter = req.query.stype != undefined ? { type: req.query.stype } : {}

	Survey.find(typeFilter)
    .then(surveys => { res.status(200).json({status: 200, data: surveys}) })
    .catch(err => {
    	console.error(err);
        res.status(500).json({status: 500, message: err.name + ": " + err.message})
    })

});

router.get('/:id', async function(req, res){

	Survey.findOne({_id: req.params.id})
    .then(survey => {
        if(!survey)
            res.status(404).json({status: 404, message: "Survey not found"})
        else {
            if(survey.toObject)
                survey = survey.toObject();
            if("__v" in survey) delete survey.__v;
            res.status(200).json({status: 200, survey: survey})
        }
    })
    .catch(err => {
    	console.error(err);
        res.status(500).json({status: 500, message: err.name + ": " + err.message})
    })
});


router.post('/', async function(req, res){

	let form = new formidable.IncomingForm();

	form.parse(req, async function (error, fields, files) {
		if(error){
			console.error(error);
			res.status(400).json({status: 400, message: error}) 
		} else {
            
			var surveyID = -1;
			let date = new Date();

            try{
		        var new_survey = new Survey({
		            type: fields.type,
		            data: JSON.stringify(fields.data),
		            user: fields.user,
		            date: date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
		        });

		        let survey = await new_survey.save()
		        surveyID = survey._id.toString();
		    }catch (err) {
		        console.error("Internal server error: cannot add new survey");
		    	res.status(500).json({status: 500, message: "Internal server error: cannot add new survey"})
		    	return;
		    }

		    res.status(200).json({status: 200, surveyID: surveyID});
		}
	});
});


module.exports = router