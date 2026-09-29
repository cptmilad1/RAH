require('dotenv').config()
const express = require('express')
const app = express()
const router = require('../router/router')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const errorHandler = require('../middleware/errorHandler')

app.use(helmet())
app.use(cors({
    origin: "http:localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/api', router)
app.use(errorHandler)


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Auth service listening on port ${PORT}`)
})