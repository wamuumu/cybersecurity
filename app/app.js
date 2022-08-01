const express = require('express');
const path = require("path")
const app = express();
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const config = require('../config')

// SESSION

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24; //24h
app.use(session({
    secret: config.SESSION_KEY,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

// PATHS

app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, './static/'))); 
app.set('views', path.join(require.main.path, './app/views/'));

app.use('/', require('./controllers/ui/index'))
app.use('/api', require('./controllers/api/index'))


// ERROR HANDLING

app.get('/api/*', function(req, res, next){
    let data = { status: 404, message: "Service not found" }
    res.status(404).render('common/error', { data: data, loggedUser: req.isAuthenticated()})
});

app.get('/*', function(req, res, next){
    let data = { status: 404, message: "Page not found" }
    res.status(404).render('common/error', { data: data, loggedUser: req.isAuthenticated()})
});


module.exports = app
