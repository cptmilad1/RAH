require('./config/loadEnv')
if (process.env.NODE_ENV === 'production') {
  const requiredProductionSettings = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'FRONTEND_URL',
    'APP_URL',
  ]
  const missingSettings = requiredProductionSettings.filter((name) => !process.env[name])
  if (missingSettings.length) {
    throw new Error(`Missing production settings: ${missingSettings.join(', ')}`)
  }
  if (process.env.JWT_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('Production JWT secrets must each be at least 32 characters long.')
  }
  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error('Production JWT secrets must be different.')
  }
}
const http = require('node:http')
const path = require('node:path')
const express = require('express')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')
const authRouter = require('./auth/router/router')
const parcelRouter = require('./Post/parcelRouter')
const errorHandler = require('./auth/middleware/errorHandler')
const { Server } = require('socket.io')
const attachPresence = require('./presence/socketServer')
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
app.set('io', io)
attachPresence(io)
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: true, limit: '20kb' }))
app.use(cookieParser())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api', authRouter)
app.use('/api/parcels', parcelRouter)
app.use(errorHandler)

const PORT = process.env.PORT || 3000
server.listen(PORT, ()=>{
	console.log('server running on port ' + PORT)
})