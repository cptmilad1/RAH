const express = require('express')
const route = express.Router()
const {getUser, addUser} = require('../controls/dataControl')

route.get('/',(req,res)=>{
    getUser(req,res)
})
route.post('/', (req,res)=>{
    addUser(req,res)
})

module.exports = route