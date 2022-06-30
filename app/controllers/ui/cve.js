var express = require('express');
var router = express.Router();

//Routing for pages

router.get('/cve', async function(req, res) {
    res.render('cve-search/cve');
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