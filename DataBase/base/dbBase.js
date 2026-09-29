const {Pool} = require('pg')
const db = new Pool({
    database: "Postresan",
    host : "localhost",
    port: "6000",
    user : "postgres",
    password: "postgres"
})

module.exports = db