//CONTROLLER PER LA GESTIONE DI DGA DETECTION

const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const {spawn} = require('child_process');
const path = require('path');

router.post('/', async function(req, res){

	let form = new formidable.IncomingForm();

	form.parse(req, async function (error, fields, files) {
		if(error){
			res.status(400).json({status: 400, message: error}) 
		} else {

			var python, dataToSend;
			let pyPath = path.resolve('./app/static/external/dga_detector');
			let fileName = files.filetoupload.originalFilename;
			let domain = fields.domain;
			let choice = fields.choice;

			if(choice == "file" && fileName != ""){
				let filePath = files.filetoupload.filepath;
				python = spawn('python', [pyPath + '/dga_detector.py', '-f', filePath, '-p', pyPath]);
			} else if (choice == "domain" && domain != ""){
				python = spawn('python', [pyPath + '/dga_detector.py', '-d', domain, '-p', pyPath]);
			} else {
				res.status(400).json({status: 400, message: "Missing fields or files"});
				return;
			}			

			python.stdout.on('data', function(data){
				dataToSend = data.toString();
			})

			python.on('exit', (code) => {
				console.log('DGA Dection Complete [Exit code: ' + code + ']');
				
				if(code != 0)
					res.status(400).json({status: 400, message: "Malformed input"});
				else
					res.status(200).json({status: 200, result: JSON.parse(dataToSend)});
			});
		}
	});
});

function isEmpty(obj) {
	return Object.keys(obj).length === 0 || obj == undefined;
}

module.exports = router