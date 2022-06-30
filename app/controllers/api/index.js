const express = require('express');
const app = express();

//routing
app.use('/antimalware', require('./antimalware'));
app.use('/dga-detection', require('./dga'));
app.use('/cve-search', require('./cve'));

module.exports = app
