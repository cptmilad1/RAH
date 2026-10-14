const crypto = require('crypto')

function createVerificationCode() {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

module.exports = createVerificationCode