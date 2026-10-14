const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')

const backendEnvPath = path.resolve(__dirname, '../.env')
const rootEnvPath = path.resolve(__dirname, '../../.env')
const envPath = fs.existsSync(backendEnvPath) ? backendEnvPath : rootEnvPath

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath })
  if (result.error) throw result.error
}

module.exports = envPath
