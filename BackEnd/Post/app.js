const express = require('express')
const app = require('./middlewares/middlewares')

const port = process.env.PORT || 7000


app.listen(port, ()=>{
    console.log('Server Running!')
})