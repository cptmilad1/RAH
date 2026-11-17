class AppError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.statusCode = status
    this.isOperational = true
  }
}

module.exports = AppError
