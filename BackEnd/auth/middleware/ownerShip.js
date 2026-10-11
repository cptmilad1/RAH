const ownerShip = (req,res,next)=>{
    if(req.user.role !== "admin" && String(req.user.userId) !== String(req.params.id)){
        return res.status(403).json({
            message: "you cant access to this route or data!"
        })
    }
    next()
}
module.exports = ownerShip