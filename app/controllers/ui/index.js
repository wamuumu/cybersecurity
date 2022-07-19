const express = require('express');
const path = require("path");
const app = express();

app.set('views', path.join(require.main.path, './app/views/'));

//Routing

app.use('/', require('./common'));

app.use('/antimalware', require('./antimalware'));

app.use('/dga-detection', require('./dga'));

app.use('/cve-search', require('./cve'));

app.use('/survey', require('./survey'));

module.exports = app
