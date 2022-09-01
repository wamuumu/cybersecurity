var express = require('express');
var router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const formidable = require('formidable');
const fs = require('fs');

//Routing for pages

router.get('/', async function(req, res) {
    
    if(!req.isAuthenticated()){
        let data = { status: 401, message: "Devi autenticarti prima di usare il servizio" }
        res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
        return;
    }

    let status = parseInt(req.query.status) || 200;
    var error = status == 400 ? "Scegli una modalità prima di fare la richiesta" : "File o campi mancanti";

    var data = status == 200 ? { status: status, message: "" } : { status: status, message: error }
    res.render('dga-detection/dga_input', { data: data, loggedUser: req.isAuthenticated() });
})

router.post('/result', async function(req, res) {

    if(!req.isAuthenticated()){
        let data = { status: 401, message: "Devi autenticarti prima di usare il servizio" }
        res.render('common/error', { data: data, loggedUser: req.isAuthenticated() });
        return;
    }

    //forward the request to API
    var data = {};
    var formdata = new FormData();

    let form = new formidable.IncomingForm();

    form.parse(req, async function (error, fields, files) {

        if(error){
            console.error(error.name + ": " + error.message)
            res.redirect('/dga-detection?status=404')
        } else if(!isEmpty(files) || !isEmpty(fields)){

            if(!fields.choice){
                res.redirect('/dga-detection?status=400')
                return;
            } else
                formdata.append('choice', fields.choice);

            let filePath = files.filetoupload.filepath;
            let fileName = files.filetoupload.originalFilename;
            let url = req.protocol + '://' + req.get('host') + '/api/dga-detection';

            if(fileName != "")
                formdata.append('filetoupload', fs.createReadStream(filePath), fileName);             
            else
                formdata.append('domain', fields.domain);

            formdata.append('coeff1', fields.coeff1)
            formdata.append('coeff2', fields.coeff2)
            formdata.append('coeff3', fields.coeff3)

            await axios.post(url, formdata, {
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Cookie": "connect.sid=" + req.cookies["connect.sid"] +";"
                }
            })
            .then(res => data = res.data)
            .catch(err => { data['status'] = err.response.status; data['error'] = err.response.statusText })

            res.render('dga-detection/dga_result', { data: data, loggedUser: req.isAuthenticated() })

        } else {
            res.redirect('/dga-detection?status=404')
        }
    });
})

function isEmpty(obj) {
    return Object.keys(obj).length === 0 || obj == undefined;
}

module.exports = router