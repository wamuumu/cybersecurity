//CONTROLLER PER LA GESTIONE DELLA RICERCA DI CVE

const express = require('express');
const router = express.Router();
const axios = require('axios');
const formidable = require('formidable');
const auth = require('../../middlewares/auth');

//GET all CVE
router.post('/cve', auth, async function(req, res){
	
	let form = new formidable.IncomingForm();

	form.parse(req, async function (error, fields, files) {

		if(error){
			console.error(error.name + ": " + error.message);
			res.status(400).json({status: 400, message: error.name + ": " + error.message}) 
		} else {

			const CVE_LIMIT = fields.limit || 50;
			const CVE_SKIP = fields.skip * CVE_LIMIT || 0;
			const CVE_TIMETYPE = fields.timetype || "";
			const CVE_TIME = fields.time || "";
			const CVE_START_DATE = fields.start || "";
			const CVE_END_DATE = fields.end || "";
			const CVE_CVSS_VERSION = fields.version || "V3";
			const CVE_CVSS_SELECT = fields.cvsstype || "";
			const CVE_CVSS_SCORE = fields.score || "";
			const CVE_REJECTED = fields.rejected || "";
			var CVE_SEARCH = fields.search != undefined ? fields.search.trim() : "";

			var data, options;

			var status = 200, text = "";

			if(!CVE_SEARCH){
				options = {
				  	method: 'GET',
				  	url: 'https://cvepremium.circl.lu/api/query',
				  	headers: {
				  		Accept: 'application/json',
				  		limit: CVE_LIMIT,
				  		skip: CVE_SKIP,
				  		timeTypeSelect: CVE_TIMETYPE,
				  		timeSelect: CVE_TIME,
				  		startDate: CVE_START_DATE,
				  		endDate: CVE_END_DATE,
				  		cvssVersion: CVE_CVSS_VERSION,
				  		cvssSelect: CVE_CVSS_SELECT,
				  		cvss: CVE_CVSS_SCORE,
				  		rejected: CVE_REJECTED
				  	}
				};

			} else {
				var payload;

				if(!isNaN(CVE_SEARCH)){
					CVE_SEARCH = parseFloat(CVE_SEARCH);
					if(CVE_SEARCH > 0.0 && CVE_SEARCH <= 10.0)
						payload = [
								{
									"retrieve": "cves",
									"dict_filter": {
										"cvss": CVE_SEARCH
									},
									"query_filter": {
										"id": 1,
										"cvss": 1,
										"cvss3": 1,
										"summary": 1,
										"Modified": 1,
										"Published": 1
									}
								},
								{
									"retrieve": "cves",
									"dict_filter": {
										"cvss3": CVE_SEARCH
									},
									"query_filter": {
										"id": 1,
										"cvss": 1,
										"cvss3": 1,
										"summary": 1,
										"Modified": 1,
										"Published": 1
									}
								}
							]
				} else {
					payload = [
							{
								"retrieve": "cves",
								"dict_filter": {
									"id": {"$regex": ".*" + CVE_SEARCH + ".*"}
								},
								"query_filter": {
									"id": 1,
									"cvss": 1,
									"cvss3": 1,
									"summary": 1,
									"Modified": 1,
									"Published": 1
								}
							},
							{
								"retrieve": "cves",
								"dict_filter": {
									"$or": [
										{ "summary": { "$regex": ".*" + CVE_SEARCH + ".*"}},
										{ "summary": { "$regex": ".*" + CVE_SEARCH.toLowerCase() + ".*"}},
										{ "summary": { "$regex": ".*" + CVE_SEARCH.toUpperCase() + ".*"}},
										{ "summary": { "$regex": ".*" + (CVE_SEARCH.charAt(0).toUpperCase() + CVE_SEARCH.slice(1)) + ".*"}}
									]
								},
								"query_filter": {
									"id": 1,
									"cvss": 1,
									"cvss3": 1,
									"summary": 1,
									"Modified": 1,
									"Published": 1
								}
							},
							{
								"retrieve": "cves",
								"dict_filter": {
									"Modified": { "$gte": unformatDate(CVE_SEARCH) + "T00:00:00", "$lte": unformatDate(CVE_SEARCH) + "T23:59:59"}
								},
								"query_filter": {
									"id": 1,
									"cvss": 1,
									"cvss3": 1,
									"summary": 1,
									"Modified": 1,
									"Published": 1
								}
							},
							{
								"retrieve": "cves",
								"dict_filter": {
									"Published": { "$gte": unformatDate(CVE_SEARCH) + "T00:00:00", "$lte": unformatDate(CVE_SEARCH) + "T23:59:59"}
								},
								"query_filter": {
									"id": 1,
									"cvss": 1,
									"cvss3": 1,
									"summary": 1,
									"Modified": 1,
									"Published": 1
								}
							}
						]
				}

				options = {
					method: 'POST',
					url: 'https://cvepremium.circl.lu/api/query',
					params: {'format': 'json'},
					data: payload
				}
			}

			await axios.request(options)
			.then(res => data = res.data)
			.catch(err => { status = err.response.status; text = err.response.statusText;});

			if(CVE_SEARCH){
				var tmp = []

				if(data != undefined){
					for (var i = 0; i < data.length; i++) {
						if(data[i].data != undefined){ 
							for (var j = 0; j < data[i].data.length; j++) {
								
								var exist = false
								
								for (var k = 0; k < tmp.length; k++) {
									if(tmp[k].id == data[i].data[j].id){
										exist = true;
										break;
									}
								}

								if(!exist){
									data[i].data[j].updated = formatDate(data[i].data[j].Modified != undefined ? data[i].data[j].Modified : "")
									data[i].data[j].Modified = undefined
									data[i].data[j].published = formatDate(data[i].data[j].Published != undefined ? data[i].data[j].Published : "")
									data[i].data[j].Published = undefined
									data[i].data[j]._id = undefined
									tmp.push(data[i].data[j])	
								}
							}
						}
					}
				}

				data = {}
				data.results = tmp.slice(CVE_SKIP, CVE_SKIP + CVE_LIMIT)
				data.total = tmp.length
			}

			var results = []

			if(status == 200){

				if(!CVE_SEARCH){
					for (var i = 0; i < data.results.length; i++) {
						let item = {}
						item['id'] = data.results[i].id != undefined ? data.results[i].id : "-"
						item['cvss'] = data.results[i].cvss != undefined ? data.results[i].cvss : "-"
						item['cvss3'] = data.results[i].cvss3 != undefined ? data.results[i].cvss3 : "-"
						item['summary'] = data.results[i].summary != undefined ? data.results[i].summary : "-"
						item['updated'] = formatDate(data.results[i].Modified != undefined ? data.results[i].Modified : "")
						item['published'] = formatDate(data.results[i].Published != undefined ? data.results[i].Published : "")

						results.push(item);
				 	}

				 	data.results = results;
			 	}

				res.status(status).json({status: status, data: data});
			} else
				res.status(status).json({status: status, message: text});
		}
	});
});

