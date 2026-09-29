const {Pool} = require('pg')
const db = new Pool({
    database: process.env.DB_DATABASE || "Postresan",
    host : process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 6000,
    user : process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres"
})

module.exports = db