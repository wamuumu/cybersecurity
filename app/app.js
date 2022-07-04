const express = require('express');
const path = require("path")
const app = express();
const config = require('../config')
var fileupload = require('express-fileupload')

app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, './static/'))); 

app.use('/', require('./controllers/ui/index'))
app.use('/api', require('./controllers/api/index'))

module.exports = app
