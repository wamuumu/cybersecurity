//CONTROLLER PER LA GESTIONE DEI DATI DEI QUESTIONARI

const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const Survey = require("../../models/survey")
const auth = require('../../middlewares/auth');
const is_admin = require('../../middlewares/is_admin');

router.get('/', auth, async function(req, res){

	let typeFilter = req.query.stype != undefined ? { type: req.query.stype } : {}

	Survey.find(typeFilter)
    .then(surveys => { res.status(200).json({status: 200, data: surveys}) })
    .catch(err => {
    	console.error(err.name + ": " + err.message);
        res.status(500).json({status: 500, message: err.name + ": " + err.message})
    })

});

router.get('/:type/:id', auth, async function(req, res){

	let type = req.params.type == "gdpr" ? "GDPR" : "SELF_ASSESSMENT";

	Survey.findOne({_id: req.params.id, type: type})
    .then(survey => {
        if(!survey)
            res.status(404).json({status: 404, message: "Survey not found"})
        else {
            if(survey.toObject)
                survey = survey.toObject();
            if("__v" in survey) delete survey.__v;

            if(req.user.id != survey.user){
            	res.status(401).json({status: 401, message: "Unauthorized"})
            	return;
            }

            res.status(200).json({status: 200, survey: survey})
        }
    })
    .catch(err => {
    	console.error(err);
        res.status(500).json({status: 500, message: err.name + ": " + err.message})
    })
});


router.post('/', auth, async function(req, res){

	let form = new formidable.IncomingForm();

	form.parse(req, async function (error, fields, files) {
		if(error){
			console.error(error.name + ": " + error.message);
			res.status(400).json({status: 400, message: error.name + ": " + error.message}) 
		} else {
            
			if(!fields.data || !fields.type){
                res.status(400).json({status: 400, message: "Empty Fields Error: missing or invalid fields"})
                return;
            } 

			var surveyID = -1;
			let date = new Date();
			let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
			let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
			let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()

			let time = hours + ":" + minutes + ":" + seconds

            try{
		        var new_survey = new Survey({
		            type: fields.type,
		            configuration: JSON.stringify(fields.configuration),
		            data: JSON.stringify(fields.data),
		            user: req.user.id,
		            date: date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " | " + time
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