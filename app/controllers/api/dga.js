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

			var python, dataToSend = [], fileName = "";
			let pyPath = path.resolve('./app/static/external/dga_detector');

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
					let parse = !isJsonString(data.toString()) ? JSON.parse(data.toString()) : data.toString();
					dataToSend.push(parse);
				})

				python.on('exit', (code) => {
					console.log('DGA Dection Complete');

					console.log(dataToSend)

					for (var i = 0; i < dataToSend.length; i++) {
						if(isJsonString(dataToSend[i]))
							dataToSend[i] = JSON.parse(dataToSend[i])
						if(dataToSend[i].exit_code != 0){
							let domain = dataToSend[i].domain
							let exit_code = dataToSend[i].exit_code
							dataToSend[i] = {}
							dataToSend[i].domain = domain
							
							switch(exit_code){
								case 1:
									dataToSend[i].error = "Tor domain skipped";
									break;

								case 2:
									dataToSend[i].error = "Localized domain skipped";
									break;

								case 3:
									dataToSend[i].error = "Short domain skipped";
									break;
							}
						}
					}
					
					console.log(dataToSend);
						
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