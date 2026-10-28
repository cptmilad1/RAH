const { createParcel } = require('../repositories/parcelWriteRepository')
const { validateCreatePayload } = require('../services/parcelValidation')

async function createParcelHandler(req, res, next) {
  try {
    const payload = validateCreatePayload(req.body)
    const parcel = await createParcel(req.user.userId, payload)
    return res.status(201).json({ message: 'مرسوله با موفقیت ثبت شد.', data: parcel })
  } catch (error) {
    return next(error)
  }
}

module.exports = createParcelHandler
