var express = require('express');
var router = express.Router();
const axios = require('axios');

//Routing for pages

router.get('/cve', async function(req, res) {

    var info = {}, error = {};
    let url = req.protocol + '://' + req.get('host') + '/api/cve-search/cve';

    await axios.post(url, {limit: 1})
    .then(res => { info['status'] = 200; info['total'] = res.data.data.total })
    .catch(err => { error['status'] = err.response.status; error['error'] = err.response.statusText })

    if(!isEmpty(info))
        res.render('cve-search/cve', { data: info });
    else{
        console.error(error);
        res.render('cve-search/cve', { data: error });
    }
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

function isEmpty(obj) {
    return Object.keys(obj).length === 0 || obj == undefined;
}

module.exports = router