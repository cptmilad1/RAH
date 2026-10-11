const validator = (schema)=>{
    return (req,res,next)=>{
        const valid = schema.safeParse(req.body)
        if(!valid.success)return res.status(400).json({message: "Invalid request data.", error: valid.error.issues})
        req.body = valid.data
        next()
    }
}
module.exports = validator;