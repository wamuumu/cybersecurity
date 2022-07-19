const express = require('express');
const path = require("path")
const app = express();
const session = require('express-session');
const parser = require('body-parser');
const config = require('../config')

app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, './static/'))); 
app.set('views', path.join(require.main.path, './app/views/'));

app.use('/', require('./controllers/ui/index'))
app.use('/api', require('./controllers/api/index'))
app.use(parser.json())

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: config.SESSION_KEY,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: true
}));

// ERROR HANDLING

app.get('/api/*', function(req, res, next){
    res.status(404).render('common/error', { status: 404, message: "API not found"})
});

app.get('/*', function(req, res, next){
    res.status(404).render('common/error', { status: 404, message: "Page not found"})
});


module.exports = app
