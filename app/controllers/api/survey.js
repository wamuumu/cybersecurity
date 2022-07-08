//CONTROLLER PER LA GESTIONE DEI DATI DEI QUESTIONARI

const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const Survey = require("../../models/survey")

router.post('/:id', async function(req, res){

	let form = new formidable.IncomingForm();

	form.parse(req, async function (error, fields, files) {
		if(error){
			console.error(error);
			res.status(400).json({status: 400, message: error}) 
		} else {
            
			var surveyID = -1;

            try{
		        var new_survey = new Survey({
		            type: fields.type,
		            data: JSON.stringify(fields.data)
		        });

		        let survey = await new_survey.save()
		        surveyID = survey._id.toString();
		    }catch (err) {
		        console.error('Error: ' + err);
		    	res.status(500).json({status: 500, message: "Error: " + err})
		    	return;
		    }

		    res.status(200).json({status: 200, surveyID: surveyID});
		}
	});
});


module.exports = router