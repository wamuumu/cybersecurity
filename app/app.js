const express = require('express');
const path = require("path")
const app = express();
const parser = require('body-parser');
const session = require('express-session');
const config = require('../config')

app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, './static/'))); 
app.use(parser.json())

app.use('/', require('./controllers/ui/index'))
app.use('/api', require('./controllers/api/index'))

module.exports = app
