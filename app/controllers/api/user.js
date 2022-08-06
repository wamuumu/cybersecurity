const express = require('express');
const md5 = require("md5")
const formidable = require('formidable');
const config = require('../../../config')
const auth = require("../../middlewares/auth")
const is_admin = require("../../middlewares/is_admin")
const { generateApiKey } = require('generate-api-key');
const User = require("../../models/user")
const Survey = require("../../models/survey")
const axios = require('axios');
const router = express.Router();

//ottiene tutti gli utenti
router.get("/", auth, is_admin, async function(req, res) {
    
    User.find({})
    .then(users => {
        for(i=0; i<users.length; i++){
            if(users[i].toObject)
                users[i] = users[i].toObject();
            users[i].password = undefined
            users[i].__v = undefined;
            users[i].apikey = undefined
        }
        res.status(200).json({ total: users.length, users: users })
    })
    .catch(err => {
        res.status(500).json({status: 500, message: err.name + ": " + err.message})
    })
});

//crea un utente
router.post('/', async function(req, res) {

    let form = new formidable.IncomingForm();

    form.parse(req, async function (error, fields, files) {
        if(error){
            console.error(error.name + ": " + error.message);
            return res.status(400).json({status: 400, message: error.name + ": " + error.message}) 
        } else {

            if(!fields.captchaToken){
                console.error("[SIGNIN] Captcha invalido")
                return res.status(404).json({status: 404, message: "Captcha token not found"})
            }

            const url = `https://www.google.com/recaptcha/api/siteverify?secret=${config.SECRET_KEY}&response=${fields.captchaToken}`

            var captchaSuccess = false;
            await axios.post(url)
            .then((response) => { captchaSuccess = response.data.success })
            .catch((error) => {
                console.error(error)
            })

            if(!captchaSuccess)
                return res.status(400).json({status: 400, message: "Invalid captcha"})

            if(!fields.name || !fields.surname || !fields.email || !fields.password || !fields.province)
                return res.status(400).json({status: 400, message: "Empty Fields Error: missing or invalid fields"});

            var new_user = new User({
                name: fields.name,
                surname: fields.surname,
                email: fields.email,
                password: md5(fields.password),
                organization: fields.organization || "",
                province: fields.province
            });

            new_user.apikey = generateApiKey({
                method: 'uuidv5',
                name: new_user._id + "_" + new_user.email,
                namespace: '1dfdf2c1-7365-4625-b7d9-d9db5210f18d'
            });

            User.findOne({email: new_user.email})
            .then(result => {
                if(!result || result.length == 0){
                    //nessun utente, quindi registra
                    new_user.save(function (err, user) {
                        if (err) {
                            console.log(err.name + " - " + err.message)
                            return res.status(500).json({status: 500, message: err.name + ": " + err.message})
                        } else {
                          console.log(user.email + " saved to user collection.");
                          return res.status(200).json({status: 200, message: "[" + user.email + "] created successfully"}) 
                        }
                    });
                }
                else
                    return res.status(409).json({status: 409, message: "Duplicate Email Error: [" + new_user.email + "] is already taken"})
            })
            .catch(err => {
                return res.status(500).json({status: 500, message: err.name + ": " + err.message})
            })
        }
    });
});

function isEmpty(obj) {
    return Object.keys(obj).length === 0 || obj == undefined;
}

/*
//ottiene utente con un certo id
router.get("/:id", auth, is_user, async function(req, res) {

    User.findOne({_id: req.params.id})
    .then(user => {
        if(!user)
            res.status(404).json({status: 404, message: "Error: User not found"})
        else {
            if(user.toObject)
                user = user.toObject();
            if("__v" in user) user.__v = undefined
            user.password = undefined
            res.status(200).json(user)
        }
    })
    .catch(err => {
        res.status(500).json({status: 500, message: err.name + ": " + err.message})
    })
});
*/

//modifica l'utente
router.put("/:id", auth, async function(req, res) {
    let form = new formidable.IncomingForm();

    form.parse(req, async function (error, fields, files) {
        if(error){
            console.error(error.name + ": " + error.message);
            res.status(400).json({status: 400, message: error.name + ": " + error.message}) 
        } else {

            User.findOne({_id: req.params.id}, async function(err, user){
                if(err)
                    res.status(500).json({status: 500, message: err.name + ": " + err.message})
                else if(!user)
                    res.status(404).json({status: 404, message: "Error: User not found"})
                else {
                    
                    let filter = { _id: user._id };
                    var update = {}

                    if(!fields.newpassword){
                        console.log("Account updating")
                        update = { name: fields.name, surname: fields.surname, email: fields.email, role: fields.role, organization: fields.organization, province: fields.province };

                        if(!update.name || !update.surname || !update.email || !update.role || !update.province){
                            res.status(400).json({status: 400, message: "Error: Empty Fields"})
                            return;
                        }

                    } else {
                        console.log("Password updating")
                        update = { password: md5(fields.newpassword) };

                        if(!fields.cpassword || fields.newpassword != fields.cpassword)
                            return res.status(400).json({status: 400, message: "Error: password mismatching"})

                        if(user.password != md5(fields.oldpassword))
                            return res.status(401).json({status: 401, message: "Error: old password incorrect"})
                    }

                    User.findOneAndUpdate(filter, update, {new: true}, async function(err, updatedUser){
                        if(err){
                            res.status(500).json({status: 500, message: err.name + ": " + err.message});
                        } else {
                            console.log("["+ updatedUser.email +"] updated");
                            res.status(200).json({ status: 200, message: updatedUser.email + " updated"});
                        }
                    });
                }
            })
        }
    })
});

//elimina utente mantenendo però i questionari da lui compilati
router.delete("/:id", auth, async function(req, res) {
    User.findOne({_id: req.params.id}, async function(err, user){
        if(err)
            res.status(500).json({status: 500, message: err.name + ": " + err.message})
        else if(!user)
            res.status(404).json({status: 404, message: "Error: User not found"})
        else {
            let email = user.email;
            User.deleteOne({ _id: user._id }, async function(err, deletedUser){
                if(err)
                    res.status(500).json({status: 500, message: err.name + ": " + err.message});
                else {
                    req.logout(function() {});
                    console.log("["+ email +"] deleted");
                    res.status(200).json({status: 200, message: "["+ email +"] deleted successfully"});
                }
            });
        }
    })
});

//ottiene i questionari [id, tipo, data] di un utente
router.get("/:id/surveys", auth, async function(req, res) {

    User.findOne({_id: req.params.id}, async function(err, user){
        if(err)
            res.status(500).json({status: 500, message: err.name + ": " + err.message})
        else if(!user)
            res.status(404).json({status: 404, message: "Error: User not found"})
        else {
            Survey.find({user: user._id}, async function(err, surveys) {
                if(err)
                    res.status(500).json({status: 500, message: err.name + ": " + err.message})
                else{
                    for (var i = 0; i < surveys.length; i++) {
                        if("__v" in surveys[i]) surveys[i].__v = undefined
                        if("user" in surveys[i]) surveys[i].user = undefined
                        if("data" in surveys[i]) surveys[i].data = undefined
                    }
                    res.status(200).json({ surveys: surveys })
                }
            })
        }
    })
});


module.exports = router
