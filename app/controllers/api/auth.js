const express = require('express');
const router = express.Router();
const config = require('../../../config')
const formidable = require('formidable');
const User = require("../../models/user")
const md5 = require("md5")
const auth = require("../../middlewares/auth")
const jwt = require('jsonwebtoken')

//login 
router.post("/login", async function(req, res) {

    let form = new formidable.IncomingForm();

    form.parse(req, async function (error, fields, files) {
        if(error){
            console.error(error);
            res.status(400).json({status: 400, message: error}) 
        } else {

            var user = new User({
                email: fields.email,
                password: md5(fields.password)
            });

            User.findOne({email: user.email, password: user.password})
            .then(result => {
                if(!result || result.length == 0)
                    res.status(401).json({status: 401, message: "Unauthorized"});
                else {

                    var payload = {
                        email: result.email,
                        id: result._id
                    }
                   
                    var options = {
                        expiresIn: 86400 //24h
                    }
                    
                    var token = jwt.sign(payload, config.SECRET_KEY, options);
                    
                    req.session.tokens = req.session.tokens || []

                    req.session.tokens.push({
                        id: result._id,
                        token: token,
                        email: result.email,
                        role: result.role
                    })

                    res.status(200).json({
                        token: token,
                        id: result._id,
                        name: result.name,
                        surname: result.surname,
                        email: user.email,
                        role: result.role,
                        organization: result.organization,
                        province: result.province
                    });
                }
            })
            .catch(err => {
                res.status(500).json({status: 500, message: "Authentication failed: " + err.message });
            })
        }
    })
});

//logout
router.post("/logout", auth, async function(req, res) {

    if(!req.query.token)
        res.status(400).json({status: 400, message: "Error: Token not provided"});
    else if(!req.session.tokens)
        res.status(400).json({status: 400, message: "Error: Session not found"});
    else{
        for(i = 0; i < req.session.tokens.length; i++){
            if(req.session.tokens[i].token == req.query.token){
                let user = req.session.tokens.splice(i, 1);
                res.status(200).json({status: 200, message: "["+ user[0].email +"] logged out"});
                return;
            }
        }
        res.status(404).json({status: 404, message: "Error: Token not found"});
    }
})

module.exports = router
