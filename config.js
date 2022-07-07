require("dotenv").config()

module.exports = {
    ROOT: "/",
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    VIRUS_TOTAL_KEY: process.env.VIRUS_TOTAL_KEY
}
