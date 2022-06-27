const express = require('express');
const app = express();

//routing
//app.use('/users', require('./users'));

app.use('/', () => {
    console.log("API");
});

module.exports = app
