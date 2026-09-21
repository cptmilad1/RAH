const express = require('express')
const app = express()
const route = require('../../DataBase/post/routes/userRoutes')
const helmet = require('helmet')
const port = process.env.PORT || 7000

app.use(helmet())
app.use(express.json())
app.use('/api/users', route)

app.listen(port, ()=>{
    console.log('Server Running!')
})