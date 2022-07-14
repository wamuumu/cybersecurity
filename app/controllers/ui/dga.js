var express = require('express');
var router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const formidable = require('formidable');
const fs = require('fs');

//Routing for pages

router.get('/', async function(req, res) {
    res.render('dga-detection/dga_input');
})

router.post('/result', async function(req, res) {

    //forward the request to API
    var data = { status: 200 };

    const formdata = new FormData();
    try {
        let form = new formidable.IncomingForm();

        form.parse(req, async function (error, fields, files) {

            if(!isEmpty(files) || !isEmpty(fields)){
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
                .catch(err => { data.status = err.response.data.status; data.text = err.response.data.message || "" })

                res.render('dga-detection/dga_result', { data: data })
            } else {
                console.error("Missing files or fields");
                res.redirect('/dga-detection');
            }
        });
    } catch(err){
        console.error(err);
        res.redirect('/dga-detection');
    }
})

function isEmpty(obj) {
    return Object.keys(obj).length === 0 || obj == undefined;
}

module.exports = router