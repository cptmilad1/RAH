require('./config/loadEnv')
const express = require('express')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const router = require('./taxi/app')
const parcelRouter = require('./Post/parcelRouter')
const errorHandler = require('./auth/middleware/errorHandler')
const app = express()
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: true, limit: '20kb' }))
app.use(cookieParser())
app.use('/api', router)
app.use('/api/parcels', parcelRouter)
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
	console.log('server running on port ' + PORT)
})