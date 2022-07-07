//CONTROLLER PER LA GESTIONE DEI DATI DEI QUESTIONARI

const express = require('express');
const router = express.Router();
const formidable = require('formidable');

router.post('/gdpr', async function(req, res){
	let form = new formidable.IncomingForm();

	form.parse(req, async function (error, fields, files) {
		if(error){
			console.error(error);
			res.status(400).json({status: 400, message: error}) 
		} else {
			console.log(fields)
			res.status(200).json({status: 200, message: fields}) 
		}
	});
});

router.post('/self', async function(req, res){

});


module.exports = router