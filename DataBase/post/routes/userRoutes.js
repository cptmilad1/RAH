const express = require('express')
const route = express.Router()
const {getUser} = require('../controls/userControl')

route.get('/',(req,res)=>{
    getUser(req,res)
})

module.exports = route