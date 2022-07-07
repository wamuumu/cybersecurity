const app = require('./app/app.js');
const config = require('./config.js');
const mongoose = require('mongoose');

const port = config.PORT || 80;

console.log("Initializing...");

mongoose.connect(config.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then ( (dbInfo) => {

    console.log("Connected to Database [" + dbInfo.connections[0].name + "]");

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

});

let db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'));
