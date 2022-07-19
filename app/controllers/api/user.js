const express = require('express');
const md5 = require("md5")
const formidable = require('formidable');
const config = require('../../../config')
const auth = require("../../middlewares/auth")
const is_user = require("../../middlewares/is_user")
const is_admin = require("../../middlewares/is_admin")
const User = require("../../models/user")
const Survey = require("../../models/survey")
const router = express.Router();


//ottiene tutti gli utenti
router.get("/", auth, is_admin, async function(req, res) {
    User.find({})
    .then(users => {
        for(i=0; i<users.length; i++){
            if(users[i].toObject)
                users[i] = users[i].toObject();
            users[i].password = undefined
            if("__v" in users[i]) users[i].__v = undefined;
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
            console.error(error);
            res.status(400).json({status: 400, message: error}) 
        } else {

            var new_user = new User({
                name: fields.name,
                surname: fields.surname,
                email: fields.email,
                password: md5(fields.password),
                role: "user",
                organization: fields.organization || "",
                province: fields.province
            });

            if(!new_user.name || !new_user.surname || !new_user.email || !new_user.password || !new_user.province){
                res.status(400).json({status: 400, message: "Empty Fields Error: missing or invalid fields"})
                return;
            }

            User.findOne({email: new_user.email})
            .then(result => {
                if(!result || result.length == 0){
                    //nessun utente, quindi registra
                    new_user.save(function (err, user) {
                        if (err) {
                            res.status(500).json({status: 500, message: err.name + ": " + err.message})
                        } else {
                          console.log(user.email + " saved to user collection.");
                          res.status(200).json({status: 200, message: "[" + user.email + "] created successfully"}) 
                        }
                    });
                }
                else
                    res.status(409).json({status: 409, message: "Duplicate Email Error: [" + new_user.email + "] is already taken"})
            })
            .catch(err => {
                res.status(500).json({status: 500, message: err.name + ": " + err.message})
            })
        }
    });
});

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

//modifica l'utente
router.put("/:id", auth, is_user, async function(req, res) {
    let form = new formidable.IncomingForm();

    form.parse(req, async function (error, fields, files) {
        if(error){
            console.error(error);
            res.status(400).json({status: 400, message: error}) 
        } else {

            User.findOne({_id: req.params.id}, async function(err, user){
                if(err)
                    res.status(500).json({status: 500, message: err.name + ": " + err.message})
                else if(!user)
                    res.status(404).json({status: 404, message: "Error: User not found"})
                else {
                    
                    filter = { _id: user._id };
                    
                    update = { name: fields.name, surname: fields.surname, email: fields.email, password: md5(fields.password), organization: fields.organization, province: fields.province };
                    if(!update.name || !update.surname || !update.email || !fields.password || !update.province){
                        res.status(400).json({status: 400, message: "Empty Fields Error: missing or invalid fields"})
                        return;
                    }

                    User.findOneAndUpdate(filter, update, {new: true}, async function(err, updatedUser){
                        if(err){
                            res.status(500).json({status: 500, message: err.name + ": " + err.message});
                        } else {
                            console.log("["+ updatedUser.email +"] updated");
                            res.status(200).json(updatedUser);
                        }
                    });
                }
            })
        }
    })
});

//elimina utente mantenendo però i questionari da lui compilati
router.delete("/:id", auth, is_user, async function(req, res) {
    User.findOne({_id: req.params.id}, async function(err, user){
        if(err)
            res.status(500).json({status: 500, message: err.name + ": " + err.message})
        else if(!user)
            res.status(404).json({status: 404, message: "Error: User not found"})
        else {

            User.deleteOne({ _id: user._id }, async function(err, deletedUser){
                if(err)
                    res.status(500).json({status: 500, message: err.name + ": " + err.message});
                else {
                    console.log("["+ deletedUser.email +"] deleted");

                    /*if(req.user.id == result._id)
                        for(i = 0; i < req.session.tokens.length; i++){
                            if(req.session.tokens[i].token == req.query.token){
                                req.session.tokens.splice(i, 1);
                                break;
                            }
                        }*/

                    res.status(200).json({status: 200, message: "["+ deletedUser.email +"] deleted successfully"});
                }
            });
        }
    })
});

//ottiene i questionari [id, tipo, data] di un utente
router.get("/:id/surveys", auth, is_user, async function(req, res) {

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
                    res.status(200).json({ total: surveys.length, surveys: surveys })
                }
            })
        }
    })
});

module.exports = router
