const ownerShip = (req,res,next)=>{
    if(req.user.role !== "admin" && req.user.userId !== req.params.id){
        return res.json({
            message: "you cant access to this route or data!"
        })
    }
    next()
}
module.exports = ownerShip