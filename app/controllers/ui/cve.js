var express = require('express');
var router = express.Router();
const axios = require('axios');

//Routing for pages

router.get('/cve', async function(req, res) {

    if(!req.isAuthenticated()){
        let data = { status: 401, message: "Devi autenticarti prima di usare il servizio" }
        res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
        return;
    }

    var info = {}, error = {};
    let url = req.protocol + '://' + req.get('host') + '/api/cve-search/cve';

    await axios.post(url, {limit: 1}, { 
        headers: { 
            "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";" 
        } 
    })
    .then(res => { info['status'] = 200; info['total'] = res.data.data.total; info['default'] = 25 })
    .catch(err => { error['status'] = err.response.status; error['message'] = err.response.statusText })

    if(!isEmpty(info))
        res.render('cve-search/cve', { data: info, loggedUser: req.isAuthenticated() });
    else{
        console.error(error);
        res.render('cve-search/cve', { data: error, loggedUser: req.isAuthenticated() });
    }
})

/*router.get('/cwe', async function(req, res) {
    res.render('cve-search/cwe');
})*/

router.get('/cve/:id', async function(req, res) {

    if(!req.isAuthenticated()){
        let data = { status: 401, message: "Devi autenticarti prima di usare il servizio" }
        res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
        return;
    }

    var cve = {}, error = {};
    let url = req.protocol + '://' + req.get('host') + '/api/cve-search/cve/' + req.params.id;
    
    await axios.get(url, { 
        headers: { 
            "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";" 
        } 
    })
    .then(res => { cve['status'] = 200; cve['cve'] = res.data.data })
    .catch(err => { error['status'] = err.response.status; error['message'] = err.response.statusText })

    if(!isEmpty(cve))
        res.render('cve-search/cve_detail', { loggedUser: req.isAuthenticated(), data: cve } );
    else{
        console.error(error);
        res.render('cve-search/cve_detail', { loggedUser: req.isAuthenticated(), data: error } );
    }
})

/*router.get('/vendors', async function(req, res) {
    res.render('cve-search/vendors');
})

router.get('/vendors/:name', async function(req, res) {
    res.render('cve-search/products');
})

router.get('/vendors/:name/:product', async function(req, res) {
    res.render('cve-search/product_cve');
})
*/

function isEmpty(obj) {
    return Object.keys(obj).length === 0 || obj == undefined;
}

module.exports = router