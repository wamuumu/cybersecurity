
//CONTROLLER PER LA GESTIONE DI DGA DETECTION

const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');
const auth = require('../../middlewares/auth');
const dgadetective = require('dgadetective');
const readline = require('readline');

const tfjs = require('@tensorflow/tfjs-node');
const tldjs = require('tldjs');
const axios = require('axios');

router.post('/', auth, async function(req, res){

	let form = new formidable.IncomingForm();

	form.parse(req, async function (error, fields, files) {
		if(error){
			console.error(error.name + ": " + error.message);
			res.status(400).json({status: 400, message: error.name + ": " + error.message}) 
		} else {

			let choice = fields.choice;
			let domain = fields.domain;

			const tfjsURL = req.protocol + "://" + req.get('host') + "/static/tfjs";
			
			var score = 0, bound = 80, results = []	

			const EXP = parseFloat(fields.coeff1) || 0.2
			const DET = parseFloat(fields.coeff2) || 0.4
			const PER = parseFloat(fields.coeff3) || 0.4

			if((EXP + DET + PER).toFixed(2) != 1){
				console.error("Bad coefficients - the sum of those must be 1. Get [" + EXP + ", " + DET + ", " + PER + "]");
				return res.status(400).json({status: 400, message: "Bad coefficients - the sum of those must be 1. Get [" + EXP + ", " + DET + ", " + PER + "]"});
			}

			var fileName = "", mimetype = ""
			if(!isEmpty(files) && files.filetoupload && choice == "file"){
				mimetype = files.filetoupload.mimetype;
				fileName = files.filetoupload.originalFilename;
			}


			if(choice == "file" && fileName != "" && mimetype == "text/plain"){

				let exp0seAlg = exp_parse(choice, files, domain)

				let filePath = files.filetoupload.filepath;

				var values = ""
				const rl = readline.createInterface({
					input: fs.createReadStream(filePath)
				});

				for await (const line of rl) {
			  		values += line + "---";
				}

				let urls = values.split("---");
				urls.pop();

				for (var i = 0; i < urls.length; i++) {

					if(urls[i] != ""){
						let personalAlg = await detect(tfjsURL, urls[i]) == true ? 1 : 0
						let exp0seVal = exp0seAlg[i]['is_dga'] == true ? 1 : 0

						await dgadetective.checkDGA(urls[i])
						.then(function(result){ 
							score = result;
						}, function(err) {
							console.error(err);
						});

						let dga_det = score >= bound ? 1 : 0;

						console.log(urls[i], personalAlg, exp0seVal, dga_det)

						var count = 0
						if(personalAlg == 1) count++;
						if(exp0seVal == 1) count++;
						if(dga_det == 1) count++;

						let dga = (PER * personalAlg) + (EXP * exp0seVal) + (DET * dga_det) >= 0.5
				    	
				    	results.push({'domain': urls[i], 'is_dga': dga, 'detected_by_engine': count})
				    }
				}

				return res.status(200).json({status: 200, engines_count: 3, data: results})

			}else if(choice == "domain" && domain != "" && domain != undefined){

				let personalAlg = await detect(tfjsURL, domain) == true ? 1 : 0
				let exp0seAlg = exp_parse(choice, files, domain)[0]['is_dga'] == true ? 1 : 0

				await dgadetective.checkDGA(domain)
					.then(function(result){ 
						score = result
					}, function(err) {
						console.error(err);
					});

				let dga_det = score >= bound ? 1 : 0;

				var count = 0
				if(personalAlg == 1) count++;
				if(exp0seAlg == 1) count++;
				if(dga_det == 1) count++;

				let dga = (PER * personalAlg) + (EXP * exp0seAlg) + (DET * dga_det) >= 0.5

				results.push({ 'domain': domain, 'is_dga': dga, 'detected_by_engine': count})

				return res.status(200).json({status: 200, engines_count: 3, data: results})

			}else{
				console.error("Missing fields or files");
				return res.status(404).json({status: 404, message: "Missing fields or files"});
			}

		}
	});
});

function isEmpty(obj) {
	return Object.keys(obj).length === 0 || obj == undefined;
}

function computeEncoding(domains){

	maxlen = -1
	validators = {}
	count = 1

	for (const [key, value] of Object.entries(domains)) {

		maxlen = key.length > maxlen ? key.length : maxlen

		for (var i = 0; i < key.length; i++) {
			if(!validators.hasOwnProperty(key[i].toLowerCase())){
				validators[key[i].toLowerCase()] = count
				count++;
			}
		}
	}

	return [validators, maxlen]
}

function pad_sequences(validators, maxlen, domain){

	parse = tldjs.parse(domain)

	if(parse.publicSuffix != null && domain != null)
		try { domain = parse.domain.replace('.'+parse.publicSuffix, '') }
		catch(e) { }

	domain = domain.toLowerCase()
	//console.log(domain)

	var sequence = []
	sequence[0] = []

	for (var i = 0; i < domain.length; i++)
		if(validators.hasOwnProperty(domain[i]))
			sequence[0].push(validators[domain[i]])
		else
			return null;

	var new_sequence = sequence.map(function(e) {
		const max_length = maxlen
		const row_length = e.length 
		
		if (row_length > max_length){ // truncate
			return e.slice(row_length - max_length, row_length)
		}
		else if (row_length < max_length){ // pad
			return Array(max_length - row_length).fill(0).concat(e);
		}
		return e;
	});

	return new_sequence;
}

async function detect(tfjsURL, domain){

	const model = await tfjs.loadLayersModel(tfjsURL + '/cisco_dm/model.json');
	var domains = {}

    await axios.get(tfjsURL + '/domains.json')
    .then(res => domains = res.data)
    .catch(err => console.error(err))

    var encoding = computeEncoding(domains)

    let seq = pad_sequences(encoding[0], encoding[1], domain)

    if(seq != null){
        const ten = model.predict(tfjs.tensor2d(seq))
        //console.log(ten.arraySync()[0][0])
        const predictedValue = ten.arraySync()[0][0] > 0.5 ? true : false;

        return predictedValue;
	}

	return null;
}

function exp_parse(choice, files, domain){
	var python, dataToSend = "", results = []
	pyPath = path.resolve('./app/libraries/exp0se_dga_detector')

	try{
		if(choice == "file"){
			let filePath = files.filetoupload.filepath;
			python = execSync("python " + pyPath + "/dga_detector.py -f " + filePath + " -p " + pyPath)
		} else if (choice == "domain" && domain != "" && domain != undefined){

			python = execSync("python " + pyPath + "/dga_detector.py -d " + domain + " -p " + pyPath)
		}

		dataToSend = python.toString()

		results = dataToSend.split("---")
		results.pop();

		for (var i = 0; i < results.length; i++)
			if(isJsonString(results[i]))
				results[i] = JSON.parse(results[i])

	} catch(e) {
		results.push({'is_dga': false})
	}

	return results;
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