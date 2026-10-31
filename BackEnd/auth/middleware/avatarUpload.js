const multer = require('multer')

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error('تصویر باید با قالب JPG، PNG یا WebP باشد.')
      error.status = 400
      callback(error)
      return
    }
    callback(null, true)
  },
})

function avatarUpload(req, res, next) {
  upload.single('avatar')(req, res, (error) => {
    if (!error) return next()
    if (error instanceof multer.MulterError) {
      error.status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    }
    return next(error)
  })
}

module.exports = avatarUpload
