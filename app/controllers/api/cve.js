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

			var data;

			const options = {
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

			var status = 200, text = "";

			await axios.request(options)
			.then(res => data = res.data)
			.catch(err => { status = err.response.status; text = err.response.statusText });

			var results = []

			if(status == 200){

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

				res.status(status).json({status: status, data: data});
			} else
				res.status(status).json({status: status, message: text});
		}
	});
});

//GET specific CVE by ID
/*
router.get('/cve/:id', async function(req, res){

	var data;

	const options = {
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
		result['cwe'] = data.cwe != undefined ? data.cwe : "-"
		result['cvss'] = data.cvss != undefined ? data.cvss : "-"
		result['impactScore'] = data.impactScore != undefined ? data.impactScore : "-"
		result['exploitabilityScore'] = data.exploitabilityScore != undefined ? data.exploitabilityScore : "-"
		result['access'] = data.access != undefined ? data.access : "-"
		result['impact'] = data.impact != undefined ? data.impact : "-"
		
		if(data.cvss3 == undefined)
			result['cvss3'] = "NONE"
		else{
			result['cvss3'] = data.cvss3
			result['impactScore3'] = data.impactScore3 != undefined ? data.impactScore3 : "-"
			result['exploitabilityScore3'] = data.exploitabilityScore3 != undefined ? data.exploitabilityScore3 : "-"
			result['access3'] = data.exploitability3 != undefined ? data.exploitability3 : "-"
			result['impact3'] = data.impact3 != undefined ? data.impact3 : "-"
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

		res.status(status).json({status: status, data: result});
	} else
		res.status(status).json({status: status, message: text});
});

//GET all CWE
router.get('/cwe', async function(req, res){

	var data;

	const options = {
	  	method: 'GET',
	  	url: 'https://cvepremium.circl.lu/api/cwe',
	  	headers: {Accept: 'application/json'}
	};

	var status = 200, text = "";

	await axios.request(options)
	.then(res => data = res.data)
	.catch(err => { status = err.response.status; text = err.response.statusText });

	var results = []

	for (var i = 0; i < data.length; i++) {
		if(data[i].status == "Stable"){
			var result = {}
			result['id'] = data[i].id != undefined ? 'CWE-'+data[i].id : "-"
			result['name'] = data[i].name != undefined ? data[i].name : "-"
			result['description'] = data[i].Description != undefined ? data[i].Description : "-"
			results.push(result)
		}
 	}

	if(status == 200)
		res.status(status).json({status: status, data: results});
	else
		res.status(status).json({status: status, message: text});
});

//GET all vendors
router.get('/vendors', async function(req, res){

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

	if(status == 200)
		res.status(status).json({status: status, data: data});
	else
		res.status(status).json({status: status, message: text});
});

//GET all product from a specific vendor
router.get('/vendors/:name', async function(req, res){

	var data;

	const options = {
	  	method: 'GET',
	  	url: 'https://cvepremium.circl.lu/api/browse/' + req.params.name,
	  	headers: {Accept: 'application/json'}
	};

	var status = 200, text = "";

	await axios.request(options)
	.then(res => data = res.data.product)
	.catch(err => { status = err.response.status; text = err.response.statusText });

	var results = {}
	results['vendor'] = req.params.name;
	results['products'] = data;

	if(data == undefined){
		status = 400;
		text = "Bad vendor name";
	}

	if(status == 200)
		res.status(status).json({status: status, data: results});
	else
		res.status(status).json({status: status, message: text});
});

//GET all CVE of a product
router.get('/vendors/:name/:product', async function(req, res){

	var data;

	const options = {
	  	method: 'GET',
	  	url: 'https://cvepremium.circl.lu/api/search/' + req.params.name + '/' + req.params.product,
	  	headers: {Accept: 'application/json'}
	};

	var status = 200, text = "";

	await axios.request(options)
	.then(res => data = res.data.results)
	.catch(err => { status = err.response.status; text = err.response.statusText });

	var results = []

	for (var i = 0; i < data.length; i++) {
		results[i] = {}
		results[i]['id'] = data[i].id != undefined ? data[i].id : "-"
		results[i]['cvss'] = data[i].cvss != undefined ? data[i].cvss : "-"
		results[i]['summary'] = data[i].summary != undefined ? data[i].summary : "-"
		results[i]['updated'] = formatDate(data[i].Modified != undefined ? data[i].Modified : "")
		results[i]['published'] = formatDate(data[i].Published != undefined ? data[i].Published : "")
 	}

	if(status == 200)
		res.status(status).json({status: status, data: results});
	else
		res.status(status).json({status: status, message: text});
});

router.get('/info', async function(req, res){

	var data;

	const options = {
	  	method: 'GET',
	  	url: 'https://cvepremium.circl.lu/api/dbinfo',
	  	headers: { Accept: 'application/json' }
	};

	var status = 200, text = "";

	await axios.request(options)
	.then(res => data = res.data)
	.catch(err => { status = err.response.status; text = err.response.statusText });

	if(status == 200)
		res.status(status).json({status: status, data: data});
	else
		res.status(status).json({status: status, message: text});
});
*/


function formatDate(date){
	if(date != ""){
		var d = new Date(date)
		var day = d.getDate() < 10 ? '0'+d.getDate() : d.getDate();
		var month = d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : d.getMonth()+1;
		return day+"-"+month+"-"+d.getFullYear()
	}
	return "-"
}

module.exports = router
