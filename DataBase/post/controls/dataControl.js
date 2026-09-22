const {Pool} = require('pg')
const db = new Pool({
    database: "Postresan",
    host : "localhost",
    port: "6000",
    user : "postgres",
    password: "postgres"
})

const express = require('express')
const app = express()
app.use(express.json())



async function getUser(req,res){
    await db.query(`select * from users`)
    .then((result, err)=>{
      res.json({data: result.rows, message: "Users Recieved!", error : err})  
    }).catch((e)=>{res.send('Error: ' + e)})
}

async function addUser(req,res) {
    const body = req.body
    const{fullName, username, email, password, phone, address, avatar, isActive} = body
    await db.query(`insert into users(full_name, username, email, password_hash, phone, user_address, avatar_url, is_active)
        values ('${fullName}','${username}','${email}','${password}','${phone}','${address}','${avatar}', '${isActive}');`)
        .then((r,e)=>{res.status(200).json({data: r.rows, message : "user added.", err: e})})
        .catch((err)=>res.send("Error : " + err))        
}



module.exports = {
    getUser, addUser
}