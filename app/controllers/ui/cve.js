var express = require('express');
var router = express.Router();
const axios = require('axios');

//Routing for pages

router.get('/cve', async function(req, res) {

    var info;
    let url = req.protocol + '://' + req.get('host') + '/api/cve-search/cve?limit=1';

    await axios.get(url)
    .then(res => info = res.data.data.total)
    .catch(err => console.log(err))

    res.render('cve-search/cve', {total: info});
})

router.get('/cwe', async function(req, res) {
    res.render('cve-search/cwe');
})

router.get('/cve/:id', async function(req, res) {
    res.render('cve-search/cve_detail');
})

router.get('/vendors', async function(req, res) {
    res.render('cve-search/vendors');
})

router.get('/vendors/:name', async function(req, res) {
    res.render('cve-search/products');
})

router.get('/vendors/:name/:product', async function(req, res) {
    res.render('cve-search/product_cve');
})

module.exports = router