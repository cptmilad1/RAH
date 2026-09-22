const route = require('../routes/dataRoutes')
const express = require('express')
const app = express()

app.use(express.json())
app.use('/test', route)
app.listen(1000,()=>console.log("Testing..."))