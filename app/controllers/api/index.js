const express = require('express');
const app = express();

//routing
app.use('/antimalware', require('./antimalware'));
app.use('/dga-detection', require('./dga'));

module.exports = app
