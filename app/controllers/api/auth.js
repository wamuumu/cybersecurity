const express = require('express');
const router = express.Router();
const User = require("../../models/user")
const md5 = require("md5")
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const config = require('../../../config')

passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        User.findOne({email: email, password: md5(password) }, function (err, user) {
            if (err) return done(null, false, { status: 500, message: "Authentication failed: " + err.message });

            if (!user) return done(null, false, { status: 404, message: 'User not found.' });

            return done(null, user);
        })
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(user, done) {
    User.findOne({_id: user}, function (err, result) {
        if(err || !result || result.length == 0)
            return done(null, false, { status: 404, message: 'User not found.' });
        else{

            result.password = undefined;
            result.__v = undefined;

            return done(null, result);
        }
    })
});

router.post('/login', passport.authenticate('local'), function(req, res, next) {

    passport.authenticate('local', function(err, user, info){

        if(err) { res.status(500).json({ status: 500, message: "Internal server error" }); return }

        if(!user) { res.status(404).json({ status: 404, message: "User not found" }); return; }

        console.log("[" + user.email + "] - LOGIN");

        res.status(200).json({
            status: 200,
            id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            organization: user.organization,
            province: user.province,
            apikey: user.apikey
        });

    })(req, res, next);
    
});

//logout
router.post('/logout', function(req, res){
    if(req.user){
        let email = req.user.email;
        req.logout(function(err) {
            if (err) { return next(err); }
            console.log("[" + email + "] - LOGOUT");
            res.status(200).json({ status: 200, message: email + " logged out" })
        });
    } else {
        res.redirect('/login');
    }
});

module.exports = router
