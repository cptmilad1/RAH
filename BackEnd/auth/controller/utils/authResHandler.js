function HandleResult({ status: statusCode, data = null, message, res}) {
    return res.status(statusCode).json({
        message,
        data
    });
}
module.exports = HandleResult