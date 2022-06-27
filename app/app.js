const express = require('express');
const path = require("path")
const app = express();
const parser = require('body-parser');
const session = require('express-session');
const config = require('../config')

app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, './static/'))); 

//Imposta limiti body
app.use(parser.json({limit: '50mb'}));
app.use(parser.urlencoded({limit: '50mb', extended: true}));

app.use('/', require('./controllers/ui/index'))
app.use('/api', require('./controllers/api/index'))

module.exports = app