//GET specific CVE by ID

router.get('/cve/:id', auth, async function(req, res){

	var data;

	var options = {
	  	method: 'GET',
	  	url: 'https://cvepremium.circl.lu/api/cve/' + req.params.id,
	  	headers: {Accept: 'application/json'}
	};

	var status = 200, text = "";

	await axios.request(options)
	.then(res => data = res.data)
	.catch(err => { status = err.response.status; text = err.response.statusText });

	var result = {}

	if(status == 200){
		result['id'] = req.params.id
		result['summary'] = data.summary != undefined ? data.summary : "-"
		result['updated'] = formatDate(data.Modified != undefined ? data.Modified : "-")
		result['published'] = formatDate(data.Published != undefined ? data.Published : "-")
		result['references'] = data.references != undefined ? data.references : "-"
		result['vulnerable_configuration'] = []
		result['capec'] = []

		let cweID = data.cwe.split("-")[1]
		let cwe = {}

		if(!isNaN(cweID)){
			options = {
			  	method: 'GET',
			  	url: 'https://cvepremium.circl.lu/api/cwe/' + cweID,
			  	headers: {Accept: 'application/json'}
			};

			await axios.request(options)
			.then(res => cwe = res.data)
			.catch(err => { console.error("Failed to get cwe " + cweID) });


			result['cwe'] = {
				"id": "CWE-" + cweID,
				"name": cwe.name,
				"status": cwe.status,
				"category": cwe.weaknessabs,
				"description": cwe.Description
			}

		} else
			result['cwe'] = "Unknown"

		result['cvss'] = data.cvss != undefined ? data.cvss : "NONE"
		result['impactScore'] = data.impactScore != undefined ? data.impactScore : "-"
		result['exploitabilityScore'] = data.exploitabilityScore != undefined ? data.exploitabilityScore : "-"
		result['access'] = data.access != undefined ? data.access : {}
		result['impact'] = data.impact != undefined ? data.impact : {}
		
		if(data.cvss3 == undefined)
			result['cvss3'] = "NONE"
		else{
			result['cvss3'] = data.cvss3
			result['impactScore3'] = data.impactScore3 != undefined ? data.impactScore3 : "-"
			result['exploitabilityScore3'] = data.exploitabilityScore3 != undefined ? data.exploitabilityScore3 : "-"
			result['access3'] = data.exploitability3 != undefined ? data.exploitability3 : {}
			result['impact3'] = data.impact3 != undefined ? data.impact3 : {}
		}

		if(data.vulnerable_configuration != undefined)
			for (var i = 0; i < data.vulnerable_configuration.length; i++)
				result['vulnerable_configuration'].push(data.vulnerable_configuration[i].title)

		if(data.capec != undefined)
			for (var i = 0; i < data.capec.length; i++){
				var cap = {};
				cap['name'] = data.capec[i].name != undefined ? data.capec[i].name : "-"
				cap['description'] = data.capec[i].summary != undefined ? data.capec[i].summary : "-"
				result['capec'].push(cap)
			}
		else
			result['capec'] = 'NONE'

		res.status(status).json({status: status, data: result});
	} else
		res.status(status).json({status: status, message: text});
});

