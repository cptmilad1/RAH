function createHttpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function requiredText(value, label, maxLength) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw createHttpError(400, `${label} را به‌درستی وارد کنید.`)
  }
  return value.trim()
}

function optionalText(value, label, maxLength) {
  if (value == null || value === '') return null
  if (typeof value !== 'string' || value.trim().length > maxLength) {
    throw createHttpError(400, `${label} بیش از حد مجاز است.`)
  }
  return value.trim() || null
}

function normalizePhoneNumber(value) {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩'
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit)
    const digitIndex = persianIndex >= 0 ? persianIndex : arabicDigits.indexOf(digit)
    return String(digitIndex)
  })
}

function normalizeProvince(value, label) {
  return requiredText(value, label, 100).normalize('NFC').replace(/\s+/g, ' ')
}

function validateCreatePayload(body) {
  const receiverName = requiredText(body?.receiver?.name, 'نام گیرنده', 100)
  const receiverPhone = normalizePhoneNumber(requiredText(body?.receiver?.phone, 'شمارهٔ گیرنده', 30))
  if (!/^\+?[\d\s()-]{7,30}$/.test(receiverPhone)) {
    throw createHttpError(400, 'شمارهٔ گیرنده معتبر نیست.')
  }

  const pickupCity = requiredText(body?.pickup?.city, 'شهر مبدأ', 100)
  const pickupProvince = normalizeProvince(body?.pickup?.province, 'ولایت مبدأ')
  const pickupAddress = requiredText(body?.pickup?.addressLine, 'آدرس مبدأ', 2000)
  const deliveryCity = requiredText(body?.delivery?.city, 'شهر مقصد', 100)
  const deliveryProvince = normalizeProvince(body?.delivery?.province, 'ولایت مقصد')
  const deliveryAddress = requiredText(body?.delivery?.addressLine, 'آدرس مقصد', 2000)
  const description = optionalText(body?.description, 'توضیحات', 2000)
  const itemName = optionalText(body?.itemName, 'نام کالا', 150)

  let weightKg = null
  if (body?.weightKg !== '' && body?.weightKg != null) {
    weightKg = Number(body.weightKg)
    if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 99999999) {
      throw createHttpError(400, 'وزن باید عددی بزرگ‌تر از صفر باشد.')
    }
  }

  let quantity = 1
  if (body?.quantity != null && body.quantity !== '') {
    quantity = Number(body.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
      throw createHttpError(400, 'تعداد کالا معتبر نیست.')
    }
  }

  return {
    receiverName,
    receiverPhone,
    pickupCity,
    pickupProvince,
    pickupAddress,
    deliveryCity,
    deliveryProvince,
    deliveryAddress,
    description,
    itemName,
    weightKg,
    quantity,
  }
}

module.exports = { createHttpError, requiredText, normalizeProvince, validateCreatePayload }
