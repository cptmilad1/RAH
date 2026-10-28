require('../../config/loadEnv')

const jwt = require('jsonwebtoken')
const db = require('../../../DataBase/base/dbBase')

const authentication = async(req,res,next)=>{
    try{
        const token = req.cookies?.access_token
        if(!token)return res.status(401).json({message: "Authenticate required"})
            const decode = jwt.verify(token, process.env.JWT_SECRET)
        const result = await db.query(`select token_version AS "tokenVersion", is_active from users where id=$1`, [decode.userId])
        if(result.rowCount == 0) return res.status(401).json({message: "User Not found"})
        const user = result.rows[0]
        if (Number(decode.tokenVersion) !== Number(user.tokenVersion)) return res.status(401).json({message: "token has been invalidated!"})
        req.user = decode
        next()
    }catch(err){
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid or expired access token." })
        }
        return res.json({message: "Validation Error!"})
    }
}
module.exports = authentication;
