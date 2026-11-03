require('../../BackEnd/config/loadEnv')

const {Pool} = require('pg')
const isProduction = process.env.NODE_ENV === 'production'
const dbConfig = {
    database: process.env.DB_DATABASE || (isProduction ? undefined : 'Postresan'),
    host: process.env.DB_HOST || (isProduction ? undefined : 'localhost'),
    port: process.env.DB_PORT || (isProduction ? undefined : 6000),
    user: process.env.DB_USER || (isProduction ? undefined : 'postgres'),
    password: process.env.DB_PASS || (isProduction ? undefined : 'postgres'),
}

if (isProduction) {
    const missingSettings = Object.entries(dbConfig)
        .filter(([, value]) => !value)
        .map(([name]) => name)
    if (missingSettings.length) {
        throw new Error(`Missing production database settings: ${missingSettings.join(', ')}`)
    }
}

const db = new Pool({
    ...dbConfig,
})

module.exports = db