const app = require('./auth/app')

const PORT = process.env.PORT || 3000

if (require.main === module) {
	app.listen(PORT, () => console.log(`API listening on port ${PORT}`))
}

module.exports = app
