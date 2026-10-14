function errorHandler(err, req,res,next){
    if(err.name == "TokenExpiredError"){
        return res.status(401).json({
            message: "Token Expired!"
        })
    }
    if(err.name == "JsonWebTokenError"){
        return res.status(401).json({
            message: "Invalid Token!"
        })
    }
    if(err.code == "23505"){
        return res.status(409).json({
            message: "Duplicate value!"
        })
    }
    if(err.code == '23502'){
        return res.status(400).json({
            message: "Required feilds is missing!"
        })
    }
    if(err.code == '23503'){
        return res.status(400).json({
            message: "Foreign key violation!"
        })
    }
    if(err.code == '23514'){
        return res.status(400).json({
            message: "Check constraint!"
        })
    }
    if(err.code == '22P02'){
        return res.status(400).json({
            message: "Invalid input syntax!"
        })
    }
    if(err.code == '22001'){
        return res.status(400).json({
            message: "Input is too long!"
        })
    }
    if(err.code == '22003'){
        return res.status(400).json({
            message: "This number is out of selected area!"
        })
    }
    if(err.code == '42P01'){
        return res.status(500).json({
            message: "Table not exist!"
        })
    }
    if(err.code == '42703'){
        return res.status(500).json({
            message: "Column not exist!"
        })
    }
    if(err.code == '42601'){
        return res.status(500).json({
            message: "database syntax error!"
        })
    }
    if(err.code == '42501'){
        return res.status(500).json({
            message: "Cant access to DATABASE!"
        })
    }
    if(err.code == '23P01'){
        return res.status(400).json({
            message: "Exclusion Constraint!"
        })
    }
    if(err instanceof SyntaxError && err.status == 400){
        return res.status(400).json({
            message: "Invalid JSON!"
        })
    }
    if(err.status){
        return res.status(err.status).json({
            message: err.message
        })
    }
    return res.status(500).json(console.log(err.message),{
        message: "Internal server error!"
    })
}
module.exports = errorHandler;