//CONTROLLER PER LA GESTIONE DELLA RICERCA DI CVE

const express = require('express');
const router = express.Router();
const axios = require('axios');

//GET all CVE
router.get('/cve', async function(req, res){

	const CVE_LIMIT = 10;
	var data;

	const options = {
	  	method: 'GET',
	  	url: 'http://cve.circl.lu/api/last/' + CVE_LIMIT,
	  	headers: {Accept: 'application/json'}
	};

	var status = 200, text = "";

	await axios.request(options)
	.then(res => data = res.data)
	.catch(err => { status = err.response.status; text = err.response.statusText });

	var results = []

	for (var i = 0; i < data.length; i++) {
		results[i] = {}
		results[i]['id'] = data[i].id
		results[i]['cvss'] = data[i].cvss
		results[i]['summary'] = data[i].summary
		results[i]['updated'] = formatDate(data[i].Modified)
		results[i]['published'] = formatDate(data[i].Published)
 	}

	if(status == 200)
		res.status(status).json({status: status, data: results});
	else
		res.status(status).json({status: status, message: text});
});

//GET specific CVE by ID
router.get('/cve/:id', async function(req, res){

	var data;

	const options = {
	  	method: 'GET',
	  	url: 'http://cvepremium.circl.lu/api/cve/' + req.params.id,
	  	headers: {Accept: 'application/json'}
	};

	var status = 200, text = "";

	await axios.request(options)
	.then(res => data = res.data)
	.catch(err => { status = err.response.status; text = err.response.statusText });

	var result = {}
	result['id'] = req.params.id
	result['summary'] = data.summary
	result['updated'] = formatDate(data.Modified)
	result['published'] = formatDate(data.Published)
	result['references'] = data.references
	result['vulnerable_configuration'] = []
	result['capec'] = []
	result['cwe'] = data.cwe
	result['cvss'] = data.cvss
	result['impactScore'] = data.impactScore
	result['exploitabilityScore'] = data.exploitabilityScore
	result['access'] = data.access
	result['impact'] = data.impact
	
	if(data.cvss3 == undefined)
		result['cvss3'] = "NONE"
	else{
		result['cvss3'] = data.cvss3
		result['impactScore3'] = data.impactScore
		result['exploitabilityScore3'] = data.exploitabilityScore
		result['access3'] = data.exploitability3
		result['impact3'] = data.impact3
	}


	for (var i = 0; i < data.vulnerable_configuration.length; i++)
		result['vulnerable_configuration'].push(data.vulnerable_configuration[i].title)

	for (var i = 0; i < data.capec.length; i++){
		var cap = {};
		cap['name'] = data.capec[i].name
		cap['description'] = data.capec[i].summary
		result['capec'].push(cap)
	}

	if(status == 200)
		res.status(status).json({status: status, data: result});
	else
		res.status(status).json({status: status, message: text});
});

//GET all CWE
router.get('/cwe', async function(req, res){

	var data;

	const options = {
	  	method: 'GET',
	  	url: 'http://cve.circl.lu/api/cwe',
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
			result['id'] = 'CWE-'+data[i].id
			result['name'] = data[i].name
			result['description'] = data[i].Description
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
	  	url: 'http://cve.circl.lu/api/browse',
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
	  	url: 'http://cve.circl.lu/api/browse/' + req.params.name,
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
	  	url: 'http://cvepremium.circl.lu/api/search/' + req.params.name + '/' + req.params.product,
	  	headers: {Accept: 'application/json'}
	};

	var status = 200, text = "";

	await axios.request(options)
	.then(res => data = res.data.results)
	.catch(err => { status = err.response.status; text = err.response.statusText });

	var results = []

	for (var i = 0; i < data.length; i++) {
		results[i] = {}
		results[i]['id'] = data[i].id
		results[i]['cvss'] = data[i].cvss
		results[i]['summary'] = data[i].summary
		results[i]['updated'] = formatDate(data[i].Modified)
		results[i]['published'] = formatDate(data[i].Published)
 	}

	if(status == 200)
		res.status(status).json({status: status, data: results});
	else
		res.status(status).json({status: status, message: text});
});


function formatDate(date){
	var d = new Date(date)
	var day = d.getDate() < 10 ? '0'+d.getDate() : d.getDate();
	var month = d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : d.getMonth()+1;
	return day+"-"+month+"-"+d.getFullYear()
}

module.exports = router
