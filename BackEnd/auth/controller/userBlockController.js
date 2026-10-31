const { getBlockStatus, setUserBlocked } = require('../repositories/userBlockRepository')

function isValidUserId(value) {
  return /^[1-9]\d*$/.test(value || '')
}

async function getUserBlockStatus(req, res, next) {
  const targetId = req.params.id
  if (!isValidUserId(targetId)) return res.status(400).json({ message: 'شناسهٔ کاربر معتبر نیست.' })
  if (String(req.user.userId) === String(targetId)) {
    return res.status(400).json({ message: 'وضعیت مسدودسازی برای حساب خودتان در دسترس نیست.' })
  }
  try {
    const status = await getBlockStatus(req.user.userId, targetId)
    if (!status) return res.status(404).json({ message: 'کاربر پیدا نشد.' })
    return res.json({ data: status })
  } catch (error) {
    return next(error)
  }
}

async function updateUserBlock(req, res, next) {
  const targetId = req.params.id
  if (!isValidUserId(targetId)) return res.status(400).json({ message: 'شناسهٔ کاربر معتبر نیست.' })
  if (String(req.user.userId) === String(targetId)) {
    return res.status(400).json({ message: 'نمی‌توانید خودتان را مسدود کنید.' })
  }
  try {
    const isBlocked = req.method === 'PUT'
    const exists = await setUserBlocked(req.user.userId, targetId, isBlocked)
    if (!exists) return res.status(404).json({ message: 'کاربر پیدا نشد.' })
    return res.json({
      message: isBlocked ? 'کاربر مسدود شد.' : 'مسدودسازی کاربر برداشته شد.',
      data: { blockedByMe: isBlocked },
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = { getUserBlockStatus, updateUserBlock }
