const app = require('./app/app.js');
const config = require('./config.js');

const port = config.PORT || 80;

console.log("Initializing...");

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
