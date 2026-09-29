const authorize = (...role)=>{
    return (req,res,next)=>{
        if(!role.includes(req.user.role))
            return res.status(403).json({message: "you havent access!"})
        next()
    }
}
module.exports = authorize;