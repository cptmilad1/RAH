const rateLimit = require('express-rate-limit')

const authLimit = rateLimit({
    windowMs : 60 * 1000,
    max: 5,
    message : {
        message : "too many request, please try again later!"
    },
    standardHeaders: true,
    legacyHeaders: false
})

module.exports = authLimit