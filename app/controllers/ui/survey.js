var express = require('express');
var router = express.Router();
const axios = require('axios');
const Survey = require('../../models/survey')
const config = require('../../../config.js');

//Routing for pages

router.get('/GDPR-tools', async function(req, res) {
    res.render('survey/GDPR_tools');
})

router.get('/GDPR-result', async function(req, res) {
    res.sendFile(config.VIEWS + '/survey/gdpr_result.html');
})

module.exports = router