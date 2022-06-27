require("dotenv").config()

module.exports = {
    ROOT: "/",
    PORT: process.env.PORT,
    VIRUS_TOTAL_KEY: process.env.VIRUS_TOTAL_KEY
}