//GET all vendors
router.post('/vendors', async function(req, res){

	let form = new formidable.IncomingForm();

	form.parse(req, async function (error, fields, files) {

		if(error){
			console.error(error.name + ": " + error.message);
			res.status(400).json({status: 400, message: error.name + ": " + error.message}) 
		} else {

			const VENDORS_LIMIT = fields.limit || 50;
			const VENDORS_SKIP = fields.skip * VENDORS_LIMIT || 0;
			var VENDORS_SEARCH = fields.search.toLowerCase().trim() || "";
			
			var data;

			const options = {
			  	method: 'GET',
			  	url: 'https://cvepremium.circl.lu/api/browse',
			  	headers: {Accept: 'application/json'}
			};

			var status = 200, text = "";

			await axios.request(options)
			.then(res => data = res.data.vendor)
			.catch(err => { status = err.response.status; text = err.response.statusText });

			data.shift() //removes first vendor who's not a real vendor

			if(VENDORS_SEARCH)
				data = data.filter(vendor => vendor.toLowerCase().includes(VENDORS_SEARCH));

			let total = data.length

			let results = {
				"vendors": data.slice(VENDORS_SKIP, VENDORS_SKIP + VENDORS_LIMIT),
				"total": total
			}

			if(status == 200)
				res.status(status).json({status: status, data: results});
			else
				res.status(status).json({status: status, message: text});
		}
	})
});

//GET all product from a specific vendor
router.post('/vendors/:name', async function(req, res){

	let form = new formidable.IncomingForm();

	form.parse(req, async function (error, fields, files) {

		if(error){
			console.error(error.name + ": " + error.message);
			res.status(400).json({status: 400, message: error.name + ": " + error.message}) 
		} else {

			const PRODUCTS_LIMIT = fields.limit || 50;
			const PRODUCTS_SKIP = fields.skip * PRODUCTS_LIMIT || 0;
			var PRODUCTS_SEARCH = fields.search.toLowerCase().trim() || "";
			
			var data;

			var options = {
			  	method: 'GET',
			  	url: 'https://cvepremium.circl.lu/api/browse/' + req.params.name,
			  	headers: {Accept: 'application/json'}
			};

			var status = 200, text = "";

			await axios.request(options)
			.then(res => data = res.data.product)
			.catch(err => { status = err.response.status; text = err.response.statusText });

			if(PRODUCTS_SEARCH)
				data = data.filter(product => product.toLowerCase().includes(PRODUCTS_SEARCH));

			let total = data.length

			data = data.slice(PRODUCTS_SKIP, PRODUCTS_SKIP + PRODUCTS_LIMIT)

			var results = {}, cves;
			results['vendor'] = req.params.name;
			results['products'] = {};
			results['total'] = total

			for (var i = 0; i < data.length; i++) {
				results['products'][data[i]] = []

				options = {
				  	method: 'GET',
				  	url: 'https://cvepremium.circl.lu/api/search/' + req.params.name + '/' + data[i],
				  	headers: {Accept: 'application/json'}
				};

				await axios.request(options)
				.then(res => cves = res.data.results)
				.catch(err => { console.error("Failed to fetch cves for product " + data[i]) });

				for (var j = 0; j < cves.length; j++)
					if(cves[j]['id'] != undefined)
						results['products'][data[i]].push(cves[j]['id'])
			}

			if(data == undefined){
				status = 400;
				text = "Bad vendor name";
			}

			if(status == 200)
				res.status(status).json({status: status, data: results});
			else
				res.status(status).json({status: status, message: text});
		}
	})
});

function formatDate(date){
	if(date != ""){
		var d = new Date(date)
		var day = d.getDate() < 10 ? '0'+d.getDate() : d.getDate();
		var month = d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : d.getMonth()+1;
		return day+"-"+month+"-"+d.getFullYear()
	}
	return "-"
}

function unformatDate(date){
	var splitted = date.split("-")

	if(splitted.length != 3) return ""

	for (var i = 0; i < splitted.length; i++) {
		if(isNaN(splitted[i]))
			return ""
	}

	return splitted[2] + "-" + splitted[1] + "-" + splitted[0]
}

module.exports = router
