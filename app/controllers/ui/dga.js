var express = require('express');
var router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const formidable = require('formidable');
const fs = require('fs');

//Routing for pages

router.get('/', async function(req, res) {
    var data = { status: parseInt(req.query.status) || 200, error: "Missing files or fields" }
    res.render('dga-detection/dga_input', { data: data });
})

router.post('/result', async function(req, res) {

    //forward the request to API
    var data = {};

    const formdata = new FormData();
    
    let form = new formidable.IncomingForm();

    form.parse(req, async function (error, fields, files) {

        if(error){
            res.redirect('/dga-detection?status=404')

        } else if(!isEmpty(files) || !isEmpty(fields)){

            let filePath = files.filetoupload.filepath;
            let fileName = files.filetoupload.originalFilename;
            let url = req.protocol + '://' + req.get('host') + '/api/dga-detection';

            if(fileName != ""){
                const file = fs.createReadStream(filePath);
                formdata.append('filetoupload', file, fileName);
            } 
            formdata.append('domain', fields.domain);
            formdata.append('choice', fields.choice);

            await axios.post(url, formdata, {
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers: {
                    'Content-Type': 'multipart/form-data; boundary=' + formdata.getBoundary()
                }
            })
            .then(res => data = res.data)
            .catch(err => { data['status'] = err.response.status; data['error'] = err.response.statusText })

            res.render('dga-detection/dga_result', { data: data })

        } else {
            res.redirect('/dga-detection?status=404')
        }
    });
})

function isEmpty(obj) {
    return Object.keys(obj).length === 0 || obj == undefined;
}

module.exports = router