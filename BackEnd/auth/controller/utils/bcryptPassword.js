const bcrypt = require('bcrypt')
function hashedPassword(password) {
    return bcrypt.hash(password, 10);
}

module.exports = hashedPassword