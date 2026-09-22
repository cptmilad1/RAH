const express = require('express')
const app = express()
const route = require('../../../DataBase/post/routes/dataRoutes')
const helmet = require('helmet')

app.use(helmet())
app.use(express.json())
app.use('/api/users', route)


module.exports = app