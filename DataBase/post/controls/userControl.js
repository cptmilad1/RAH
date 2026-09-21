const {Pool} = require('pg')
const db = new Pool({
    name: "Postresan",
    host : "localhost",
    port: "6000",
    user : "postgres",
    password: "postgres"
})

const express = require('express')
const app = express()
app.use(express.json())


async function getUser(req,res){
    const users = await db.query(`select * from users`)
    .then((result, err)=>{
      res.json({data: result.rows, message: "Users Recieved!", error : err})  
    }).catch((e)=>{res.send('Error: ' + e)})
    console.log(users)
}



module.exports = {
    getUser
}