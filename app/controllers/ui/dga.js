var express = require('express');
var router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const formidable = require('formidable');
const fs = require('fs');

//Routing for pages

router.get('/', async function(req, res) {
    
    if(!req.isAuthenticated()){
        res.render('common/error', { status:  401, message: "You need to login to access this service", loggedUser: req.isAuthenticated() });
        return;
    }

    let status = parseInt(req.query.status) || 200;
    var error = status == 400 ? "Pick a mode before making request" : "Missing files or fields";

    var data = { status: status, error: error }
    res.render('dga-detection/dga_input', { data: data, loggedUser: req.isAuthenticated() });
})

router.post('/result', async function(req, res) {

    if(!req.isAuthenticated()){
        res.render('common/error', { status:  401, message: "You need to login to access this service", loggedUser: req.isAuthenticated() });
        return;
    }

    //forward the request to API
    var data = {};
    var formdata = new FormData();

    let form = new formidable.IncomingForm();

    form.parse(req, async function (error, fields, files) {

        if(error){
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