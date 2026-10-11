const crypto = require('crypto')
const jwt = require('jsonwebtoken')

function createAccessToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured')
  return jwt.sign(
    { userId: user.id, role: user.role, tokenVersion: user.token_version },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  )
}

function createRefreshToken(userId) {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is not configured')
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function cookieOptions(sameSite) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite,
    path: '/',
  }
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, {
    ...cookieOptions('lax'),
    maxAge: 15 * 60 * 1000,
  })
  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions('strict'),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

function clearAuthCookies(res) {
  res.clearCookie('access_token', cookieOptions('lax'))
  res.clearCookie('refresh_token', cookieOptions('strict'))
}

module.exports = { createAccessToken, createRefreshToken, hashToken, setAuthCookies, clearAuthCookies }