const express = require('express');
const app = express();

//routing
app.use('/antimalware', require('./antimalware'));

module.exports = app
