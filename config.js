require("dotenv").config()

module.exports = {
    VIEWS: __dirname + '/app/views',
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    VIRUS_TOTAL_KEY: process.env.VIRUS_TOTAL_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    SESSION_KEY: process.env.SESSION_KEY
}
