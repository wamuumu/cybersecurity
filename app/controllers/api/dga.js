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
			console.error(error);
			res.status(400).json({status: 400, message: error}) 
		} else {

			var python, dataToSend = "", fileName = "";
			let pyPath = path.resolve('./app/libraries/dga_detector');

			if(!isEmpty(files))
				fileName = files.filetoupload.originalFilename;
			let domain = fields.domain;
			let choice = fields.choice;
			var status = 200;

			if(choice == "file" && fileName != ""){
				let filePath = files.filetoupload.filepath;
				python = spawn('python', [pyPath + '/dga_detector.py', '-f', filePath, '-p', pyPath]);
			} else if (choice == "domain" && domain != ""){
				python = spawn('python', [pyPath + '/dga_detector.py', '-d', domain, '-p', pyPath]);
			} else {
				status = 400;
				console.error("Missing fields or files");
				res.status(status).json({status: status, message: "Missing fields or files"});
			}			

			if(status == 200){
				python.stdout.on('data', function(data){
					dataToSend += data.toString().replace(/\r\n/, "")
				})

				python.on('exit', (code) => {
					console.log('DGA Dection Complete');

					let results = dataToSend.split("---")

					results.pop();

					for (var i = 0; i < results.length; i++) {
						if(isJsonString(results[i]))
							results[i] = JSON.parse(results[i])
						
						if(results[i].exit_code != 0){
							
							switch(results[i].exit_code){
								case 1:
									results[i].error = "Tor domain skipped";
									break;

								case 2:
									results[i].error = "Localized domain skipped";
									break;

								case 3:
									results[i].error = "Short domain skipped";
									break;
							}
						}
					}

					res.status(200).json({status: 200, data: results});
						
				});
			}
		}
	});
});

function isEmpty(obj) {
	return Object.keys(obj).length === 0 || obj == undefined;
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = router