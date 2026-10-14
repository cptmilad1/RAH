const bcrypt = require('bcrypt');
function Compare(password, hashedPassword) {
    return bcrypt.compare(
      password,
      hashedPassword,
    );
}

module.exports = Compare;