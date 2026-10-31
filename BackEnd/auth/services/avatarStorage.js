const fs = require('node:fs/promises')
const path = require('node:path')
const { randomUUID } = require('node:crypto')

const avatarDirectory = path.join(__dirname, '../../uploads/avatars')
const avatarUrlPrefix = '/uploads/avatars/'

function getImageExtension(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return '.jpg'
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return '.png'
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) return '.webp'
  return null
}

async function saveAvatar(file) {
  const extension = getImageExtension(file.buffer)
  if (!extension) {
    const error = new Error('محتوای فایل انتخاب‌شده تصویر معتبر نیست.')
    error.status = 400
    throw error
  }

  await fs.mkdir(avatarDirectory, { recursive: true })
  const filename = `${randomUUID()}${extension}`
  await fs.writeFile(path.join(avatarDirectory, filename), file.buffer, { flag: 'wx' })
  return `${avatarUrlPrefix}${filename}`
}

async function removeAvatar(avatarUrl) {
  if (typeof avatarUrl !== 'string' || !avatarUrl.startsWith(avatarUrlPrefix)) return
  const filename = path.basename(avatarUrl)
  if (!filename || filename !== avatarUrl.slice(avatarUrlPrefix.length)) return
  await fs.unlink(path.join(avatarDirectory, filename)).catch((error) => {
    if (error.code !== 'ENOENT') throw error
  })
}

module.exports = { getImageExtension, saveAvatar, removeAvatar }
